"use client";
import { EditorCanvasCardType, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/hooks/editor-provider";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  NodeChange,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlow,
  MarkerType,
  reconnectEdge,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MenuIcon } from "lucide-react";
import CanvasCardSingle from "./canvasCardSingle";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { v4 } from "uuid";
import { EditorCanvasDefaultCardTypes } from "@/lib/constants";
import EditorCanvasSidebar from "./editor-canvas-sidebar";
import { onGetNodesEdges } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { useNodeConnections } from "@/hooks/connections-providers";
import "./index.css";

const initialNodes: EditorNodeType[] = [];

const initialEdges: { id: string; source: string; target: string }[] = [];

const EditorCanvas = (workflow: any, setworkflow: any) => {
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

  useEffect(() => {
    const nodes = JSON.parse(workflow.workflow?.nodes);
    const chatNode = nodes?.find((node: any) => node.type === "Chat");
    if (chatNode) {
      dispatch({
        type: "SELECTED_ELEMENT",
        payload: {
          element: chatNode,
        },
      });
    }
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

  const onConnect = useCallback((params: Edge | Connection) => {
    const newEdge = {
      ...params,
      id: `${params.source}->${params.target}`,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#95679e",
      },
      style: {
        strokeWidth: 2,
        stroke: "#95679e",
      },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

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
      addAINode(newNode.id, newNode.type);
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
        : { x: isMobile < 726 ? 10 : 200, y: 100 };

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
      addAINode(newNode.id, newNode.type);
      toast("Node added successfully");
      reactFlowInstance.setCenter(position.x, position.y, {
        duration: 1000,
        zoom: 0.8,
      });
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

  const nodeTypes = useMemo(
    () => ({
      Chat: CanvasCardSingle,
      Trigger: CanvasCardSingle,
      Email: CanvasCardSingle,
      Condition: CanvasCardSingle,
      "flux-dev": CanvasCardSingle,
      "image-to-image": CanvasCardSingle,
      "flux-lora": CanvasCardSingle,
      "stable-video": CanvasCardSingle,
      "CogVideoX-5B": CanvasCardSingle,
      musicGen: CanvasCardSingle,
      "train-flux": CanvasCardSingle,
      "consistent-character": CanvasCardSingle,
      dreamShaper: CanvasCardSingle,
      fluxGeneral: CanvasCardSingle,
      fluxDevLora: CanvasCardSingle,
      AI: CanvasCardSingle,
      Slack: CanvasCardSingle,
      "Google Drive": CanvasCardSingle,
      Notion: CanvasCardSingle,
      Discord: CanvasCardSingle,
      "Custom Webhook": CanvasCardSingle,
      "Google Calendar": CanvasCardSingle,
      Wait: CanvasCardSingle,
      "video-to-video": CanvasCardSingle,
      "lumalabs-ImageToVideo": CanvasCardSingle,
      "lumalabs-TextToVideo": CanvasCardSingle,
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

  const edgeReconnectSuccessful = useRef(true);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    []
  );

  const onReconnectEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
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
                onClick={handleClickCanvas}
                fitView={nodes?.length === 1}
                nodeTypes={nodeTypes}
                snapToGrid
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
              >
                <Background
                  //@ts-ignore
                  variant="dots"
                  gap={30}
                  size={1}
                />
                <Controls showInteractive={false} />
                <svg>
                  <defs>
                    <linearGradient id="edge-gradient">
                      <stop offset="0%" stopColor="#ae53ba" />
                      <stop offset="100%" stopColor="#2a8af6" />
                    </linearGradient>

                    <marker
                      id="edge-circle"
                      viewBox="-5 -5 10 10"
                      refX="0"
                      refY="0"
                      markerUnits="strokeWidth"
                      markerWidth="10"
                      markerHeight="10"
                      orient="auto"
                    >
                      <circle
                        stroke="#2a8af6"
                        strokeOpacity="0.75"
                        r="2"
                        cx="0"
                        cy="0"
                      />
                    </marker>
                  </defs>
                </svg>
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
              setNodes={setNodes}
              setEdges={setEdges}
            />
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default EditorCanvas;
