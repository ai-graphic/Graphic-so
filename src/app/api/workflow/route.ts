import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import { onUpdateChatHistory } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { getworkflow } from "@/app/(main)/(pages)/workflows/editor/[editorId]/_actions/workflow-connections";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosResponse } from "axios";

export async function POST(req: Request, res: Response) {
  type WorkflowContextType = {
    runWorkFlow: (
      workflowId: string,
      nodeConnection: any,
      setIsLoading: any,
      setHistory?: any
    ) => Promise<void>;
  };

  type LatestOutputsType = {
    [key: string]: string;
  };
  let chatHistory: any = { user: "", bot: "" };
  let latestOutputs: LatestOutputsType = {};

  try {
    const { workflowId, prompt, userid } = await req.json();
    let workflow = await getworkflow(workflowId);
    console.log("workflow", workflowId, workflow);

    if (workflow) {
      const flowPath = JSON.parse(workflow.flowPath!);
      console.log(flowPath);
      let current = 0;
      while (current < flowPath.length) {
        const idNode = flowPath[current];
        const nodeType = flowPath[current + 1];

        console.log(`Processing node: ${idNode} of type: ${nodeType}`);

        if (nodeType == "Discord") {
          const edgesArray = JSON.parse(workflow.edges || "[]");
          const nodeArray = JSON.parse(workflow.nodes || "[]");
          const edge = edgesArray.find((e: any) => e.target === idNode);
          const node = nodeArray.find((n: any) => n.id === edge.source);
          const content =
            latestOutputs[node.id] || "default content if not found";
          const discordMessage = await db.discordWebhook.findFirst({
            where: {
              userId: workflow.userId,
            },
            select: {
              url: true,
            },
          });
          if (discordMessage) {
            await postContentToWebHook(content, discordMessage.url);
            flowPath.splice(current, 2);
          }
        }
        if (nodeType == "AI") {
          const aiTemplate = JSON.parse(workflow.AiTemplate!);
          if (aiTemplate && aiTemplate[idNode]) {
            console.log("AI Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = aiTemplate[idNode].prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = aiTemplate[idNode].prompt;
              console.log("Prompt:", prmpt);
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", latestOutputs[node.id]);
                } else {
                  content = prmpt;
                }
              } else {
                content = latestOutputs[node.id];
              }
            }
            if (aiTemplate[idNode].model === "Openai") {
              try {
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
                latestOutputs[idNode] = aiResponseContent;
              } catch (error) {
                console.error("Error during OpenAI API call:", error);
              } finally {
              }
            } else if (aiTemplate[idNode].model === "FLUX-image") {
              try {
                const output = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/AiResponse/FLUX-image`, {
                  prompt: content,
                  apiKey: aiTemplate[idNode].ApiKey,
                });
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
              }
            } else if (aiTemplate[idNode].model === "SuperAgent") {
              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_URL}/api/AiResponse/superagent/getoutput`,
                  {
                    prompt: content,
                    workflowId: aiTemplate[idNode].id,
                    userid: userid,
                  }
                );
                latestOutputs[idNode] = response.data.output;
              } catch (error) {
                console.error("Error during SuperAgent API call:", error);
              } finally {
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
            const history = published?.map((item: string) => JSON.parse(item));
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

    const final = JSON.stringify(chatHistory.bot);
    console.log("final", final);
    return new Response(final, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during Superagent API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
