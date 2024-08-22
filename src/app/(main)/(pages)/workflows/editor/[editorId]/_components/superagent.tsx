import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// 09d09171-2ff7-407f-8fd5-f5e8c3fe62bb

const SuperAgent = () => {
    interface Workflow {
        id: string;
        steps: Array<{
          id: string;
          order: number;
          agentId: string;
          agent: {
            name: string;
            type: string;
            description: string;
          };
        }>;
      }
  const [inputValue, setInputValue] = useState("");
  const [workflow, setWorkflow] = useState<Workflow | null>(null);  const [workflowId, setWorkflowId] = useState("");
  const [Agents, setAgents] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");

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
    axios.post("/api/AiResponse/superagent/getsteps", {
        workflowId: inputValue,
        Agents: Agents,
        }).then((res) => {
            console.log(res.data);
            findWorkflow()
            

   })
  };
  console.log(output);
  const test = () => {
    axios.post("/api/AiResponse/superagent/getoutput", {
       prompt: prompt,
       workflowId
        }).then((res) => {
            console.log(res.data);
            setOutput(res.data.output)
            findWorkflow()
   })
  }

  const findWorkflow = () => {
    axios.post("/api/AiResponse/superagent/getworkflow", {
        workflowId: inputValue,
         }).then((res) => {
            setWorkflow(res.data.data)
            setWorkflowId(res.data.data.id)
         })
  };
  console.log(workflow);
  console.log(workflowId);

  const executeFunctionTwo = () => {};

  return (
    <div className="flex flex-col gap-3 px-6 py-3 pb-20">
      {workflowId ? (
        workflow && workflow.steps && workflow.steps[0] ? (
            <div>
            {workflow.steps.map((step, index) => (
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
              placeholder="Enter Your Prompt"
              type="text"
              value={prompt}
              onChange={handlepromptchange}
            />
            <Button variant="outline" onClick={test}>
              {" "}
              Test
            </Button>
            {output && <div>{output}</div>}
          </div>
        ) : (
          <div className="flex gap-2 flex-col">
            <p>No steps found in your workflow</p>
            <Input
              placeholder="Enter workflow ID"
              type="text"
              value={Agents}
              onChange={handleAgentChange}
            />
            <Button variant="outline" onClick={createSteps}>
              {" "}
              Create one
            </Button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Enter workflow ID"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button variant="outline" onClick={findWorkflow}>
            Search
          </Button>
          <Button variant="outline" onClick={executeFunctionTwo}>
            Create new
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuperAgent;
