export const maxDuration = 300;

import { updateCredits } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import { onUpdateChatHistory } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { getworkflow } from "@/app/(main)/(pages)/workflows/editor/[editorId]/_actions/workflow-connections";
import { db } from "@/lib/db";
import axios from "axios";

export async function POST(req: Request, res: Response) {
  type LatestOutputsType = {
    [key: string]: string;
  };
  let chatHistory: any = { user: "", bot: "", history: [] };
  let latestOutputs: LatestOutputsType = {};

  try {
    const { workflowId, prompt, userid, image } = await req.json();
    let workflow = await getworkflow(workflowId);
    console.log("workflow", workflowId, workflow);

    if (workflow) {
      const flowPath = JSON.parse(workflow.flowPath!);
      console.log(flowPath);
      const dbUser = await db.user.findFirst({
        where: {
          clerkId: userid,
        },
      });
      let requiredCredits = 0;
      flowPath.forEach((nodeType: string) => {
        if (
          [
            "flux-dev",
            "flux-lora",
            "fluxGeneral",
            "fluxDevLora",
            "AI",
            "image-to-image",
            "consistent-character",
            "dreamShaper",
            "musicGen",
            "sadTalker",
            "autoCaption",
          ].includes(nodeType)
        ) {
          requiredCredits += 1;
        } else if (
          [
            "stable-video",
            "CogVideoX-5B",
            "lumalabs-TextToVideo",
            "lumalabs-ImageToVideo",
            "video-to-video",
          ].includes(nodeType)
        ) {
          requiredCredits += 10;
        } else if (["train-flux"].includes(nodeType)) {
          requiredCredits += 60;
        }
      });

      if (Number(dbUser?.credits) < requiredCredits) {
        return new Response("Insufficient Credits", {
          status: 402,
          headers: { "Content-Type": "application/json" },
        });
      }
      await db.user.update({
        where: {
          clerkId: userid,
        },
        data: {
          credits: (Number(dbUser?.credits) - 1).toString(),
        },
      });
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
          const content = latestOutputs[node.id] || prompt;
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
            if (aiTemplate[idNode].model === "vercel") {
              try {
                const edgesArray = JSON.parse(workflow.edges || "[]");
                const nodeArray = JSON.parse(workflow.nodes || "[]");
                const edge = edgesArray.find((e: any) => e.target === idNode);
                const node = nodeArray.find((n: any) => n.id === edge.source);
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_URL}/api/ai/vercel`,
                  {
                    prompt: content,
                    system: aiTemplate[idNode].system,
                    userid: userid,
                    model: aiTemplate[idNode].localModel,
                    temperature: aiTemplate[idNode].temperature,
                    maxTokens: aiTemplate[idNode].max_tokens,
                    tools: aiTemplate[idNode].tool,
                  }
                );
                console.log("AI Response:", response.data);
                const aiResponseContent = response.data;
                latestOutputs[idNode] = aiResponseContent;
              } catch (error) {
                console.error("Error during vercel API call:", error);
              } finally {
              }
            } else if (aiTemplate[idNode].model === "FLUX-image") {
              try {
                const output = await axios.post(
                  `${process.env.NEXT_PUBLIC_URL}/api/ai/FLUX-image`,
                  {
                    prompt: content,
                    userid: userid,
                  }
                );
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
              }
            } else if (aiTemplate[idNode].model === "SuperAgent") {
              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_URL}/api/ai/superagent/getoutput`,
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
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI = nextNodeType !== "AI";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
          continue;
        }
        if (nodeType == "flux-dev") {
          const fluxDevTemplate = JSON.parse(workflow.fluxDevTemplate!);
          if (fluxDevTemplate[idNode]) {
            console.log("fluxDev Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = fluxDevTemplate[idNode].prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = fluxDevTemplate[idNode].prompt;
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
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/flux-dev`,
                {
                  prompt: content,
                  image_size: fluxDevTemplate[idNode].image_size,
                  userid: userid,
                  num_inference_steps:
                    fluxDevTemplate[idNode].num_inference_steps,
                  guidance_scale: fluxDevTemplate[idNode].guidance_scale,
                  num_images: fluxDevTemplate[idNode].num_images,
                  seed: fluxDevTemplate[idNode].seed,
                  enable_safety_checker:
                    fluxDevTemplate[idNode].enable_safety_checker,
                  sync_mode: fluxDevTemplate[idNode].sync_mode,
                }
              );

              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "flux-lora") {
          const fluxLoraTemplate = JSON.parse(workflow.fluxloraTemplate!);
          if (fluxLoraTemplate[idNode]) {
            console.log("fluxLora Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = fluxLoraTemplate[idNode].prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = fluxLoraTemplate[idNode].prompt;
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
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/flux-lora`,
                {
                  prompt: content,
                  image_size: fluxLoraTemplate[idNode].image_size,
                  userid: userid,
                  num_inference_steps:
                    fluxLoraTemplate[idNode].num_inference_steps,
                  guidance_scale: fluxLoraTemplate[idNode].guidance_scale,
                  num_images: fluxLoraTemplate[idNode].num_images,
                  seed: fluxLoraTemplate[idNode].seed,
                  enable_safety_checker:
                    fluxLoraTemplate[idNode].enable_safety_checker,
                  loras: fluxLoraTemplate[idNode].loras,
                  sync_mode: fluxLoraTemplate[idNode].sync_mode,
                  output_format: fluxLoraTemplate[idNode].output_format,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "image-to-image") {
          const falImageTemplate = JSON.parse(workflow.ImageToImageTemplate!);
          if (falImageTemplate[idNode]) {
            console.log("image-to-image Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            let Image;
            let prompt = falImageTemplate[idNode]?.prompt;
            let ImageFromDb = falImageTemplate[idNode]?.image_url;
            console.log("Selected URL:", image, ImageFromDb);
            if (node.type === "Trigger") {
              const prmpt = prompt;
              content = prmpt;
              Image = image;
              if (prompt) {
                if (prompt.includes(":input:")) {
                  content = prompt.replace(":input:", prmpt);
                } else {
                  content = prmpt;
                }
              }
              if (ImageFromDb) {
                if (ImageFromDb.includes(":image:")) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = image;
                }
              }

              chatHistory.user = prmpt + " - " + Image;
            } else {
              if (prompt && ImageFromDb) {
                if (ImageFromDb.includes(":image:") && image) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = latestOutputs[node.id];
                }
                if (prompt.includes(":input:") && image) {
                  content = prompt.replace(":input:", latestOutputs[node.id]);
                } else {
                  content = prompt;
                }
              } else if (!ImageFromDb && !image) {
                Image = latestOutputs[node.id];
                content = prompt || "";
              } else {
                Image = image || latestOutputs[node.id];
                content = prompt || "";
              }
            }

            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/image-to-image`,
                {
                  prompt: content,
                  image_size: falImageTemplate[idNode].image_size,
                  image_url: Image,
                  userid: userid,
                  num_inference_steps:
                    falImageTemplate[idNode].num_inference_steps,
                  guidance_scale: falImageTemplate[idNode].guidance_scale,
                  num_images: falImageTemplate[idNode].num_images,
                  seed: falImageTemplate[idNode].seed,
                  enable_safety_checker:
                    falImageTemplate[idNode].enable_safety_checker,
                  sync_mode: falImageTemplate[idNode].sync_mode,
                  strength: falImageTemplate[idNode].strength,
                }
              );

              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "stable-video") {
          const falVideoTemplate = JSON.parse(workflow.videoTemplate!);
          if (falVideoTemplate[idNode]) {
            console.log("stable-video Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              const prmpt = prompt;
              chatHistory.user = prmpt;
              content = prmpt;
            } else {
              content = latestOutputs[node.id];
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/stable-video`,
                {
                  image_url: content,
                  userid: userid,
                  motion_bucket_id: falVideoTemplate[idNode].motion_bucket_id,
                  fps: falVideoTemplate[idNode].fps,
                  cond_aug: falVideoTemplate[idNode].cond_aug,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "musicGen") {
          const falMusicTemplate = JSON.parse(workflow.musicGenTemplate!);
          if (falMusicTemplate[idNode]) {
            console.log("musicGen Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              const prmpt = prompt;
              chatHistory.user = prmpt;
              content = prmpt;
            } else {
              content = latestOutputs[node.id];
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/replicate/musicgen`,
                {
                  prompt: content,
                  userid: userid,
                  seed: falMusicTemplate[idNode]?.seed,
                  top_k: falMusicTemplate[idNode]?.top_k,
                  top_p: falMusicTemplate[idNode]?.top_p,
                  duration: falMusicTemplate[idNode]?.duration,
                  input_audio: falMusicTemplate[idNode]?.input_audio,
                  temperature: falMusicTemplate[idNode]?.temperature,
                  continuation: falMusicTemplate[idNode]?.continuation,
                  model_version: falMusicTemplate[idNode]?.model_version,
                  output_format: falMusicTemplate[idNode]?.output_format,
                  continuation_start:
                    falMusicTemplate[idNode]?.continuation_start,
                  multi_band_diffusion:
                    falMusicTemplate[idNode]?.multi_band_diffusion,
                  normalization_strategy:
                    falMusicTemplate[idNode]?.normalization_strategy,
                  classifier_free_guidance:
                    falMusicTemplate[idNode]?.classifier_free_guidance,
                }
              );
              latestOutputs[idNode] = output.data ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "video-to-video") {
          const falVideoTemplate = JSON.parse(workflow.videoToVideoTemplate!);
          if (falVideoTemplate[idNode]) {
            console.log("video-to-video Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              const prmpt = prompt;
              chatHistory.user = prmpt;
              content = prmpt;
            } else {
              content = latestOutputs[node.id];
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/video-to-video`,
                {
                  prompt: content,
                  userid: userid,
                  guidance_scale: falVideoTemplate[idNode]?.guidance_scale,
                  negative_prompt: falVideoTemplate[idNode]?.negative_prompt,
                  use_rife: falVideoTemplate[idNode]?.use_rife,
                  export_fps: falVideoTemplate[idNode]?.export_fps,
                  video_url: falVideoTemplate[idNode]?.video_url,
                  strength: falVideoTemplate[idNode]?.strength,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "lumalabs-ImageToVideo") {
          const falImageToVideoTemplate = JSON.parse(
            workflow.lunalabsImageToVideoTemplate!
          );
          if (falImageToVideoTemplate[idNode]) {
            console.log("lumalabs-ImageToVideo Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            let Image;
            const Prompt = falImageToVideoTemplate[idNode]?.prompt;
            const ImageFromDb =
              falImageToVideoTemplate[idNode]?.start_frame_url;
            if (node.type === "Trigger") {
              const prmpt = prompt;
              content = prmpt;
              Image = image;

              if (Prompt) {
                if (Prompt.includes(":input:")) {
                  content = Prompt.replace(":input:", prmpt);
                } else {
                  content = prmpt;
                }
              }
              if (ImageFromDb) {
                if (ImageFromDb.includes(":image:")) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = image;
                }
              }

              chatHistory.user = prmpt + " - " + Image;
            } else {
              if (Prompt && ImageFromDb) {
                if (ImageFromDb.includes(":image:") && image) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = latestOutputs[node.id];
                }
                if (Prompt.includes(":input:") && image) {
                  content = Prompt.replace(":input:", latestOutputs[node.id]);
                } else {
                  content = Prompt;
                }
              } else if (!ImageFromDb && !image) {
                Image = latestOutputs[node.id];
                content = Prompt || "";
              } else {
                Image = image || latestOutputs[node.id];
                content = Prompt || "";
              }
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/lunalabs/image-video`,
                {
                  prompt: content,
                  userid: userid,
                  start_frame_url: image,
                  end_frame_url: falImageToVideoTemplate[idNode].end_frame_url,
                  aspect_ratio: falImageToVideoTemplate[idNode].aspect_ratio,
                  loop: falImageToVideoTemplate[idNode].loop,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "lumalabs-TextToVideo") {
          const falTextToVideoTemplate = JSON.parse(
            workflow.lunalabsTextToVideoTemplate!
          );
          if (falTextToVideoTemplate[idNode]) {
            console.log("lumalabs-TextToVideo Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = falTextToVideoTemplate[idNode]?.prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = falTextToVideoTemplate[idNode]?.prompt;
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
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/lunalabs/text-video`,
                {
                  prompt: content,
                  userid: userid,
                  aspect_ratio: falTextToVideoTemplate[idNode].aspect_ratio,
                  loop: falTextToVideoTemplate[idNode].loop,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "CogVideoX-5B") {
          const falCogVideoTemplate = JSON.parse(workflow.cogVideo5BTemplate!);
          if (falCogVideoTemplate[idNode]) {
            console.log("CogVideoX-5B Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              const prmpt = prompt;
              chatHistory.user = prmpt;
              content = prmpt;
            } else {
              content = latestOutputs[node.id];
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/cogVideox-5b`,
                {
                  prompt: content,
                  userid: userid,
                  seed: falCogVideoTemplate[idNode]?.seed,
                  top_k: falCogVideoTemplate[idNode]?.top_k,
                  top_p: falCogVideoTemplate[idNode]?.top_p,
                  duration: falCogVideoTemplate[idNode]?.duration,
                  input_audio: falCogVideoTemplate[idNode]?.input_audio,
                  temperature: falCogVideoTemplate[idNode]?.temperature,
                  continuation: falCogVideoTemplate[idNode]?.continuation,
                  model_version: falCogVideoTemplate[idNode]?.model_version,
                  output_format: falCogVideoTemplate[idNode]?.output_format,
                  continuation_start:
                    falCogVideoTemplate[idNode]?.continuation_start,
                  multi_band_diffusion:
                    falCogVideoTemplate[idNode]?.multi_band_diffusion,
                  normalization_strategy:
                    falCogVideoTemplate[idNode]?.normalization_strategy,
                  classifier_free_guidance:
                    falCogVideoTemplate[idNode]?.classifier_free_guidance,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "consistent-character") {
          const falCharacterTemplate = JSON.parse(workflow.CharacterTemplate!);
          if (falCharacterTemplate[idNode]) {
            console.log("consistent-character Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            let Image;
            let prompt = falCharacterTemplate[idNode]?.prompt;
            let ImageFromDb = falCharacterTemplate[idNode]?.image_url;
            console.log("Selected URL:", image, ImageFromDb);
            if (node.type === "Trigger") {
              const prmpt = prompt;
              content = prmpt;
              Image = image;
              if (prompt) {
                if (prompt.includes(":input:")) {
                  content = prompt.replace(":input:", prmpt);
                } else {
                  content = prmpt;
                }
              }
              if (ImageFromDb) {
                if (ImageFromDb.includes(":image:")) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = image;
                }
              }

              chatHistory.user = prmpt + " - " + Image;
            } else {
              if (prompt && ImageFromDb) {
                if (ImageFromDb.includes(":image:") && image) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = latestOutputs[node.id];
                }
                if (prompt.includes(":input:") && image) {
                  content = prompt.replace(":input:", latestOutputs[node.id]);
                } else {
                  content = prompt;
                }
              } else if (!ImageFromDb && !image) {
                Image = latestOutputs[node.id];
                content = prompt || "";
              } else {
                Image = image || latestOutputs[node.id];
                content = prompt || "";
              }
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/replicate/consistent-character`,
                {
                  prompt: content,
                  userid: userid,
                  subject: Image,
                  num_outputs: falCharacterTemplate[idNode]?.num_outputs,
                  negative_prompt:
                    falCharacterTemplate[idNode]?.negative_prompt,
                  randomise_poses:
                    falCharacterTemplate[idNode]?.randomise_poses,
                  number_of_outputs:
                    falCharacterTemplate[idNode]?.number_of_outputs,
                  disable_safety_checker:
                    falCharacterTemplate[idNode]?.disable_safety_checker,
                  number_of_images_per_pose:
                    falCharacterTemplate[idNode]?.number_of_images_per_pose,
                  output_format: falCharacterTemplate[idNode]?.output_format,
                  output_quality: falCharacterTemplate[idNode]?.output_quality,
                }
              );

              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during Replicate API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "dreamShaper") {
          const falDreamShaperTemplate = JSON.parse(
            workflow.DreamShaperTemplate!
          );
          if (falDreamShaperTemplate[idNode]) {
            console.log("dreamShaper Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            let Image;
            let prompt = falDreamShaperTemplate[idNode]?.prompt;
            let ImageFromDb = falDreamShaperTemplate[idNode]?.image_url;
            console.log("Selected URL:", image, ImageFromDb);
            if (node.type === "Trigger") {
              const prmpt = prompt;
              content = prmpt;
              Image = image;
              if (prompt) {
                if (prompt.includes(":input:")) {
                  content = prompt.replace(":input:", prmpt);
                } else {
                  content = prmpt;
                }
              }
              if (ImageFromDb) {
                if (ImageFromDb.includes(":image:")) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = image;
                }
              }

              chatHistory.user = prmpt + " - " + Image;
            } else {
              if (prompt && ImageFromDb) {
                if (ImageFromDb.includes(":image:") && image) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = latestOutputs[node.id];
                }
                if (prompt.includes(":input:") && image) {
                  content = prompt.replace(":input:", latestOutputs[node.id]);
                } else {
                  content = prompt;
                }
              } else if (!ImageFromDb && !image) {
                Image = latestOutputs[node.id];
                content = prompt || "";
              } else {
                Image = image || latestOutputs[node.id];
                content = prompt || "";
              }
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/replicate/dreamshaper`,
                {
                  prompt: content,
                  userid: userid,
                  num_inference_steps:
                    falDreamShaperTemplate[idNode].num_inference_steps,
                  image: Image,
                  negative_prompt:
                    falDreamShaperTemplate[idNode]?.negative_prompt,
                  strength: falDreamShaperTemplate[idNode]?.strength,
                  scheduler: falDreamShaperTemplate[idNode]?.scheduler,
                  upscale: falDreamShaperTemplate[idNode]?.upscale,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during Replicate API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "fluxGeneral") {
          const falGeneralTemplate = JSON.parse(workflow.fluxGeneralTemplate!);
          if (falGeneralTemplate[idNode]) {
            console.log("fluxGeneral Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = falGeneralTemplate[idNode]?.prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = falGeneralTemplate[idNode]?.prompt;
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
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/flux-general`,
                {
                  prompt: content,
                  userid: userid,
                  num_inference_steps:
                    falGeneralTemplate[idNode]?.num_inference_steps,
                  guidance_scale: falGeneralTemplate[idNode]?.guidance_scale,
                  num_images: falGeneralTemplate[idNode]?.num_images,
                  seed: falGeneralTemplate[idNode]?.seed,
                  sync_mode: falGeneralTemplate[idNode]?.sync_mode,
                  enable_safety_checker:
                    falGeneralTemplate[idNode]?.enable_safety_checker,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "fluxDevLora") {
          const falDevLoraTemplate = JSON.parse(workflow.fluxDevLora!);
          if (falDevLoraTemplate[idNode]) {
            console.log("fluxDevLora Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = falDevLoraTemplate[idNode].prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = falDevLoraTemplate[idNode].prompt;
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
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/replicate/fluxDevlora`,
                {
                  prompt: content,
                  hf_loras: falDevLoraTemplate[idNode]?.hf_loras,
                  userid: userid,
                  num_outputs: falDevLoraTemplate[idNode]?.num_outputs,
                  aspect_ratio: falDevLoraTemplate[idNode]?.aspect_ratio,
                  output_format: falDevLoraTemplate[idNode]?.output_format,
                  guidance_scale: falDevLoraTemplate[idNode]?.guidance_scale,
                  output_quality: falDevLoraTemplate[idNode]?.output_quality,
                  num_inference_steps:
                    falDevLoraTemplate[idNode].num_inference_steps,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during Replicate API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "train-flux") {
          const falTrainTemplate = JSON.parse(workflow.fluxTrainTemplate!);
          if (falTrainTemplate[idNode]) {
            console.log("train-flux Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = falTrainTemplate[idNode].prompt;
              if (prmpt) {
                if (prmpt.includes(":input:")) {
                  content = prmpt.replace(":input:", prompt);
                } else {
                  content = prmpt;
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = falTrainTemplate[idNode].prompt;
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
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/train-flux`,
                {
                  images_data_url: falTrainTemplate[idNode].images_data_url,
                  userid: userid,
                  trigger_word: falTrainTemplate[idNode].trigger_word,
                  iter_multiplier: falTrainTemplate[idNode].iter_multiplier,
                }
              );
              latestOutputs[idNode] = output.data ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "autoCaption") {
          const falAutoCaptionTemplate = JSON.parse(
            workflow.autoCaptionTemplate!
          );
          if (falAutoCaptionTemplate[idNode]) {
            console.log("autoCaption Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            if (node.type === "Trigger") {
              console.log("Trigger Node", node.id);
              let prmpt = falAutoCaptionTemplate[idNode].prompt;
              if (prmpt) {
                if (prmpt.includes(":video:")) {
                  content = prmpt.replace(":video:", prompt).trim();
                } else {
                  content = prmpt.trim();
                }
                chatHistory.user = content;
              }
            } else {
              let prmpt = falAutoCaptionTemplate[idNode].prompt;
              console.log("Prompt:", prmpt);
              if (prmpt) {
                if (prmpt.includes(":video:")) {
                  content = prmpt
                    .replace(":video:", latestOutputs[node.id])
                } else {
                  content = prmpt.trim();
                }
              } else {
                content = latestOutputs[node.id]
              }
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/replicate/autocaption`,
                {
                  userid: userid,
                  font: falAutoCaptionTemplate[idNode]?.font,
                  color: falAutoCaptionTemplate[idNode]?.color,
                  kerning: falAutoCaptionTemplate[idNode]?.kerning,
                  opacity: falAutoCaptionTemplate[idNode].opacity,
                  MaxChars: falAutoCaptionTemplate[idNode].MaxChars,
                  fontsize: falAutoCaptionTemplate[idNode].fontsize,
                  translate: falAutoCaptionTemplate[idNode].translate,
                  output_video: falAutoCaptionTemplate[idNode].output_video,
                  stroke_color: falAutoCaptionTemplate[idNode].stroke_color,
                  stroke_width: falAutoCaptionTemplate[idNode].stroke_width,
                  right_to_left: falAutoCaptionTemplate[idNode].right_to_left,
                  subs_position: falAutoCaptionTemplate[idNode].subs_position,
                  highlight_color:
                    falAutoCaptionTemplate[idNode].highlight_color,
                  video_file_input: content,
                  output_transcript:
                    falAutoCaptionTemplate[idNode].output_transcript,
                }
              );
              latestOutputs[idNode] = output.data ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
        }
        if (nodeType == "sadTalker") {
          const falSadTalkerTemplate = JSON.parse(workflow.sadTalkerTemplate!);
          if (falSadTalkerTemplate[idNode]) {
            console.log("sadTalker Node:", idNode);
            const edgesArray = JSON.parse(workflow.edges || "[]");
            const nodeArray = JSON.parse(workflow.nodes || "[]");
            const edge = edgesArray.find((e: any) => e.target === idNode);
            const node = nodeArray.find((n: any) => n.id === edge.source);
            let content;
            let Image;
            let prompt = falSadTalkerTemplate[idNode]?.source_image_url;
            let ImageFromDb = falSadTalkerTemplate[idNode]?.driven_audio_url;
            if (node.type === "Trigger") {
              const prmpt = prompt;
              content = prmpt;
              Image = image;
              console.log("Prompt:", content, Image);

              if (prompt) {
                if (prompt.includes(":input:")) {
                  content = prompt.replace(":input:", prmpt);
                } else {
                  console.log("Prompt:", prmpt);
                  content = prmpt;
                }
              }
              if (ImageFromDb) {
                if (ImageFromDb.includes(":image:")) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = image;
                }
              }

              chatHistory.user = prmpt + " - " + Image;
            } else {
              if (prompt && ImageFromDb) {
                if (ImageFromDb.includes(":image:") && image) {
                  Image = ImageFromDb.replace(":image:", image);
                } else {
                  Image = latestOutputs[node.id];
                }
                if (prompt.includes(":input:") && image) {
                  content = prompt.replace(":input:", latestOutputs[node.id]);
                } else {
                  content = prompt;
                }
              } else if (!ImageFromDb && !image) {
                Image = latestOutputs[node.id];
                content = prompt || "";
              } else {
                Image = image || latestOutputs[node.id];
                content = prompt || "";
              }
            }
            try {
              const output = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/ai/fal/sadtalker`,
                {
                  source_image_url: content,
                  driven_audio_url: Image,
                  userid: userid,
                  face_model_resolution:
                    falSadTalkerTemplate[idNode].face_model_resolution,
                  expression_scale:
                    falSadTalkerTemplate[idNode].expression_scale,
                  face_enhancer: falSadTalkerTemplate[idNode].face_enhancer,
                  preprocess: falSadTalkerTemplate[idNode].preprocess,
                }
              );
              latestOutputs[idNode] = output.data[0] ?? content;
            } catch (error) {
              console.error("Error during fal API call:", error);
            } finally {
            }
          }
          chatHistory.history.push(latestOutputs[idNode]);
          const nextNodeType = flowPath[current + 3];
          flowPath.splice(current, 2);
          const isNextNotAI =
            nextNodeType == "Slack" ||
            nextNodeType == "Notion" ||
            nextNodeType == "Chat" ||
            nextNodeType == "Discord";
          if (isNextNotAI) {
            chatHistory.bot = latestOutputs[idNode];
            console.log("chatHistory", chatHistory);
          }
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

    const final = JSON.stringify(chatHistory);
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
