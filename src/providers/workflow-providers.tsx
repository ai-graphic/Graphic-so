"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { getworkflow } from "@/app/(main)/(pages)/workflows/editor/[editorId]/_actions/workflow-connections";
import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import axios, { AxiosResponse } from "axios";
import { db } from "@/lib/db";
import { onUpdateChatHistory } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";

type WorkflowContextType = {
  runWorkFlow: (
    workflowId: string,
    nodeConnection: any,
    setIsLoading: any,
    setHistory?: any
  ) => Promise<void>;
};

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);
type LatestOutputsType = {
  [key: string]: string;
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const runWorkFlow = useCallback(
    async (
      workflowId: string,
      nodeConnection: any,
      setIsLoading: any,
      setHistory?: any
    ) => {
      async function updateAINodeOutput(
        idNode: string,
        aiResponseContent: string
      ) {
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

      let workflow = await getworkflow(workflowId);
      console.log(workflow);
      if (workflow) {
        const flowPath = JSON.parse(workflow.flowPath!);
        console.log(flowPath);
        let current = 0;
        let latestOutputs: LatestOutputsType = {};
        let chatHistory: any = { user: "", bot: "" };
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
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let prompt = nodeConnection.aiNode[idNode].prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.aiNode.output as unknown as {
                  [key: string]: any[];
                };
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prompt;
                  }
                }
                chatHistory.user = prmpt;
              } else {
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", latestOutputs[node.id]);
                  } else {
                    content = prompt;
                  }
                } else {
                  content = latestOutputs[node.id];
                }
              }
              if (aiTemplate[idNode].model === "Openai") {
                try {
                  setIsLoading(idNode, true);
                  const edgesArray = JSON.parse(workflow.edges || "[]");
                  const nodeArray = JSON.parse(workflow.nodes || "[]");
                  const edge = edgesArray.find((e: any) => e.target === idNode);
                  const node = nodeArray.find((n: any) => n.id === edge.source);
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
                          model:
                            aiTemplate[idNode].localModel || "gpt-3.5-turbo",
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

                  const output = await axios.post(
                    "/api/AiResponse/FLUX-image",
                    {
                      prompt: content,
                      apiKey: aiTemplate[idNode].ApiKey,
                    }
                  );
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

                  const response = await axios.post(
                    "/api/AiResponse/superagent/getoutput",
                    {
                      prompt: content,
                      workflowId: aiTemplate[idNode].id,
                      userid: workflow.userId,
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
            console.log("flow", flowPath, chatHistory);
            const nextNodeType = flowPath[current + 3];
            flowPath.splice(current, 2);
            const isNextNotAI = nextNodeType !== "AI";
            if (isNextNotAI) {
              chatHistory.bot = latestOutputs[idNode];
              console.log("chatHistory", chatHistory);
            }
            if (chatHistory.user && chatHistory.bot) {
              const published = await onUpdateChatHistory(
                workflowId,
                chatHistory
              );
              const history = published?.map((item: string) =>
                JSON.parse(item)
              );
              if (setHistory) {
                setHistory(history);
              }
            }
            continue;
          }
          if (nodeType == "Slack") {
            console.log(workflow.slackChannels);
            const channels = workflow.slackChannels.map((channel: string) => {
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
          if (nodeType == "Chat") {
            flowPath.splice(current, 2);
          }
        }
      }
    },
    []
  );

  return (
    <WorkflowContext.Provider value={{ runWorkFlow }}>
      {children}
    </WorkflowContext.Provider>
  );
};
