"use client";
import { EditorCanvasCardType, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import { MenuIcon } from "lucide-react";
import "reactflow/dist/style.css";
import EditorCanvasCardSingle from "./editor-canvas-card-single";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { v4 } from "uuid";
import { EditorCanvasDefaultCardTypes } from "@/lib/constants";
import FlowInstance from "./flow-instance";
import EditorCanvasSidebar from "./editor-canvas-sidebar";
import { onGetNodesEdges } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { useNodeConnections } from "@/providers/connections-providers";
import { getworkflow } from "../_actions/workflow-connections";

type Props = {};

const initialNodes: EditorNodeType[] = [];

const initialEdges: { id: string; source: string; target: string }[] = [];

const EditorCanvas = (props: Props) => {
  const { dispatch, state } = useEditor();
  const [nodes, setNodes] = useState(initialNodes);
  const { nodeConnection } = useNodeConnections();
  const { addAINode } = nodeConnection;
  const [edges, setEdges] = useState(initialEdges);
  const [isWorkFlowLoading, setIsWorkFlowLoading] = useState<boolean>(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const pathname = usePathname();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth);
  const [workflow, setWorkflow] = useState<any>();

  useEffect(() => {
    const fetchWorkflow = async () => {
      let workflow = await getworkflow(pathname.split("/").pop()!);
      setWorkflow(workflow);
      const aiTemplate = workflow?.AiTemplate
        ? JSON.parse(workflow.AiTemplate)
        : {};
      Object.keys(aiTemplate).forEach((nodeId) => {
        const nodeData = aiTemplate[nodeId];
        console.log("hello", nodeData);

        if (!nodeConnection.aiNode[nodeId] && nodeData.model) {
          nodeConnection.aiNode[nodeId] = {
            id: nodeId,
            ApiKey: "",
            prompt: "",
            model: "",
            localModel: "",
            output: "",
            temperature: 0,
            maxTokens: 0,
            endpoint: "",
            num_outputs: 0,
            aspect_ratio: "",
            output_format: "",
            guidance_scale: 0,
            output_quality: 0,
            num_inference_steps: 0,
            model_name: "",
            hf_token: "",
            steps: 0,
            learning_rate: 0,
            batch_size: 0,
            resolution: "",
            lora_linear: false,
            lora_linear_alpha: 0,
            repo_id: "",
            images: "",
          };
        }

        if (nodeData.model === "SuperAgent") {
          // If model is SuperAgent, save the entire nodeData
          nodeConnection.aiNode[nodeId] = nodeData;
        } else {
          // Otherwise, update selectively
          nodeConnection.aiNode[nodeId] = {
            ...nodeConnection.aiNode[nodeId], // Preserve existing data
            model: nodeData.model,
            ApiKey: nodeData.ApiKey,
            prompt: nodeData.prompt,
            localModel: nodeData.localModel,
            temperature: nodeData.temperature,
            maxTokens: nodeData.maxTokens,
            endpoint: nodeData.endpoint,
            num_outputs: nodeData.num_outputs,
            aspect_ratio: nodeData.aspect_ratio,
            output_format: nodeData.output_format,
            guidance_scale: nodeData.guidance_scale,
            output_quality: nodeData.output_quality,
            num_inference_steps: nodeData.num_inference_steps,
            model_name: nodeData.model_name,
            hf_token: nodeData.hf_token,
            // Add other parameters as needed
          };
        }
      });
      console.log("Updated nodeConnection:", nodeConnection);
    };

    fetchWorkflow();
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth);
  }, [window.innerWidth]);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      //@ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      //@ts-ignore
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type: EditorCanvasCardType["type"] = event.dataTransfer.getData(
        "application/reactflow"
      );

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const triggerAlreadyExists = state.editor.elements.find(
        (node) => node.type === "Trigger"
      );

      if (type === "Trigger" && triggerAlreadyExists) {
        toast("Only one trigger can be added to automations at the moment");
        return;
      }
      if (!reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: v4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type: type,
        },
      };
      //@ts-ignore
      setNodes((nds) => nds.concat(newNode));
      addAINode(newNode.id);
      toast("Node added successfully");
    },
    [reactFlowInstance, state]
  );
  const addNodeAtPosition = useCallback(
    (type: EditorCanvasCardType["type"]) => {
      if (!reactFlowInstance) return;

      const triggerAlreadyExists = state.editor.elements.find(
        (node) => node.type === "Trigger"
      );

      if (type === "Trigger" && triggerAlreadyExists) {
        toast("Only one trigger can be added to automations at the moment");
        return;
      }
      const lastNode = state.editor.elements[state.editor.elements.length - 1];
      const position = lastNode
        ? { x: lastNode.position.x, y: lastNode.position.y + 200 }
        : { x: 100, y: 100 };

      const newNode = {
        id: v4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type: type,
        },
      };
      //@ts-ignore
      setNodes((nds) => nds.concat(newNode));
      addAINode(newNode.id);
      toast("Node added successfully");
    },
    [reactFlowInstance, state]
  );

  const handleClickCanvas = () => {
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
  };

  useEffect(() => {
    dispatch({ type: "LOAD_DATA", payload: { edges, elements: nodes } });
  }, [nodes, edges]);

  useEffect(() => {
    toast.warning("Save the template before leaving");
  }, [state.editor.selectedNode.id]);

  const nodeTypes = useMemo(
    () => ({
      Chat: EditorCanvasCardSingle,
      Trigger: EditorCanvasCardSingle,
      Email: EditorCanvasCardSingle,
      Condition: EditorCanvasCardSingle,
      AI: EditorCanvasCardSingle,
      Slack: EditorCanvasCardSingle,
      "Google Drive": EditorCanvasCardSingle,
      Notion: EditorCanvasCardSingle,
      Discord: EditorCanvasCardSingle,
      "Custom Webhook": EditorCanvasCardSingle,
      "Google Calendar": EditorCanvasCardSingle,
      Wait: EditorCanvasCardSingle,
    }),
    []
  );
  const onGetWorkFlow = useCallback(async () => {
    setIsWorkFlowLoading(true);
    const editorId = pathname.split("/").pop();
    if (!editorId) return;
    const response = await onGetNodesEdges(editorId);
    if (response) {
      setEdges(JSON.parse(response.edges!));
      setNodes(JSON.parse(response.nodes!));
    }
    setIsWorkFlowLoading(false);
  }, [pathname]);

  useEffect(() => {
    onGetWorkFlow();
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full items-center justify-center">
          <div
            style={{ width: "100%", height: "100%", paddingBottom: "70px" }}
            className="relative"
          >
            {isWorkFlowLoading && isPanelOpen && isMobile > 726 ? (
              <div className="absolute flex h-full w-full items-center justify-center">
                <svg
                  aria-hidden="true"
                  className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : (
              <ReactFlow
                className="w-[300px]"
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodes={state.editor.elements}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                fitView
                onClick={handleClickCanvas}
                nodeTypes={nodeTypes}
              >
                {isMobile < 726 ? (
                  <Controls position="bottom-right" />
                ) : (
                  <Controls position="top-right" />
                )}
                {!(isMobile < 726) && (
                  <MiniMap
                    position="bottom-left"
                    className="!bg-background"
                    zoomable
                    pannable
                  />
                )}

                <Background
                  //@ts-ignore
                  variant="dots"
                  gap={30}
                  size={1}
                />
              </ReactFlow>
            )}
          </div>
        </div>
      </ResizablePanel>

      {isMobile < 726 ? (
        <button
          onClick={togglePanel}
          className="absolute right-0 z-50 m-2 p-2 bg-black text-white rounded"
        >
          <MenuIcon />
        </button>
      ) : (
        <ResizableHandle />
      )}
      <ResizablePanel
        defaultSize={isMobile < 726 ? 5000 : 50}
        className={`relative sm:block ${
          isMobile < 726 && !isPanelOpen ? "hidden" : ""
        }`}
      >
        {isWorkFlowLoading ? (
          <div className="absolute flex h-full w-full items-center justify-center">
            <svg
              aria-hidden="true"
              className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        ) : (
          <div className="flex flex-col max-md:pt-12 pt-4">
            <EditorCanvasSidebar
              nodes={nodes}
              addNodeAtPosition={addNodeAtPosition}
              edges={edges}
            />
            </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default EditorCanvas;
