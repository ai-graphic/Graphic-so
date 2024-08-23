import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/providers/editor-provider";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormField } from "@/components/ui/form";
// 09d09171-2ff7-407f-8fd5-f5e8c3fe62bb

const SuperAgent = ({ node }: { node: any }) => {
  const { selectedNode } = useEditor().state.editor;
  const methods = useForm({
    defaultValues: {
      name: "",
      description: "",
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
  const [workflowId, setWorkflowId] = useState(node[selectedNode.id]?.id);
  const [Agents, setAgents] = useState("");
  const [prompt, setPrompt] = useState("");
  const [toggle, settoggle] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };
  const handleAgentChange = (e: any) => {
    setAgents(e.target.value);
  };
  const handlepromptchange = (e: any) => {
    setPrompt(e.target.value);
  };
  const createSteps = () => {
    setLoading(true);
    axios
      .post("/api/AiResponse/superagent/getsteps", {
        workflowId: workflowId,
        Agents: Agents,
        steps: node[selectedNode.id].steps? node[selectedNode.id].steps.length : 0,
      })
      .then((res) => {
        console.log(res.data);
        findWorkflow(workflowId);
        setLoading(false);
      });
  };

  const findWorkflow = (id : string) => {
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

  return (
    <div className="flex flex-col gap-3 px-6 py-3">
      {workflowId ? (
        node[selectedNode.id] && node[selectedNode.id].steps && node[selectedNode.id].steps[0] ? (
          <div>
            {node[selectedNode.id].steps.map((step : Step, index: number) => (
              <div key={step.id} className="mb-4">
                <div>Step {index + 1}</div>
                <div>ID: {step.id}</div>
                <div>Order: {step.order}</div>
                <div>Agent ID: {step.agentId}</div>
                <div>Agent Name: {step.agent.name}</div>
                <div>Agent Type: {step.agent.type}</div>
                <div>Description: {step.agent.description}</div>
              </div>
            ))}
            <Input
              placeholder="AgentId"
              type="text"
              value={Agents}
              onChange={handleAgentChange}
            />
            <Button className="mt-2" variant="outline" onClick={createSteps}>
              {" "}
              Create Step
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 flex-col">
            {node[selectedNode.id] && (
              <div>
                <p>node Name: {node[selectedNode.id].name}</p>
                <p>Description: {node[selectedNode.id].description}</p>
                <p>node ID: {node[selectedNode.id].id}</p>
              </div>
            )}
            <p className="text-orange-400">No Agents found in your workflow</p>

            <Input
              placeholder="AgentId"
              type="text"
              value={Agents}
              onChange={handleAgentChange}
            />
            <Button variant="outline" onClick={createSteps}>
              {" "}
              Add Agent
            </Button>
          </div>
        )
      ) : (
        <div>
          {!toggle ? (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Enter workflow ID"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
              />
              <Button variant="outline" onClick={() => findWorkflow(inputValue)}>
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => settoggle((prev) => !prev)}
              >
                Dont have a workflow? Create one!!
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
                <Button type="submit" variant="outline">
                  Create new
                </Button>
                <Button
                  variant="outline"
                  type="button" // Explicitly set as type button to prevent form submission
                  onClick={() => settoggle((prev) => !prev)}
                >
                  go back
                </Button>
              </form>
            </FormProvider>
          )}
        </div>
      )}
      {loading && (<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>)}
    </div>
  );
};

export default SuperAgent;
