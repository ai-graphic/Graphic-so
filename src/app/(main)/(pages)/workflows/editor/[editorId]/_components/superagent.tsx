import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/providers/editor-provider";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormField } from "@/components/ui/form";
import { toast } from "sonner";
// 09d09171-2ff7-407f-8fd5-f5e8c3fe62bb

const SuperAgent = ({ node }: { node: any }) => {
  const { selectedNode } = useEditor().state.editor;
  const methods = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const agentsMethod = useForm({
    defaultValues: {
      name: "",
      description: "",
      initialMessage: "",
      prompt: "",
      llmProvider: "OPENAI",
      llmModel: "GPT_4_O",
    },
  });
  interface Step {
    id: string;
    order: number;
    agentId: string;
    agent: {
      name: string;
      type: string;
      description: string;
    };
  }
  interface Workflow {
    id: string;
    steps: Step[];
  }

  const [inputValue, setInputValue] = useState("");
  const [workflow, setWorkflow] = useState<Workflow | null>(
    node[selectedNode.id]
  );
  const [workflowId, setWorkflowId] = useState(node[selectedNode.id].id);
  const [Agents, setAgents] = useState("");
  const [prompt, setPrompt] = useState("");
  const [toggleWorkflow, settoggleWorkflow] = useState(false);
  const [toggleAgents, settoggleAgents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };
  const handleAgentChange = (e: any) => {
    setAgents(e.target.value);
  };
  const handlepromptchange = (e: any) => {
    setPrompt(e.target.value);
  };
  const AddAgents = (agentId : string) => {
    setLoading(true);
    axios
      .post("/api/AiResponse/superagent/addAgents", {
        workflowId: workflowId,
        Agents: agentId,
        steps: node[selectedNode.id].steps
          ? node[selectedNode.id].steps.length
          : 0,
      })
      .then((res) => {
        console.log(res.data);
        if (workflowId) {
          findWorkflow(workflowId);
        } else {
          toast.error("Please create a workflow first");
        }
        setLoading(false);
      });
  };
  const [tools, setTools] = useState([]);

  useEffect(() => {
    const gettools = async () => {
      const response = await axios.get("/api/AiResponse/superagent/tools");
      setTools(response.data.data);
    };

    gettools();
  }, []);
  console.log(tools);
  const CreateAgents = agentsMethod.handleSubmit((data) => {
    console.log("data", data);
    const { name, description, initialMessage, prompt } = data;
    setLoading(true);
    axios
      .post("/api/AiResponse/superagent/createAgents", {
        name: name,
        description: description,
        initialMessage: initialMessage,
        prompt: prompt,
        llmProvider: "OPENAI",
        llmModel: "GPT_4_O",
      })
      .then((res) => {
        setAgents(res.data.data.id);
        console.log(res.data.data.id);
        console.log(Agents);
        AddAgents(res.data.data.id);
        setLoading(false);
      });
  });

  const findWorkflow = (id: string) => {
    setLoading(true);
    axios
      .post("/api/AiResponse/superagent/getworkflow", {
        workflowId: id,
      })
      .then((res) => {
        setWorkflow(res.data.data);
        node[selectedNode.id] = { ...node[selectedNode.id], ...res.data.data };
        setWorkflowId(res.data.data.id);
        setLoading(false);
        console.log(res.data.data);
      });
  };
  const CreateWorkflow = methods.handleSubmit((data) => {
    console.log("data", data);
    setLoading(true);
    const { name, description } = data;
    axios
      .post("/api/AiResponse/superagent/createWorkflow", {
        name,
        description,
      })
      .then((res) => {
        setWorkflow(res.data.data);
        node[selectedNode.id] = { ...node[selectedNode.id], ...res.data.data };
        setWorkflowId(res.data.data.id);
        setLoading(false);
      });
  });
  const gettools = async (agent: string) => {
    try {
      const response = await axios.post("/api/AiResponse/superagent/tools", {
        toolId: selectedTool,
        agentId: agent,
      });
      console.log("addtools", response.data);
      setTools(response.data.data);
      toast.success("Tools Added");
    } catch (error) {
      console.log(error);
      toast.error("Error adding tools or tool already added");
    }
  };
  const addtools = (agent: string) => {
    setLoading(true);
    console.log(selectedTool);

    gettools(agent);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 px-6 py-3">
      {workflowId ? (
        <>
          {node[selectedNode.id] && (
            <div>
              <p className="font-bold text-lg">{node[selectedNode.id].name}</p>
              <p className="text-sm from-neutral-300 font-regular">
                {node[selectedNode.id].description}
              </p>
              <p>Id : {node[selectedNode.id].id}</p>
            </div>
          )}
          {node[selectedNode.id] &&
            node[selectedNode.id].steps &&
            node[selectedNode.id].steps.length > 0 && (
              <div>
                {node[selectedNode.id].steps.map(
                  (step: Step, index: number) => (
                    <div key={step.id} className="mb-4">
                      <div>Step: {step.order}</div>
                      <div>ID: {step.id}</div>

                      <div>Agent ID: {step.agentId}</div>
                      <div>Agent Name: {step.agent.name}</div>
                      <div>Agent Type: {step.agent.type}</div>
                      <div>Description: {step.agent.description}</div>
                      <select
                        name="tools"
                        id="tools"
                        onChange={(e) => setSelectedTool(e.target.value)}
                      >
                        {tools?.map((tool: { id: string; name: string }) => (
                          <option key={tool.id} value={tool.id}>
                            {tool.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => addtools(step.agentId)}
                        variant="outline"
                      >
                        Add Tools
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

          {!toggleAgents ? (
            <div className="flex flex-col ">
              <Input
                placeholder="AgentId"
                type="text"
                value={Agents}
                onChange={handleAgentChange}
              />
              <Button className="mt-2" variant="outline" onClick={() => AddAgents(Agents)}>
                Add Agents
              </Button>
              <Button
                className="mt-2"
                variant="outline"
                onClick={() => settoggleAgents((prev) => !prev)}
              >
                Don{"'"}t have a Agent? Create one!
              </Button>
            </div>
          ) : (
            <FormProvider {...agentsMethod}>
              <form className="flex flex-col gap-2" onSubmit={CreateAgents}>
                <FormItem>
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <Input {...field} required placeholder="Enter Name" />
                    )}
                  />
                </FormItem>
                <FormItem>
                  <FormField
                    name="description"
                    render={({ field }) => (
                      <Input
                        {...field}
                        required
                        placeholder="Enter Description"
                      />
                    )}
                  />
                </FormItem>
                <FormItem>
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <Input {...field} required placeholder="Enter prompt" />
                    )}
                  />
                </FormItem>
                <FormItem>
                  <FormField
                    name="initialMessage"
                    render={({ field }) => (
                      <Input
                        {...field}
                        required
                        placeholder="Enter initialMessage"
                      />
                    )}
                  />
                </FormItem>
                <Button onClick={CreateAgents} type="submit">
                  Add Agents
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => settoggleAgents((prev) => !prev)}
                >
                  Go Back
                </Button>
              </form>
            </FormProvider>
          )}
        </>
      ) : (
        <div>
          {!toggleWorkflow ? (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Enter workflow ID"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
              />
              <Button
                variant="outline"
                onClick={() => findWorkflow(inputValue)}
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => settoggleWorkflow((prev) => !prev)}
              >
                Don{"'"}t have a workflow? Create one!
              </Button>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form className="flex flex-col gap-2" onSubmit={CreateWorkflow}>
                <FormItem>
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <Input {...field} required placeholder="Enter Name" />
                    )}
                  />
                </FormItem>
                <FormItem>
                  <FormField
                    name="description"
                    render={({ field }) => (
                      <Input
                        {...field}
                        required
                        placeholder="Enter Description"
                      />
                    )}
                  />
                </FormItem>
                <Button type="submit">Create New</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => settoggleWorkflow((prev) => !prev)}
                >
                  Go Back
                </Button>
              </form>
            </FormProvider>
          )}
        </div>
      )}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      )}
    </div>
  );
};

export default SuperAgent;
