"use client";
import { Button } from "@/components/ui/button";
import { useNodeConnections } from "@/hooks/connections-providers";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  onCreateNodesEdges,
  onFlowPublish,
} from "../_actions/workflow-connections";
import { toast } from "sonner";
import { set } from "zod";
import { useEditor } from "@/hooks/editor-provider";

type Props = {
  edges: any[];
  nodes: any[];
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
};

const SaveFlow = ({ edges, nodes, setNodes, setEdges }: Props) => {
  const pathname = usePathname();
  const { nodeConnection, } = useNodeConnections();
  const {dispatch, state } = useEditor();

  const onFlowAutomation = useCallback(async () => {
    await onAutomateFlow();
    console.log("saving flow", edges, nodes, nodeConnection.isFlow);
    const flow = await onCreateNodesEdges(
      pathname.split("/").pop()!,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      JSON.stringify(nodeConnection.isFlow)
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
    nodeConnection.setisFlow(flows);
  };

  useEffect(() => {
    onAutomateFlow();
  }, [edges]);

  const onDeleteNode = useCallback(() => {
    if (!window.confirm("Are you sure you want to delete this node and its connections?")) {
      return;
    }
  
    const selectedNodeId = state.editor.selectedNode.id;
    const updatedNodes = nodes.filter((node) => node.id !== selectedNodeId);
    const updatedEdges = edges.filter(
      (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
    );
  
    dispatch({
      type: "SELECTED_ELEMENT",
      payload: {
        element: {
          data: {
            completed: false,
            current: false,
            description: "",
            metadata: {},
            title: "",
            type: "Trigger",
          },
          id: "",
          position: { x: 0, y: 0 },
          type: "Trigger",
        },
      },
    });
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    toast.success("Node and its connections deleted successfully");
    toast.message("Please save the workflow to apply changes permanently");
  }, [nodes, edges, state.editor.selectedNode.id, setNodes, setEdges]);
  
  // ... existing code ...

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-3 w-full">
        <Button
          className="w-full"
          variant="outline"
          onClick={onFlowAutomation}
          disabled={nodeConnection.isFlow.length < 1}
        >
          Save Workflow
        </Button>
        <Button className="bg-red-400 hover:bg-red-200" onClick={onDeleteNode}>Delete Node</Button>
        {/* <Button disabled={isFlow.length < 1} onClick={onPublishWorkflow}>
          Publish
        </Button> */}
      </div>
    </div>
  );
};

export default SaveFlow;
