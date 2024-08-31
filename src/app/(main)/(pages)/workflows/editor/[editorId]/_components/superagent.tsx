import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/providers/editor-provider";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormField } from "@/components/ui/form";
import { toast } from "sonner";
import { LLMS } from "@/lib/constants";
import AddTool from "./tools";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findDOMNode } from "react-dom";

const SuperAgent = ({ node }: { node: any }) => {
  const { selectedNode } = useEditor().state.editor;
  const methods = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const llmMethod = useForm({
    defaultValues: {
      LLM: "Select LLM",
      Apikey: "",
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
      prompt?: string; // Add optional prompt property
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
  const [workflowId, setWorkflowId] = useState("");
  const [Agents, setAgents] = useState("");
  const [prompt, setPrompt] = useState("");
  const [toggleWorkflow, settoggleWorkflow] = useState(false);
  const [toggleAgents, settoggleAgents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");
  const [llms, setLlms] = useState([]);
  const [tools, setTools] = useState<{ id: string; name: string }[]>([]);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };
  const handleAgentChange = (e: any) => {
    setAgents(e.target.value);
  };
  const handlepromptchange = (e: any) => {
    setPrompt(e.target.value);
  };
  const AddAgents = async (agentId: string) => {
    try {
      setLoading(true);
      await axios
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
        });
    } catch (error) {
      console.error("Error adding agents:", error);
      toast.error("Failed to add agents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedNode.id !== node[selectedNode.id].id) {
      setWorkflowId(node[selectedNode.id].id);
    }
    const getdata = async () => {
      try {
        setLoading(true);
        const [toolsdata, llmsdata] = await Promise.all([
          await axios.get("/api/AiResponse/superagent/tools"),
          await axios.get("/api/AiResponse/superagent/llms"),
        ]);
        setTools(toolsdata.data.data);
        setLlms(llmsdata.data.data);
        if (workflowId) {
          await findWorkflow(workflowId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getdata();
  }, []);

  console.log(tools);
  const CreateAgents = agentsMethod.handleSubmit(async (data) => {
    console.log("data", data);
    try {
      const { name, prompt } = data;
      setLoading(true);
      await axios
        .post("/api/AiResponse/superagent/createAgents", {
          name: name,
          description: name,
          prompt: prompt,
          llmProvider: "OPENAI",
          llmModel: "GPT_4_O",
        })
        .then((res) => {
          setAgents(res.data.data.id);
          AddAgents(res.data.data.id);
          toast.success("Agent created successfully");
        });
    } catch (error) {
      console.error("Error creating agents:", error);
      toast.error("Failed to create agents. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  const findWorkflow = async (id: string) => {
    try {
      setLoading(true);
      await axios
        .post("/api/AiResponse/superagent/getworkflow", {
          workflowId: id,
        })
        .then((res) => {
          setWorkflow(res.data.data);
          node[selectedNode.id] = {
            ...node[selectedNode.id],
            ...res.data.data,
          };
          setWorkflowId(res.data.data.id);
        });
    } catch (error) {
      console.error("Error fetching workflow:", error);
      toast.error("Failed to fetch workflow. Please");
    } finally {
      setLoading(false);
    }
  };

  const CreateWorkflow = methods.handleSubmit(async (data) => {
    try {
      setLoading(true);
      const { name, description } = data;
      await axios
        .post("/api/AiResponse/superagent/createWorkflow", {
          name,
          description,
        })
        .then((res) => {
          setWorkflow(res.data.data);
          node[selectedNode.id] = {
            ...node[selectedNode.id],
            ...res.data.data,
          };
          setWorkflowId(res.data.data.id);
        });
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  const gettools = async (agent: string) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/AiResponse/superagent/tools", {
        toolId: selectedTool,
        agentId: agent,
      });
      toast.success("Tools Added");
    } catch (error) {
      console.log(error);
      toast.error("Error adding tools or tool already added");
    } finally {
      setLoading(false);
    }
  };
  const addtools = (agent: string) => {
    setLoading(true);
    gettools(agent);
    setLoading(false);
  };
  const removeWorkflow = () => {
    if (confirm("Are you sure you want to remove this workflow?")) {
      setWorkflowId("");
      setWorkflow(null);
      node[selectedNode.id] = {
        model: "SuperAgent",
      };
      console.log(node[selectedNode.id]);
      toast.success("Workflow removed successfully");
    }
  };

  const Addllm = llmMethod.handleSubmit(async (data) => {

    const { LLM, Apikey } = data;
    try {
      setLoading(true);
      const response = await axios.post("/api/AiResponse/superagent/llms", {
        LLM,
        Apikey,
      });
      const llms = await axios.get("/api/AiResponse/superagent/llms");
      setLlms(llms.data.data);
      toast.success("LLM added successfully");
    } catch (error) {
      console.error("Error adding LLM:", error);
      toast.error("Failed to add LLM. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      ) : (
        <div className="flex flex-col gap-3 px-6 py-3">
          {workflowId ? (
            <>
              {node[selectedNode.id] && (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-lg">
                    {node[selectedNode.id].name}
                  </p>
                  <p className="text-sm from-neutral-300 font-regular">
                    {node[selectedNode.id].description}
                  </p>
                  <p>SId : {node[selectedNode.id].id}</p>
                  <Button
                    onClick={() => {
                      removeWorkflow();
                    }}
                    variant="outline"
                  >
                    Add New Workflow
                  </Button>
                </div>
              )}
              {node[selectedNode.id] &&
                node[selectedNode.id].steps &&
                node[selectedNode.id].steps.length > 0 && (
                  <div>
                    {node[selectedNode.id].steps.map(
                      (step: Step, index: number) => (
                        <div key={step.id} className="mb-4 flex flex-col gap-3">
                          <div>
                            <p>Step: {step.order}</p>
                            <p>
                              {step.agent.name} - {step.agent.type}
                            </p>
                            <p className="text-sm font-extralight">
                              StepId : {step.id}
                            </p>
                            <p className="text-sm font-extralight">
                              Agent ID: {step.agentId}
                            </p>
                            <p className="text-sm font-extralight">
                              Prompt: {step.agent.prompt}
                            </p>
                          </div>
                          <Select
                            onValueChange={(value) => setSelectedTool(value)}
                          >
                            <SelectTrigger>
                              <SelectValue>
                                {selectedTool
                                  ? tools.find(
                                      (tool) => tool.id === selectedTool
                                    )?.name
                                  : "Select tool type"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {tools?.map(
                                (tool: { id: string; name: string }) => (
                                  <SelectItem key={tool.id} value={tool.id}>
                                    {tool.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2 justify-center items-center">
                            {" "}
                            <Button
                              onClick={() => addtools(step.agentId)}
                              variant="outline"
                            >
                              Add Tools
                            </Button>{" "}
                            <AddTool setTools={setTools} />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              {llms.length > 0 ? (
                !toggleAgents ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      placeholder="AgentId"
                      type="text"
                      value={Agents}
                      onChange={handleAgentChange}
                    />
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => AddAgents(Agents)}
                    >
                      Add Agents
                    </Button>
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => settoggleAgents((prev) => !prev)}
                    >
                      Don{"'"}t have a Agent? Create one!
                    </Button>
                    ADD LLMS
                    <FormProvider {...llmMethod}>
                      <form className="flex flex-col gap-2" onSubmit={Addllm}>
                        <FormItem>
                          <FormField
                            name="LLM"
                            render={({ field }) => (
                              <select
                                {...field}
                                className="border rounded w-full p-2"
                              >
                                <option disabled value="Select LLM">
                                  Select llm
                                </option>
                                {LLMS.map((llm: any) => (
                                  <option key={llm} value={llm}>
                                    {llm}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </FormItem>
                        <FormItem>
                          <FormField
                            name="Apikey"
                            render={({ field }) => (
                              <Input
                                {...field}
                                required
                                placeholder="Enter api key"
                              />
                            )}
                          />
                        </FormItem>
                        <Button onClick={Addllm} type="submit">
                          Add LLm
                        </Button>
                      </form>
                    </FormProvider>
                  </div>
                ) : (
                  <FormProvider {...agentsMethod}>
                    <form
                      className="flex flex-col gap-2"
                      onSubmit={CreateAgents}
                    >
                      <FormItem>
                        <FormField
                          name="name"
                          render={({ field }) => (
                            <Input
                              {...field}
                              required
                              placeholder="Enter Name"
                            />
                          )}
                        />
                      </FormItem>
                      <FormItem>
                        <FormField
                          name="prompt"
                          render={({ field }) => (
                            <Input
                              {...field}
                              required
                              placeholder="Enter prompt"
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
                )
              ) : (
                <div>
                  <p>No llms Available</p>
                  <FormProvider {...llmMethod}>
                    <form className="flex flex-col gap-2" onSubmit={Addllm}>
                      <FormItem>
                        <FormField
                          name="LLM"
                          render={({ field }) => (
                            <select
                              {...field}
                              className="border rounded w-full p-2"
                            >
                              <option disabled value="Select LLM">
                                Select llm
                              </option>
                              {LLMS.map((llm: any) => (
                                <option key={llm} value={llm}>
                                  {llm}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </FormItem>
                      <FormItem>
                        <FormField
                          name="Apikey"
                          render={({ field }) => (
                            <Input
                              {...field}
                              required
                              placeholder="Enter api key"
                            />
                          )}
                        />
                      </FormItem>
                      <Button onClick={Addllm} type="submit">
                        Add LLm
                      </Button>
                    </form>
                  </FormProvider>
                </div>
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
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={CreateWorkflow}
                  >
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
        </div>
      )}
    </>
  );
};

export default SuperAgent;
