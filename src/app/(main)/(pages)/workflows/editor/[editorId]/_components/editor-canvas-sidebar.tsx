"use client";

import { EditorCanvasTypes, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import { useNodeConnections } from "@/providers/connections-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CONNECTIONS, EditorCanvasDefaultCardTypes } from "@/lib/constants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EditorCanvasIconHelper from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas-icon-helper";
import {
  fetchBotSlackChannels,
  onConnections,
  onDragStart,
} from "@/lib/editor-utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RenderConnectionAccordion from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/render-connection-accordion";
import RenderOutputAccordion from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/render-output-accordion";
import { usegraphicStore } from "@/store";
import { useEffect, useState } from "react";
import ApikeyCard from "@/components/ui/ApiKeys-card";
import Chat from "./chat";

type Props = {
  nodes: EditorNodeType[];
  addNodeAtPosition: (type: EditorCanvasTypes) => void;
  edges: any;
  setNodes: (nodes: EditorNodeType[]) => void;
  setEdges: (edges: any) => void;
};
const EditorCanvasSidebar = ({ nodes, addNodeAtPosition, edges, setNodes, setEdges }: Props) => {
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const { googleFile, setSlackChannels } = usegraphicStore();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (state) {
      onConnections(nodeConnection, state, googleFile);
    }
  }, [state]);

  useEffect(() => {
    if (nodeConnection.slackNode.slackAccessToken) {
      fetchBotSlackChannels(
        nodeConnection.slackNode.slackAccessToken,
        setSlackChannels
      );
    }
  }, [nodeConnection])

  useEffect(() => {
    setIsFirstLoad(false);
  }, []);


  return (
    <aside className="overflow-hidden">
     <Tabs defaultValue={isFirstLoad ? "actions" : "settings"} className="h-screen overflow-scroll">
        <TabsList className="bg-transparent">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        <Separator />
        <TabsContent value="actions" className="flex flex-col gap-4 p-4 mb-16">
          <h1>Triggers</h1>
          {Object.entries(EditorCanvasDefaultCardTypes)
            .filter(([_, cardType]) => {
              const types = Array.isArray(cardType.type)
                ? cardType.type
                : [cardType.type];
              return types.includes("Trigger");
            })
            .map(([cardKey, cardValue]) => {
              const isDisabled = nodes.some((node) => node.type === cardKey);
              return (
                <Card
                  key={cardKey}
                  draggable={!isDisabled}
                  className={`w-full cursor-${
                    isDisabled ? "not-allowed" : "grab"
                  } border-black bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 ${
                    isDisabled ? "opacity-50" : ""
                  }`}
                  onDragStart={(event) => {
                    if (!isDisabled) {
                      onDragStart(event, cardKey as EditorCanvasTypes);
                    }
                  }}
                  onClick={() => {
                    if (!isDisabled) {
                      console.log("Adding node:", cardKey);
                      addNodeAtPosition(cardKey as EditorCanvasTypes);
                    } else {
                      console.log(
                        "This type of element is already in the nodes, thus disabled."
                      );
                    }
                  }}
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <EditorCanvasIconHelper
                      type={cardKey as EditorCanvasTypes}
                    />
                    <CardTitle className="text-md">
                      {cardKey}
                      <CardDescription>{cardValue.description}</CardDescription>
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          <h1>Actions</h1>
          {Object.entries(EditorCanvasDefaultCardTypes)
            .filter(([_, cardType]) => {
              const types = Array.isArray(cardType.type)
                ? cardType.type
                : [cardType.type];
              return types.includes("Action");
            })
            .map(([cardKey, cardValue]) => (
              <Card
                key={cardKey}
                draggable
                className="w-full cursor-grab border-black bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
                onDragStart={(event) =>
                  onDragStart(event, cardKey as EditorCanvasTypes)
                }
                onClick={() => addNodeAtPosition(cardKey as EditorCanvasTypes)}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <EditorCanvasIconHelper type={cardKey as EditorCanvasTypes} />
                  <CardTitle className="text-md">
                    {cardKey}
                    <CardDescription>{cardValue.description}</CardDescription>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>
        {state.editor.selectedNode.data.title ? (
          <TabsContent value="settings" className="-mt-20">
            {state.editor.selectedNode.data.title === "Chat" ? (      
                <Chat />
            ) : (
              <div>
                <div className="px-2 py-4 text-center text-xl font-bold">
                  <p>{state.editor.selectedNode.data.title}</p>
                  <p className="block text-sm font-medium text-gray-500">
                    {state.editor.selectedNode.id}
                  </p>
                </div>

                <Accordion
                  type="multiple"
                  className="h-full"
                  defaultValue={["Expected Output"]}
                >
                  {" "}
                  <AccordionItem
                    value="options"
                    className="border-y-[1px] px-2"
                  >
                    {state.editor.selectedNode.data.title === "AI" ? (
                      <div>
                        <AccordionTrigger className="!no-underline">
                          Account
                        </AccordionTrigger>
                        <AccordionContent>
                          <ApikeyCard />
                        </AccordionContent>
                      </div>
                    ) : (
                      <div>
                        <AccordionTrigger className="!no-underline">
                          Account
                        </AccordionTrigger>
                        <AccordionContent>
                          {CONNECTIONS.map((connection) => (
                            <RenderConnectionAccordion
                              key={connection.title}
                              state={state}
                              connection={connection}
                            />
                          ))}
                        </AccordionContent>
                      </div>
                    )}
                  </AccordionItem>
                  <AccordionItem value="Expected Output" className="px-2">
                    <AccordionTrigger className="!no-underline">
                      Action
                    </AccordionTrigger>
                    <RenderOutputAccordion
                      nodes={nodes}
                      edges={edges}
                      state={state}
                      nodeConnection={nodeConnection}
                      setNodes={setNodes}
                      setEdges={setEdges}
                    />
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </TabsContent>
        ) : (
          <p className="text-gray-600 text-center mt-4">
            Select a node to view settings
          </p>
        )}
      </Tabs>
    </aside>
  );
};
export default EditorCanvasSidebar;
