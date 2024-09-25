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
import axios from "axios";
import { onUpdateChatHistory } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { updateCredits } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import { toast } from "sonner";
import { creditsRequired } from "@/lib/constants";

type WorkflowContextType = {
  runWorkFlow: (
    workflowId: string,
    nodeConnection: any,
    setIsLoading: any,
    credits: string,
    setCredits: any,
    setHistory?: any,
    selectedurl?: string
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
      credits: string,
      setCredits: any,
      setHistory?: any,
      selectedurl?: string
    ) => {
      async function updateAINodeOutput(
        idNode: string,
        aiResponseContent: string
      ) {
        return new Promise((resolve, reject) => {
          try {
            nodeConnection.setOutput((prev: any) => ({
              ...prev,
              ...(prev.output || {}),
              [idNode ?? ""]: [
                ...(prev.output?.[idNode ?? ""] || []),
                aiResponseContent,
              ],
            }));
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      }
      let workflow = await getworkflow(workflowId);
      if (workflow) {
        const flowPath = JSON.parse(workflow.flowPath!);
        let requiredCredits = 1;
        flowPath.forEach((nodeType: string) => {
          if (
            creditsRequired[nodeType as keyof typeof creditsRequired] !==
            undefined
          ) {
            requiredCredits +=
              creditsRequired[nodeType as keyof typeof creditsRequired];
          } else {
            // Handle the case where nodeType is not defined in creditsRequired
            console.warn(`Credits not defined for nodeType: ${nodeType}`);
          }
        });

        if (parseInt(credits) < requiredCredits) {
          toast.error("Insufficient Credits");
          return;
        }

        let current = 0;
        let latestOutputs: LatestOutputsType = {};
        let chatHistory: any = { user: "", bot: "", history: [] };
        while (current < flowPath.length) {
          const idNode = flowPath[current];
          const nodeType = flowPath[current + 1];

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
          if (nodeType == "flux-dev") {
            const fluxDevTemplate = JSON.parse(workflow.fluxDevTemplate!);
            if (fluxDevTemplate[idNode]) {
              console.log("fluxDev Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let prompt = nodeConnection.fluxDevNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
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
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/flux-dev", {
                  prompt: content,
                  image_size: fluxDevTemplate[idNode].image_size,
                  userid: workflow.userId,
                  num_inference_steps:
                    fluxDevTemplate[idNode].num_inference_steps,
                  guidance_scale: fluxDevTemplate[idNode].guidance_scale,
                  num_images: fluxDevTemplate[idNode].num_images,
                  seed: fluxDevTemplate[idNode].seed,
                  enable_safety_checker:
                    fluxDevTemplate[idNode].enable_safety_checker,
                  sync_mode: fluxDevTemplate[idNode].sync_mode,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "text-to-voice") {
            const TextToVoiceTemplate = JSON.parse(
              workflow.textToVoiceTemplate!
            );
            if (TextToVoiceTemplate[idNode]) {
              console.log("text-to-voice Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let prompt = nodeConnection.textToVoiceNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
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
              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/elevenlabs/text-to-voice",
                  {
                    prompt: content,
                    voice: TextToVoiceTemplate[idNode]?.voice,
                    userid: workflow.userId,
                    stability: TextToVoiceTemplate[idNode]?.stability,
                    similarity_boost:
                      TextToVoiceTemplate[idNode]?.similarity_boost,
                    style: TextToVoiceTemplate[idNode]?.style,
                  }
                );
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
                      output.data,
                    ],
                  },
                }));
                latestOutputs[idNode] = output.data;
              } catch (error) {
                console.error("Error during Elevenlabs API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
              let prompt = nodeConnection.fluxLoraNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
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
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/flux-lora", {
                  prompt: content,
                  image_size: fluxLoraTemplate[idNode].image_size,
                  userid: workflow.userId,
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
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
              let prompt = nodeConnection.imageToImageNode[idNode]?.prompt;
              let ImageFromDb =
                nodeConnection.imageToImageNode[idNode]?.image_url;
              console.log("Selected URL:", selectedurl, ImageFromDb);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                const image = contentarr.image[contentarr.image.length - 1];
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
                  if (ImageFromDb.includes(":image:") && selectedurl) {
                    Image = ImageFromDb.replace(":image:", selectedurl);
                  } else {
                    Image = latestOutputs[node.id];
                  }
                  if (prompt.includes(":input:") && selectedurl) {
                    content = prompt.replace(":input:", latestOutputs[node.id]);
                  } else {
                    content = prompt;
                  }
                } else if (!ImageFromDb && !selectedurl) {
                  Image = latestOutputs[node.id];
                  content = prompt || "";
                } else {
                  Image = selectedurl || latestOutputs[node.id];
                  content = prompt || "";
                }
              }

              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/image-to-image", {
                  prompt: content,
                  image_size: falImageTemplate[idNode].image_size,
                  image_url: Image,
                  userid: workflow.userId,
                  num_inference_steps:
                    falImageTemplate[idNode].num_inference_steps,
                  guidance_scale: falImageTemplate[idNode].guidance_scale,
                  num_images: falImageTemplate[idNode].num_images,
                  seed: falImageTemplate[idNode].seed,
                  enable_safety_checker:
                    falImageTemplate[idNode].enable_safety_checker,
                  sync_mode: falImageTemplate[idNode].sync_mode,
                  strength: falImageTemplate[idNode].strength,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
              let prompt =
                nodeConnection.autocaptionNode[idNode]?.video_file_input;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                const img = contentarr.image[contentarr.image.length - 1];
                content = img?.trim();
                if (prompt) {
                  if (prompt.includes(":video:")) {
                    content = prompt.replace(":video:", img)?.trim();
                  } else {
                    content = img?.trim();
                  }
                }
                chatHistory.user = img;
              } else {
                if (prompt) {
                  if (prompt.includes(":video:")) {
                    content = prompt.replace(":video:", selectedurl)?.trim();
                  } else {
                    content = prompt?.trim();
                  }
                } else {
                  content =
                    typeof latestOutputs[node.id] === "string"
                      ? latestOutputs[node.id].trim()
                      : latestOutputs[node.id];
                }
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/replicate/autocaption",
                  {
                    userid: workflow.userId,
                    font: nodeConnection.autocaptionNode?.font,
                    color: nodeConnection.autocaptionNode?.color,
                    kerning: nodeConnection.autocaptionNode?.kerning,
                    opacity: nodeConnection.autocaptionNode.opacity,
                    MaxChars: nodeConnection.autocaptionNode.MaxChars,
                    fontsize: nodeConnection.autocaptionNode.fontsize,
                    translate: nodeConnection.autocaptionNode.translate,
                    output_video: nodeConnection.autocaptionNode.output_video,
                    stroke_color: nodeConnection.autocaptionNode.stroke_color,
                    stroke_width: nodeConnection.autocaptionNode.stroke_width,
                    right_to_left: nodeConnection.autocaptionNode.right_to_left,
                    subs_position: nodeConnection.autocaptionNode.subs_position,
                    highlight_color:
                      nodeConnection.autocaptionNode.highlight_color,
                    video_file_input: content,
                    output_transcript:
                      nodeConnection.autocaptionNode.output_transcript,
                  }
                );
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
                      output.data,
                    ],
                  },
                }));
                latestOutputs[idNode] = output.data;
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "sadTalker") {
            const falSadTalkerTemplate = JSON.parse(
              workflow.sadTalkerTemplate!
            );
            if (falSadTalkerTemplate[idNode]) {
              console.log("sadTalker Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let Image;
              let prompt =
                nodeConnection.sadTalkerNode[idNode]?.source_image_url;
              let ImageFromDb =
                nodeConnection.sadTalkerNode[idNode]?.driven_audio_url;
              console.log("Selected URL:", selectedurl, ImageFromDb);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                const image = contentarr.image[contentarr.image.length - 1];
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
                  if (ImageFromDb.includes(":image:") && selectedurl) {
                    Image = ImageFromDb.replace(":image:", selectedurl);
                  } else {
                    Image = latestOutputs[node.id];
                  }
                  if (prompt.includes(":input:") && selectedurl) {
                    content = prompt.replace(":input:", latestOutputs[node.id]);
                  } else {
                    content = prompt;
                  }
                } else if (!ImageFromDb && !selectedurl) {
                  Image = latestOutputs[node.id];
                  content = prompt || "";
                } else {
                  Image = selectedurl || latestOutputs[node.id];
                  content = prompt || "";
                }
              }
              console.log("Content:", content, Image);
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/sadtalker", {
                  source_image_url: content,
                  driven_audio_url: Image,
                  userid: workflow.userId,
                  face_model_resolution:
                    falSadTalkerTemplate[idNode].face_model_resolution,
                  expression_scale:
                    falSadTalkerTemplate[idNode].expression_scale,
                  face_enhancer: falSadTalkerTemplate[idNode].face_enhancer,
                  preprocess: falSadTalkerTemplate[idNode].preprocess,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
                      output.data,
                    ],
                  },
                }));
                if (Array.isArray(output.data)) {
                  latestOutputs[idNode] = output.data[output.data.length - 1];
                } else {
                  latestOutputs[idNode] = output.data;
                }
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/stable-video", {
                  image_url: content,
                  userid: workflow.userId,
                  motion_bucket_id: falVideoTemplate[idNode].motion_bucket_id,
                  fps: falVideoTemplate[idNode].fps,
                  cond_aug: falVideoTemplate[idNode].cond_aug,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "consistent-character") {
            const falCharacterTemplate = JSON.parse(
              workflow.CharacterTemplate!
            );
            if (falCharacterTemplate[idNode]) {
              console.log("consistent-character Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let Image;
              let prompt = nodeConnection.imageToImageNode[idNode]?.prompt;
              let ImageFromDb =
                nodeConnection.imageToImageNode[idNode]?.image_url;
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                const image = contentarr.image[contentarr.image.length - 1];
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
                  if (ImageFromDb.includes(":image:") && selectedurl) {
                    Image = ImageFromDb.replace(":image:", selectedurl);
                  } else {
                    Image = latestOutputs[node.id];
                  }
                  if (prompt.includes(":input:") && selectedurl) {
                    content = prompt.replace(":input:", latestOutputs[node.id]);
                  } else {
                    content = prompt;
                  }
                } else if (!ImageFromDb && !selectedurl) {
                  Image = latestOutputs[node.id];
                  content = prompt || "";
                } else {
                  Image = selectedurl || latestOutputs[node.id];
                  content = prompt || "";
                }
              }

              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/replicate/consistent-character",
                  {
                    prompt: content,
                    userid: workflow.userId,
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
                    output_quality:
                      falCharacterTemplate[idNode]?.output_quality,
                  }
                );
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "CogVideoX-5B") {
            const cogVideoX5BTemplate = JSON.parse(
              workflow.cogVideo5BTemplate!
            );
            if (cogVideoX5BTemplate[idNode]) {
              console.log("CogVideoX-5B Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let prompt = nodeConnection.CogVideoX5BNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
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
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/cogVideox-5b", {
                  prompt: content,
                  userid: workflow.userId,
                  num_inference_steps:
                    cogVideoX5BTemplate[idNode]?.num_inference_steps,
                  guidance_scale: cogVideoX5BTemplate[idNode]?.guidance_scale,
                  negative_prompt: cogVideoX5BTemplate[idNode]?.negative_prompt,
                  use_rife: cogVideoX5BTemplate[idNode]?.use_rife,
                  export_fps: cogVideoX5BTemplate[idNode]?.export_fps,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
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
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "musicGen") {
            const falMusicGenTemplate = JSON.parse(workflow.musicGenTemplate!);
            if (falMusicGenTemplate[idNode]) {
              console.log("musicGen Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let prompt = nodeConnection.musicgenNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
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
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/replicate/musicgen", {
                  prompt: content,
                  userid: workflow.userId,
                  seed: falMusicGenTemplate[idNode]?.seed,
                  top_k: falMusicGenTemplate[idNode]?.top_k,
                  top_p: falMusicGenTemplate[idNode]?.top_p,
                  duration: falMusicGenTemplate[idNode]?.duration,
                  input_audio: falMusicGenTemplate[idNode]?.input_audio,
                  temperature: falMusicGenTemplate[idNode]?.temperature,
                  continuation: falMusicGenTemplate[idNode]?.continuation,
                  model_version: falMusicGenTemplate[idNode]?.model_version,
                  output_format: falMusicGenTemplate[idNode]?.output_format,
                  continuation_start:
                    falMusicGenTemplate[idNode]?.continuation_start,
                  multi_band_diffusion:
                    falMusicGenTemplate[idNode]?.multi_band_diffusion,
                  normalization_strategy:
                    falMusicGenTemplate[idNode]?.normalization_strategy,
                  classifier_free_guidance:
                    falMusicGenTemplate[idNode]?.classifier_free_guidance,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
                      output.data,
                    ],
                  },
                }));
                latestOutputs[idNode] = output.data;
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
              setHistory((prev: any) => [
                ...prev,
                { bot: latestOutputs[idNode] },
              ]);
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
            }
          }
          if (nodeType == "lumalabs-TextToVideo") {
            const lumalabsTextToVideoTemplate = JSON.parse(
              workflow.lunalabsTextToVideoTemplate!
            );
            if (lumalabsTextToVideoTemplate[idNode]) {
              console.log("lumalabs-TextToVideo Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let prompt =
                nodeConnection.lunalabsTextToVideoNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
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
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/lunalabs/text-video", {
                  prompt: content,
                  userid: workflow.userId,
                  aspect_ratio:
                    lumalabsTextToVideoTemplate[idNode].aspect_ratio,
                  loop: lumalabsTextToVideoTemplate[idNode].loop,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
                      output.data,
                    ],
                  },
                }));
                latestOutputs[idNode] = output.data;
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "lumalabs-ImageToVideo") {
            const lumalabsimageToVideoTemplate = JSON.parse(
              workflow.lunalabsImageToVideoTemplate!
            );
            if (lumalabsimageToVideoTemplate[idNode]) {
              console.log("lumalabs-TextToImage Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              let Image;
              let prompt =
                nodeConnection.lunalabsImageToVideoNode[idNode]?.prompt;
              let ImageFromDb =
                nodeConnection.lunalabsImageToVideoNode[idNode]
                  ?.start_frame_url;
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                const image = contentarr.image[contentarr.image.length - 1];
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
                  if (ImageFromDb.includes(":image:") && selectedurl) {
                    Image = ImageFromDb.replace(":image:", selectedurl);
                  } else {
                    Image = latestOutputs[node.id];
                  }
                  if (prompt.includes(":input:") && selectedurl) {
                    content = prompt.replace(":input:", latestOutputs[node.id]);
                  } else {
                    content = prompt;
                  }
                } else if (!ImageFromDb && !selectedurl) {
                  Image = latestOutputs[node.id];
                  content = prompt || "";
                } else {
                  Image = selectedurl || latestOutputs[node.id];
                  content = prompt || "";
                }
              }

              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/lunalabs/image-video",
                  {
                    prompt: content,
                    userid: workflow.userId,
                    aspect_ratio:
                      lumalabsimageToVideoTemplate[idNode].aspect_ratio,
                    loop: lumalabsimageToVideoTemplate[idNode].loop,
                    start_frame_url: Image,
                    end_frame_url:
                      lumalabsimageToVideoTemplate[idNode].end_frame_url,
                  }
                );
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [
                      ...(prev.output?.[idNode]?.video || []),
                      output.data,
                    ],
                  },
                }));
                latestOutputs[idNode] = output.data;
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
              let prompt = nodeConnection.imageToImageNode[idNode]?.prompt;
              let ImageFromDb =
                nodeConnection.imageToImageNode[idNode]?.image_url;
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                const image = contentarr.image[contentarr.image.length - 1];
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
                  if (ImageFromDb.includes(":image:") && selectedurl) {
                    Image = ImageFromDb.replace(":image:", selectedurl);
                  } else {
                    Image = latestOutputs[node.id];
                  }
                  if (prompt.includes(":input:") && selectedurl) {
                    content = prompt.replace(":input:", latestOutputs[node.id]);
                  } else {
                    content = prompt;
                  }
                } else if (!ImageFromDb && !selectedurl) {
                  Image = latestOutputs[node.id];
                  content = prompt || "";
                } else {
                  Image = selectedurl || latestOutputs[node.id];
                  content = prompt || "";
                }
              }

              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/replicate/dreamshaper",
                  {
                    prompt: content,
                    userid: workflow.userId,
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
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
            }
          }
          if (nodeType == "fluxGeneral") {
            const falGeneralTemplate = JSON.parse(
              workflow.fluxGeneralTemplate!
            );
            if (falGeneralTemplate[idNode]) {
              console.log("fluxGeneral Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/flux-general", {
                  prompt: content,
                  userid: workflow.userId,
                  num_inference_steps:
                    falGeneralTemplate[idNode]?.num_inference_steps,
                  guidance_scale: falGeneralTemplate[idNode]?.guidance_scale,
                  num_images: falGeneralTemplate[idNode]?.num_images,
                  seed: falGeneralTemplate[idNode]?.seed,
                  sync_mode: falGeneralTemplate[idNode]?.sync_mode,
                  enable_safety_checker:
                    falGeneralTemplate[idNode]?.enable_safety_checker,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/replicate/fluxDevlora",
                  {
                    prompt: content,
                    hf_loras: falDevLoraTemplate[idNode]?.hf_loras,
                    userid: workflow.userId,
                    num_outputs: falDevLoraTemplate[idNode]?.num_outputs,
                    aspect_ratio: falDevLoraTemplate[idNode]?.aspect_ratio,
                    output_format: falDevLoraTemplate[idNode]?.output_format,
                    guidance_scale: falDevLoraTemplate[idNode]?.guidance_scale,
                    output_quality: falDevLoraTemplate[idNode]?.output_quality,
                    num_inference_steps:
                      falDevLoraTemplate[idNode].num_inference_steps,
                  }
                );
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [
                      ...(prev.output?.[idNode]?.image || []),
                      output.data[0],
                    ],
                    text: [...(prev.output?.[idNode]?.text || [])],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data[0];
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/train-flux", {
                  images_data_url: falTrainTemplate[idNode].images_data_url,
                  userid: workflow?.userId,
                  trigger_word: falTrainTemplate[idNode].trigger_word,
                  iter_multiplier: falTrainTemplate[idNode].iter_multiplier,
                });
                nodeConnection.setOutput((prev: any) => ({
                  ...prev,
                  ...(prev.output || {}),
                  [idNode]: {
                    image: [...(prev.output?.[idNode]?.image || [])],
                    text: [...(prev.output?.[idNode]?.text || []), output.data],
                    video: [...(prev.output?.[idNode]?.video || [])],
                  },
                }));
                latestOutputs[idNode] = output.data;
              } catch (error) {
                console.error("Error during Replicate API call:", error);
              } finally {
                setIsLoading(idNode, false);
              }
            }
            flowPath.splice(current, 2);
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
              let prompt = nodeConnection.aiNode[idNode]?.prompt;
              console.log("Prompt:", prompt);
              if (node.type === "Trigger") {
                const output = nodeConnection.output;
                const contentarr = output[node.id];
                console.log("contentarr", contentarr);
                const prmpt = contentarr.text[contentarr.text.length - 1];
                content = prmpt;
                console.log("df", prompt, "fd", prmpt);
                if (prompt) {
                  if (prompt.includes(":input:")) {
                    content = prompt.replace(":input:", prmpt);
                  } else {
                    content = prmpt;
                  }
                }
                chatHistory.user = prmpt;
              } else {
                console.log("Not Trigger Node");
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
              if (aiTemplate[idNode].model === "vercel") {
                try {
                  setIsLoading(idNode, true);
                  const edgesArray = JSON.parse(workflow.edges || "[]");
                  const nodeArray = JSON.parse(workflow.nodes || "[]");
                  const edge = edgesArray.find((e: any) => e.target === idNode);
                  const node = nodeArray.find((n: any) => n.id === edge.source);
                  console.log("content", content);
                  const response = await axios.post("/api/ai/vercel", {
                    prompt: content,
                    system: aiTemplate[idNode].system,
                    userid: workflow.userId,
                    model: aiTemplate[idNode].localModel,
                    temperature: aiTemplate[idNode].temperature,
                    maxTokens: aiTemplate[idNode].max_tokens,
                    tools: aiTemplate[idNode].tool,
                  });
                  nodeConnection.setOutput((prev: any) => ({
                    ...prev,
                    ...(prev.output || {}),
                    [idNode]: {
                      image: [...(prev.output?.[idNode]?.image || [])],
                      text: [...(prev.output?.[idNode] || []), response.data],
                      video: [...(prev.output?.[idNode]?.video || [])],
                    },
                  }));

                  latestOutputs[idNode] = response.data;
                } catch (error) {
                  console.error("Error during vercel API call:", error);
                } finally {
                  setIsLoading(idNode, false);
                }
              } else if (aiTemplate[idNode].model === "FLUX-image") {
                try {
                  setIsLoading(idNode, true);

                  const output = await axios.post("/api/ai/FLUX-image", {
                    prompt: content,
                    userid: workflow.userId,
                  });
                  nodeConnection.setOutput((prev: any) => ({
                    ...prev,
                    ...(prev.output || {}),
                    [idNode]: {
                      image: [
                        ...(prev.output?.[idNode]?.image || []),
                        output.data[0],
                      ],
                      text: [...(prev.output?.[idNode]?.text || [])],
                      video: [...(prev.output?.[idNode]?.video || [])],
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
                    "/api/ai/superagent/getoutput",
                    {
                      prompt: content,
                      workflowId: aiTemplate[idNode].id,
                      userid: workflow.userId,
                    }
                  );
                  nodeConnection.setOutput((prev: any) => ({
                    ...prev,
                    ...(prev.output || {}),
                    [idNode]: {
                      image: [...(prev.output?.[idNode]?.image || [])],
                      text: [...(prev.output?.[idNode] || []), response.data],
                      video: [...(prev.output?.[idNode]?.video || [])],
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
            setHistory((prev: any) => [
              ...prev,
              { bot: latestOutputs[idNode] },
            ]);
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
                console.log("history", history);
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
        const newCredit = await updateCredits();
        setCredits(newCredit);
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
