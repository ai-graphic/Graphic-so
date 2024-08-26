import { EditorCanvasCardType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { use, useEffect, useMemo, useState } from "react";
import { Position, SelectionMode, useNodeId } from "reactflow";
import EditorCanvasIconHelper from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas-icon-helper";
import CustomHandle from "./custom-handle";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";
import { useNodeConnections } from "@/providers/connections-providers";
import { useLoading } from "@/providers/loading-provider";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Button } from "@/components/ui/button";
import { MousePointerClickIcon } from "lucide-react";
import axios, { AxiosResponse } from "axios";
import { db } from "@/lib/db";
import { usePathname } from "next/navigation";
import { getworkflow } from "../_actions/workflow-connections";
import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";

type Props = {};
type LatestOutputsType = {
  [key: string]: string; 
};

const EditorCanvasCardSingle = ({ data }: { data: EditorCanvasCardType }) => {
  const { dispatch, state } = useEditor();
  const nodeId = useNodeId();
  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />;
  }, [data]);
  const { isLoading, setIsLoading } = useLoading();
  const { nodeConnection } = useNodeConnections();
  const [triggerValue, setTriggerValue] = useState(
    nodeConnection.triggerNode.triggerValue
  );
  const pathname = usePathname();
  const [output, setOutput] = useState<any>("");
  type OutputType = {
    [key: string]: any;
  };
  const isSelected = useMemo(() => {
    return state.editor.selectedNode.id === nodeId;
  }, [state.editor.elements, nodeId]);

  useEffect(() => {
    const outputsObject = nodeConnection.aiNode.output as OutputType;
    if (nodeId != null && outputsObject && outputsObject[nodeId]) {
      const outputsArray = outputsObject[nodeId];
      if (outputsArray.length > 0) {
        setOutput(outputsArray[outputsArray.length - 1]);
      }
    }
  }, [nodeConnection.aiNode.output, nodeId]);

  const RunWorkFlow = async () => {
    let workflow = await getworkflow(pathname.split("/").pop()!);
    if (workflow) {
      const flowPath = JSON.parse(workflow.flowPath!);
      console.log(flowPath);
      let current = 0;
      let latestOutputs: LatestOutputsType = {};
      while (current < flowPath.length) {
        const idNode = flowPath[current];
        const nodeType = flowPath[current + 1];

        console.log(`Processing node: ${idNode} of type: ${nodeType}`);

        if (nodeType == "Discord") {
          setIsLoading(idNode, true);
          const edgesArray = JSON.parse(workflow.edges || "[]");
          const nodeArray = JSON.parse(workflow.nodes || "[]");
          const edge = edgesArray.find((e: any) => e.target === idNode);
          const node = nodeArray.find((n: any) => n.id === edge.source);
          const content =
            latestOutputs[node.id] || "default content if not found";
          const response = await postContentToWebHook(
            content,
            nodeConnection.discordNode.webhookURL
          );

          if (response.message == "success") {
            nodeConnection.setDiscordNode((prev: any) => ({
              ...prev,
              content: "",
            }));
          }
          flowPath.splice(current, 2);
          setIsLoading(idNode, false);
        }
        if (nodeType == "AI") {
          const aiTemplate = JSON.parse(workflow.AiTemplate!);
          if (aiTemplate[idNode]) {
            console.log("AI Node:", idNode);
            if (aiTemplate[idNode].model === "Openai") {
              try {
                setIsLoading(idNode, true);
                const edgesArray = JSON.parse(workflow.edges || "[]");
                const nodeArray = JSON.parse(workflow.nodes || "[]");
                const edge = edgesArray.find((e: any) => e.target === idNode);
                const node = nodeArray.find((n: any) => n.id === edge.source);
                let content;
                if (node.type === "Trigger") {
                  const output = nodeConnection.aiNode.output as unknown as {
                    [key: string]: any[];
                  };
                  const contentarr = output[node.id];
                  content = contentarr[contentarr.length - 1];
                } else {
                  content =
                    latestOutputs[node.id] || "default content if not found";
                }
                const messages = [
                  {
                    role: "system",
                    content: "You are a helpful assistant.",
                  },
                  {
                    role: "user",
                    content: content,
                  },
                ];
                console.log("Messages:", messages);

                const makeRequest = async (
                  retryCount = 0
                ): Promise<AxiosResponse<any>> => {
                  const maxRetries = 5;
                  const baseWaitTime = 1000; // 1 second

                  try {
                    const response = await axios.post(
                      aiTemplate[idNode].endpoint ||
                        "https://api.openai.com/v1/chat/completions",
                      {
                        model: aiTemplate[idNode].localModel || "gpt-3.5-turbo",
                        messages: messages,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${aiTemplate[idNode].ApiKey}`, 
                        },
                      }
                    );
                    return response;
                  } catch (error: any) {
                    if (
                      error.response &&
                      error.response.status === 429 &&
                      retryCount < maxRetries
                    ) {
                      const waitTime = Math.pow(2, retryCount) * baseWaitTime; // Exponential backoff
                      console.log(
                        `Rate limit hit, retrying in ${
                          waitTime / 1000
                        } seconds...`
                      );
                      await new Promise((resolve) =>
                        setTimeout(resolve, waitTime)
                      );
                      return makeRequest(retryCount + 1);
                    } else {
                      throw error;
                    }
                  }
                };
                const response = await makeRequest();
                console.log(
                  "AI Response:",
                  response.data.choices[0].message.content.trim()
                );
                const aiResponseContent =
                  response.data.choices[0].message.content.trim();
                const aiTemplateObj = JSON.parse(workflow.AiTemplate!);
                if (!aiTemplateObj.output) {
                  aiTemplateObj.output = {}; // Initialize output as an empty object if it doesn't exist
                }
                aiTemplateObj.output[idNode] = [aiResponseContent];

                const updatedAiTemplate = JSON.stringify(aiTemplateObj);
                workflow.AiTemplate = updatedAiTemplate;
                latestOutputs[idNode] = aiResponseContent;
                await updateAINodeOutput(idNode, aiResponseContent);
              } catch (error) {
                console.error("Error during OpenAI API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            } else if (aiTemplate[idNode].model === "FLUX-image") {
              try {
                setIsLoading(idNode, true);
                const edgesArray = JSON.parse(workflow.edges || "[]");
                const nodeArray = JSON.parse(workflow.nodes || "[]");
                const edge = edgesArray.find((e: any) => e.target === idNode);
                const node = nodeArray.find((n: any) => n.id === edge.source);
                let content;
                if (node.type === "Trigger") {
                  const output = nodeConnection.aiNode.output as unknown as {
                    [key: string]: any[];
                  };
                  const contentarr = output[node.id];
                  content = contentarr[contentarr.length - 1];
                } else {
                  content =
                    latestOutputs[node.id] || "default content if not found";
                }

                const output = await axios.post("/api/AiResponse/FLUX-image", {
                  prompt: content,
                  apiKey: aiTemplate[idNode].ApiKey,
                });
                nodeConnection.setAINode((prev: any) => ({
                  ...prev,
                  output: {
                    ...(prev.output || {}),
                    [idNode]: [
                      ...(prev.output?.[idNode] || []),
                      output.data[0],
                    ],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            } else if (aiTemplate[idNode].model === "SuperAgent") {
              try {
                setIsLoading(idNode, true);
                const edgesArray = JSON.parse(workflow.edges || "[]");
                const nodeArray = JSON.parse(workflow.nodes || "[]");
                const edge = edgesArray.find((e: any) => e.target === idNode);
                const node = nodeArray.find((n: any) => n.id === edge.source);
                let content;
                if (node.type === "Trigger") {
                  const output = nodeConnection.aiNode.output as unknown as {
                    [key: string]: any[];
                  };
                  const contentarr = output[node.id];
                  content = contentarr[contentarr.length - 1];
                } else {
                  content =
                    latestOutputs[node.id] || "default content if not found";
                }

                const response = await axios.post(
                  "/api/AiResponse/superagent/getoutput",
                  {
                    prompt: content,
                    workflowId: aiTemplate[idNode].id,
                  }
                );
                nodeConnection.setAINode((prev: any) => ({
                  ...prev,
                  output: {
                    ...(prev.output || {}),
                    [idNode]: [
                      ...(prev.output?.[idNode] || []),
                      response.data.output,
                    ],
                  },
                }));
                latestOutputs[idNode] = response.data.output;
              } catch (error) {
                console.error("Error during SuperAgent API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
          }

          flowPath.splice(current, 2);

          continue;
        }
        if (nodeType == "Slack") {
          console.log(workflow.slackChannels);
          const channels = workflow.slackChannels.map((channel) => {
            return {
              label: "",
              value: channel,
            };
          });
          console.log(workflow.slackAccessToken);
          const edgesArray = JSON.parse(workflow.edges || "[]");
          const nodeArray = JSON.parse(workflow.nodes || "[]");
          const edge = edgesArray.find((e: any) => e.target === idNode);
          const node = nodeArray.find((n: any) => n.id === edge.source);
          const content =
            latestOutputs[node.id] || "default content if not found";
          await postMessageToSlack(
            workflow.slackAccessToken!,
            channels,
            content
          );
          flowPath.splice(current, 2);
        }
        if (nodeType == "Notion") {
          const edgesArray = JSON.parse(workflow.edges || "[]");
          const nodeArray = JSON.parse(workflow.nodes || "[]");
          const edge = edgesArray.find((e: any) => e.target === idNode);
          const node = nodeArray.find((n: any) => n.id === edge.source);
          const content =
            latestOutputs[node.id] || "default content if not found";
          await onCreateNewPageInDatabase(
            workflow.notionDbId!,
            workflow.notionAccessToken!,
            content
          );
          flowPath.splice(current, 2);
        }
      }
    }
  };
  async function updateAINodeOutput(idNode: string, aiResponseContent: string) {
    return new Promise((resolve, reject) => {
      try {
        nodeConnection.setAINode((prev: any) => ({
          ...prev,
          output: {
            ...(prev.output || {}),
            [idNode ?? ""]: [
              ...(prev.output?.[idNode ?? ""] || []),
              aiResponseContent,
            ],
          },
        }));
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  return (
    <>
      {data.type !== "Trigger" && data.type !== "Google Drive" && (
        <CustomHandle
          type="target"
          position={Position.Top}
          style={{ zIndex: 100 }}
        />
      )}
      <Card
        onClick={(e) => {
          e.stopPropagation();
          const val = state.editor.elements.find((n) => n.id === nodeId);
          if (val)
            dispatch({
              type: "SELECTED_ELEMENT",
              payload: {
                element: val,
              },
            });
        }}
        className={clsx(
          "relative max-w-[400px] dark:border-muted-foreground/70",
          {
            "shadow-xl": isSelected || isLoading[nodeId ?? ""],
            "shadow-blue-500/50": isSelected && !isLoading[nodeId ?? ""],
            "shadow-yellow-500/50": isLoading[nodeId ?? ""],
          }
        )}
      >
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <div>{logo}</div>
            <div>
              <CardTitle className="text-md">{data.title}</CardTitle>
              <CardDescription>
                <p className="text-xs text-muted-foreground/50">
                  <b className="text-muted-foreground/80">ID: </b>
                  {nodeId}
                </p>
                <p>{data.description}</p>
              </CardDescription>
            </div>
          </div>

          {data.title === "Trigger" ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={nodeConnection.triggerNode.triggerValue ?? triggerValue}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setTriggerValue(newValue);
                  onContentChange(
                    state,
                    nodeConnection,
                    data.title,
                    event,
                    "triggerValue"
                  );
                  nodeConnection.triggerNode.triggerValue = newValue;
                }}
              />
              <Button
                onClick={() => {
                  nodeConnection.setAINode((prev: any) => ({
                    ...prev,
                    output: {
                      ...(prev.output || {}),
                      [nodeId ?? ""]: [
                        ...(prev.output?.[nodeId ?? ""] || []),
                        nodeConnection.triggerNode.triggerValue,
                      ],
                    },
                  }));
                }}
                variant="outline"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  RunWorkFlow();
                }}
                variant="outline"
              >
                <MousePointerClickIcon className="flex-shrink-0 " size={20} />
              </Button>
            </div>
          ) : isLoading[nodeId ?? ""] &&
            nodeConnection.aiNode[nodeId ?? ""]?.model ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          ) : nodeConnection.aiNode[nodeId ?? ""]?.model === "FLUX-image" &&
            output ? (
            <img src={output} alt="Model Output" />
          ) : (
            <p>{output}</p>
          )}
        </CardHeader>
        <Badge variant="secondary" className="absolute right-2 top-2">
          {nodeConnection.aiNode[nodeId ?? ""]?.model ? (
            <span className="text-xs">
              {nodeConnection.aiNode[nodeId ?? ""]?.model}
            </span>
          ) : (
            <span className="text-xs">{data.type}</span>
          )}
        </Badge>
        <div
          className={clsx("absolute left-3 top-4 h-2 w-2 rounded-full", {
            "bg-yellow-500": isLoading[nodeId ?? ""],
            "bg-blue-500": isSelected,
            "bg-green-500": !isSelected && !isLoading[nodeId ?? ""],
          })}
        ></div>
      </Card>
      <CustomHandle type="source" position={Position.Bottom} id="a" />
    </>
  );
};

export default EditorCanvasCardSingle;
