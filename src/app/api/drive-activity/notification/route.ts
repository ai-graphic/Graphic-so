import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import { db } from "@/lib/db";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  console.log("🔴 Changed", Date.now());
  const headersList = headers();
  // console.log(headersList);
  let channelResourceId;
  headersList.forEach((value, key) => {
    if (key == "x-goog-resource-id") {
      channelResourceId = value;
    }
  });

  if (channelResourceId) {
    const user = await db.user.findFirst({
      where: {
        googleResourceId: channelResourceId,
      },
      select: { clerkId: true, credits: true },
    });
    const workflow = await db.workflows.findMany({
      where: {
        userId: user?.clerkId,
      },
    });
    if (workflow) {
      // TODO: HERE WITH FLOWPATH THE ID OF NODE SHOULD ALSO BE SAVED AS TO WHICH NODE IT IS TALKING ABOUT.
      workflow.map(async (flow) => {
        const flowPath = JSON.parse(flow.flowPath!);
        console.log(flowPath);
        let current = 0;
        while (current < flowPath.length) {
          const nodeId = flowPath[current];
          const nodeType = flowPath[current + 1];

          console.log(`Processing node: ${nodeId} of type: ${nodeType}`);

          if (nodeType == "Discord") {
            const discordMessage = await db.discordWebhook.findFirst({
              where: {
                userId: flow.userId,
              },
              select: {
                url: true,
              },
            });
            if (discordMessage) {
              console.log(discordMessage.url);
              await postContentToWebHook(
                flow.discordTemplate!,
                discordMessage.url
              );
              flowPath.splice(current, 2);
            }
          }
          if (nodeType == "AI") {
            const aiTemplate = JSON.parse(flow.AiTemplate!);
            if (aiTemplate[nodeId]) {
              console.log("AI Node:", nodeId);
              try {
                const messages = [
                  {
                    role: "system",
                    content: "You are a helpful assistant.",
                  },
                  {
                    role: "user",
                    content: aiTemplate[nodeId].prompt,
                  },
                ];
                console.log("Messages:", messages);

                const makeRequest = async (retryCount = 0) => {
                  const maxRetries = 5;
                  const baseWaitTime = 1000; // 1 second

                  try {
                    const response = await axios.post(
                      aiTemplate[nodeId].endpoint ||
                        "https://api.openai.com/v1/chat/completions",
                      {
                        model: aiTemplate[nodeId].localModel || "gpt-3.5-turbo",
                        messages: messages,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${aiTemplate[nodeId].ApiKey}`, // Use environment variable for the API key
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
              } catch (error : any) {
                console.error("Error during AI search:", error.status);
              }
            }
            flowPath.splice(current, 2);
            continue;
          }
          if (nodeType == "Slack") {
            console.log(flow.slackChannels);
            const channels = flow.slackChannels.map((channel) => {
              return {
                label: "",
                value: channel,
              };
            });
            console.log(flow.slackAccessToken);
            await postMessageToSlack(
              flow.slackAccessToken!,
              channels,
              flow.slackTemplate!
            );
            flowPath.splice(current, 2);
          }
          if (nodeType == "Notion") {
            await onCreateNewPageInDatabase(
              flow.notionDbId!,
              flow.notionAccessToken!,
              JSON.parse(flow.notionTemplate!)
            );
            flowPath.splice(current, 2);
          }
          if (nodeType == "Wait") {
            const res = await axios.put(
              "https://api.cron-job.org/jobs",
              {
                job: {
                  url: `${process.env.NGROK_URI}?flow_id=${flow.id}`,
                  enabled: "true",
                  schedule: {
                    timezone: "Asia/Kolkata",
                    expiresAt: 0,
                    hours: [-1],
                    mdays: [-1],
                    minutes: ["*****"],
                    months: [-1],
                    wdays: [-1],
                  },
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.CRON_JOB_KEY!}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (res) {
              flowPath.splice(current, 2);
              const cronPath = await db.workflows.update({
                where: {
                  id: flow.id,
                },
                data: {
                  cronPath: JSON.stringify(flowPath),
                },
              });
              if (cronPath) break;
            }
            break;
          }
          current += 2;
        }

        await db.user.update({
          where: {
            clerkId: user?.clerkId,
          },
          data: {
            credits: `${parseInt(user?.credits!) - 1}`,
          },
        });
      });
      return Response.json(
        {
          message: "flow completed",
        },
        {
          status: 200,
        }
      );
    }
    return Response.json(
      {
        message: "success",
      },
      {
        status: 200,
      }
    );
  }
}
