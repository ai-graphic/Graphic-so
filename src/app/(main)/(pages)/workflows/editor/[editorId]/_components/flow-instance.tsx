"use client";
import { Button } from "@/components/ui/button";
import { useNodeConnections } from "@/providers/connections-providers";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  onCreateNodesEdges,
  onFlowPublish,
} from "../_actions/workflow-connections";
import { toast } from "sonner";

type Props = {
  edges: any[];
  nodes: any[];
};

const FlowInstance = ({ edges, nodes }: Props) => {
  const pathname = usePathname();
  const [isFlow, setIsFlow] = useState([]);
  const { nodeConnection } = useNodeConnections();

  const onFlowAutomation = useCallback(async () => {
    const flow = await onCreateNodesEdges(
      pathname.split("/").pop()!,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      JSON.stringify(isFlow)
    );

    if (flow) toast.message(flow.message);
  }, [nodeConnection]);

  // const onPublishWorkflow = useCallback(async () => {
  //   const response = await onFlowPublish(pathname.split("/").pop()!, true);
  //   if (response) toast.message(response);
  // }, []);

  const onAutomateFlow = async () => {
    const flows: any = [];
    const connectedEdges = edges.map((edge) => edge.target);
    connectedEdges.map((target) => {
      nodes.map((node) => {
        if (node.id === target) {
          flows.push(node.id, node.type);
        }
      });
    });
    setIsFlow(flows);
  };

  useEffect(() => {
    onAutomateFlow();
  }, [edges]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-3 w-full">
        <Button className="w-full" variant="outline" onClick={onFlowAutomation} disabled={isFlow.length < 1}>
          Save Workflow
        </Button>
        {/* <Button disabled={isFlow.length < 1} onClick={onPublishWorkflow}>
          Publish
        </Button> */}
      </div>
    </div>
  );
};

export default FlowInstance;
