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
import FluxDevLora from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/nodes/fluxDevLora";
import { updateCredits } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import { toast } from "sonner";

type WorkflowContextType = {
  runWorkFlow: (
    workflowId: string,
    nodeConnection: any,
    setIsLoading: any,
    credits: string,
    setCredits: any,
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
      credits: string,
      setCredits: any,
      setHistory?: any
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
        if (parseInt(credits) <= Math.ceil(flowPath.length / 2) - 1) {
          toast.error("Insufficient Credits");
          return;
        }

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
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
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
            }
            console.log("flow", flowPath, chatHistory);
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
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
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
            }
            console.log("flow", flowPath, chatHistory);
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
          if (nodeType == "image-to-image") {
            const falImageTemplate = JSON.parse(workflow.ImageToImageTemplate!);
            if (falImageTemplate[idNode]) {
              console.log("image-to-image Node:", idNode);
              const edgesArray = JSON.parse(workflow.edges || "[]");
              const nodeArray = JSON.parse(workflow.nodes || "[]");
              const edge = edgesArray.find((e: any) => e.target === idNode);
              const node = nodeArray.find((n: any) => n.id === edge.source);
              let content;
              if (node.type === "Trigger") {
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post("/api/ai/fal/image-to-image", {
                  prompt: falImageTemplate[idNode].prompt,
                  image_size: falImageTemplate[idNode].image_size,
                  image_url: content,
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
            }
            console.log("flow", flowPath, chatHistory);
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
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
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
            }
            console.log("flow", flowPath, chatHistory);
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
              if (node.type === "Trigger") {
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/replicate/consistent-character",
                  {
                    prompt: falCharacterTemplate[idNode]?.prompt,
                    userid: workflow.userId,
                    subject: content,
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
            }
            console.log("flow", flowPath, chatHistory);
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
              if (node.type === "Trigger") {
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
                chatHistory.user = prmpt;
                content = prmpt;
              } else {
                content = latestOutputs[node.id];
              }
              try {
                setIsLoading(idNode, true);
                const output = await axios.post(
                  "/api/ai/replicate/dreamshaper",
                  {
                    prompt: falDreamShaperTemplate[idNode].prompt,
                    userid: workflow.userId,
                    num_inference_steps:
                      falDreamShaperTemplate[idNode].num_inference_steps,
                    image: content,
                    negative_prompt:
                      falDreamShaperTemplate[idNode]?.negative_prompt,
                    strength: falDreamShaperTemplate[idNode]?.strength,
                    scheduler: falDreamShaperTemplate[idNode]?.scheduler,
                    upscale: falDreamShaperTemplate[idNode]?.upscale,
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
            }
            console.log("flow", flowPath, chatHistory);
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
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
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
            }
            console.log("flow", flowPath, chatHistory);
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
                const output = nodeConnection.output
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
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
            }
            console.log("flow", flowPath, chatHistory);
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
          if (nodeType == "train-flux") {
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
                const output = nodeConnection.output 
                const contentarr = output[node.id];
                const prmpt = contentarr[contentarr.length - 1];
                content = prmpt
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
              if (aiTemplate[idNode].model === "Openai") {
                try {
                  setIsLoading(idNode, true);
                  const edgesArray = JSON.parse(workflow.edges || "[]");
                  const nodeArray = JSON.parse(workflow.nodes || "[]");
                  const edge = edgesArray.find((e: any) => e.target === idNode);
                  const node = nodeArray.find((n: any) => n.id === edge.source);
                  console.log("content", content);
                  const response = await axios.post("/api/ai/openai", {
                    prompt: content,
                    system: aiTemplate[idNode].system,
                    userid: workflow.userId,
                  });
                  nodeConnection.setAINode((prev: any) => ({
                    ...prev,
                      ...(prev.output || {}),
                      [idNode]: [
                        ...(prev.output?.[idNode] || []),
                        response.data,
                      ],
                  }));
                  console.log("AI Response:", response.data);
                  const aiResponseContent = response.data;
                  const aiTemplateObj = JSON.parse(workflow.AiTemplate!);
                  if (!aiTemplateObj.output) {
                    aiTemplateObj.output = {};
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

                  const output = await axios.post("/api/ai/FLUX-image", {
                    prompt: content,
                    userid: workflow.userId,
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

                  const response = await axios.post(
                    "/api/ai/superagent/getoutput",
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
