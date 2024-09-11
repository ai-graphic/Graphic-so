"use client";
import EditorProvider from "@/providers/editor-provider";
import {
  ConnectionsProvider,
  useNodeConnections,
} from "@/providers/connections-providers";
import EditorCanvas from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas";
import { LoadingProvider } from "@/providers/loading-provider";
import { WorkflowProvider } from "@/providers/workflow-providers";
import { getworkflow } from "./_actions/workflow-connections";
import { usePathname, useRouter } from "next/navigation"; // Updated import
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Props = {};
const Page = (props: Props) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [workflow, setWorkflow] = useState<any>();
  const { nodeConnection } = useNodeConnections();

  useEffect(() => {
    const checkWorkflow = async () => {
      if (!isLoaded) return;

      let workflow = await getworkflow(pathname.split("/").pop()!);
      setWorkflow(workflow);
      if (workflow?.userId !== user?.id) {
        setLoading(false);
        router.push("/workflows/error");
        return <div>Loading...</div>;
      } else {
        setWorkflow(workflow);
        if (workflow?.DreamShaperTemplate) {
          const dreamshaper = workflow.DreamShaperTemplate
            ? JSON.parse(workflow.DreamShaperTemplate)
            : {};
          Object.keys(dreamshaper).forEach((nodeId) => {
            console.log(nodeId);
            const nodeData = dreamshaper[nodeId];
            console.log(nodeData);
            if (!dreamshaper[nodeId]) {
              nodeConnection.dreamShaperNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image: "",
                num_outputs: 0,
                negative_prompt: "",
                strength: 0,
                guidance_scale: 0,
                scheduler: "",
                num_inference_steps: 0,
                upscale: 0,
              };
            } else {
              nodeConnection.dreamShaperNode[nodeId] = {
                ...nodeConnection.dreamShaperNode[nodeId],
                prompt: nodeData.prompt,
                image: nodeData.image,
                num_outputs: nodeData.num_outputs,
                negative_prompt: nodeData.negative_prompt,
                strength: nodeData.strength,
                guidance_scale: nodeData.guidance_scale,
                scheduler: nodeData.scheduler,
                num_inference_steps: nodeData.num_inference_steps,
                upscale: nodeData.upscale,
              };
            }
          });
        }
        if (workflow?.CharacterTemplate) {
          const consistentChar = workflow.CharacterTemplate
            ? JSON.parse(workflow.CharacterTemplate)
            : {};
          Object.keys(consistentChar).forEach((nodeId) => {
            const nodeData = consistentChar[nodeId];
            if (!nodeConnection.consistentCharacterNode[nodeId]) {
              nodeConnection.consistentCharacterNode[nodeId] = {
                id: nodeId,
                prompt: "",
                subject: "",
                num_outputs: 0,
                negative_prompt: "",
                randomise_poses: false,
                number_of_outputs: 0,
                disable_safety_checker: false,
                number_of_images_per_pose: 0,
                output_format: "",
                output_quality: 0,
              };
            } else {
              nodeConnection.consistentCharacterNode[nodeId] = {
                ...nodeConnection.consistentCharacterNode[nodeId],
                prompt: nodeData.prompt,
                subject: nodeData.subject,
                num_outputs: nodeData.num_outputs,
                negative_prompt: nodeData.negative_prompt,
                randomise_poses: nodeData.randomise_poses,
                number_of_outputs: nodeData.number_of_outputs,
                disable_safety_checker: nodeData.disable_safety_checker,
                number_of_images_per_pose: nodeData.number_of_images_per_pose,
                output_format: nodeData.output_format,
                output_quality: nodeData.output_quality,
              };
            }
          });
        }
        if (workflow?.fluxDevTemplate) {
          const fluxDev = workflow.fluxDevTemplate
            ? JSON.parse(workflow.fluxDevTemplate)
            : {};
          Object.keys(fluxDev).forEach((nodeId) => {
            const nodeData = fluxDev[nodeId];
            if (!nodeConnection.fluxDevNode[nodeId]) {
              nodeConnection.fluxDevNode[nodeId] = {
                id: nodeId,
                model: "", // Added missing property
                output: "", // Added missing property
                prompt: "",
                image_size: "",
                num_inference_steps: 0,
                guidance_scale: 0,
                num_images: 0,
                seed: 0,
                enable_safety_checker: false,
                sync_mode: false,
              };
            } else {
              nodeConnection.fluxDevNode[nodeId] = {
                ...nodeConnection.fluxDevNode[nodeId],
                model: nodeData.model, // Added missing property
                output: nodeData.output, // Added missing property
                prompt: nodeData.prompt,
                image_size: nodeData.image_size,
                num_inference_steps: nodeData.num_inference_steps,
                guidance_scale: nodeData.guidance_scale,
                num_images: nodeData.num_images,
                seed: nodeData.seed,
                enable_safety_checker: nodeData.enable_safety_checker,
                sync_mode: nodeData.sync_mode,
              };
            }
          });
        }
        if (workflow?.DreamShaperTemplate) {
          const dreamshaper = workflow.DreamShaperTemplate
            ? JSON.parse(workflow.DreamShaperTemplate)
            : {};
          Object.keys(dreamshaper).forEach((nodeId) => {
            const nodeData = dreamshaper[nodeId];
            if (!nodeConnection.dreamShaperNode[nodeId]) {
              nodeConnection.dreamShaperNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image: "",
                num_outputs: 0,
                negative_prompt: "",
                strength: 0,
                guidance_scale: 0,
                scheduler: "",
                num_inference_steps: 0,
                upscale: 0,
              };
            } else {
              nodeConnection.dreamShaperNode[nodeId] = {
                ...nodeConnection.dreamShaperNode[nodeId],
                prompt: nodeData.prompt,
                image: nodeData.image,
                num_outputs: nodeData.num_outputs,
                negative_prompt: nodeData.negative_prompt,
                strength: nodeData.strength,
                guidance_scale: nodeData.guidance_scale,
                scheduler: nodeData.scheduler,
                num_inference_steps: nodeData.num_inference_steps,
                upscale: nodeData.upscale,
              };
            }
          });
        }
        if (workflow?.fluxGeneralTemplate) {
          const fluxGeneral = workflow.fluxGeneralTemplate
            ? JSON.parse(workflow.fluxGeneralTemplate)
            : {};
          Object.keys(fluxGeneral).forEach((nodeId) => {
            const nodeData = fluxGeneral[nodeId];
            if (!nodeConnection.fluxGeneralNode[nodeId]) {
              nodeConnection.fluxGeneralNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image_size: "",
                num_inference_steps: 0,
                guidance_scale: 0,
                num_images: 0,
                seed: 0,
                enable_safety_checker: false,
                sync_mode: false,
              };
            } else {
              nodeConnection.fluxGeneralNode[nodeId] = {
                ...nodeConnection.fluxGeneralNode[nodeId],
                prompt: nodeData.prompt,
                image_size: nodeData.image_size,
                num_inference_steps: nodeData.num_inference_steps,
                guidance_scale: nodeData.guidance_scale,
                num_images: nodeData.num_images,
                seed: nodeData.seed,
                enable_safety_checker: nodeData.enable_safety_checker,
                sync_mode: nodeData.sync_mode,
              };
            }
          });
        }
        if (workflow?.fluxDevLora) {
          const fluxDevLora = workflow.fluxDevLora
            ? JSON.parse(workflow.fluxDevLora)
            : {};
          Object.keys(fluxDevLora).forEach((nodeId) => {
            const nodeData = fluxDevLora[nodeId];
            if (!nodeConnection.fluxDevLoraNode[nodeId]) {
              nodeConnection.fluxDevLoraNode[nodeId] = {
                id: nodeId,
                prompt: "",
                hf_loras: [],
                num_outputs: 1,
                aspect_ratio: "",
                output_format: "",
                guidance_scale: 0,
                output_quality: "",
                num_inference_steps: 0,
              };
            } else {
              nodeConnection.fluxDevLoraNode[nodeId] = {
                ...nodeConnection.fluxDevLoraNode[nodeId],
                prompt: nodeData.prompt,
                hf_loras: nodeData.hf_loras,
                num_outputs: nodeData.num_outputs,
                aspect_ratio: nodeData.aspect_ratio,
                output_format: nodeData.output_format,
                guidance_scale: nodeData.guidance_scale,
                output_quality: nodeData.output_quality,
                num_inference_steps: nodeData.num_inference_steps,
              };
            }
          });
        }
        if (workflow?.ImageToImageTemplate) {
          const imageToImage = workflow.ImageToImageTemplate
            ? JSON.parse(workflow.ImageToImageTemplate)
            : {};
          Object.keys(imageToImage).forEach((nodeId) => {
            const nodeData = imageToImage[nodeId];
            if (!nodeConnection.imageToImageNode[nodeId]) {
              nodeConnection.imageToImageNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image_size: "",
                image_url: "",
                num_inference_steps: 0,
                guidance_scale: 0,
                num_images: 0,
                seed: 0,
                enable_safety_checker: false,
                sync_mode: false,
                strength: 0,
              };
            } else {
              nodeConnection.imageToImageNode[nodeId] = {
                ...nodeConnection.imageToImageNode[nodeId],
                prompt: nodeData.prompt,
                image_size: nodeData.image_size,
                image_url: nodeData.image_url,
                num_inference_steps: nodeData.num_inference_steps,
                guidance_scale: nodeData.guidance_scale,
                num_images: nodeData.num_images,
                seed: nodeData.seed,
                enable_safety_checker: nodeData.enable_safety_checker,
                sync_mode: nodeData.sync_mode,
                strength: nodeData.strength,
              };
            }
          });
        }
        if (workflow?.videoTemplate) {
          const video = workflow.videoTemplate
            ? JSON.parse(workflow.videoTemplate)
            : {};
          Object.keys(video).forEach((nodeId) => {
            const nodeData = video[nodeId];
            if (!nodeConnection.stableVideoNode[nodeId]) {
              nodeConnection.stableVideoNode[nodeId] = {
                id: nodeId,
                image_url: "",
                motion_bucket_id: "",
                fps: 0,
                cond_aug: false,
              };
            } else {
              nodeConnection.stableVideoNode[nodeId] = {
                ...nodeConnection.stableVideoNode[nodeId],
                image_url: nodeData.image_url,
                motion_bucket_id: nodeData.motion_bucket_id,
                fps: nodeData.fps,
                cond_aug: nodeData.cond_aug,
              };
            }
          });
        }

        if (workflow?.AiTemplate) {
          const aiTemplate = workflow.AiTemplate
            ? JSON.parse(workflow.AiTemplate)
            : {};
          Object.keys(aiTemplate).forEach((nodeId) => {
            const nodeData = aiTemplate[nodeId];

            if (!nodeConnection.aiNode[nodeId] && nodeData.model) {
              nodeConnection.aiNode[nodeId] = {
                id: "",
                system: "",
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
                history: true,
              };
            }

            if (nodeData.model === "SuperAgent") {
              nodeConnection.aiNode[nodeId] = nodeData;
            } else {
              // Otherwise, update selectively
              nodeConnection.aiNode[nodeId] = {
                ...nodeConnection.aiNode[nodeId], // Preserve existing data
                model: nodeData.model,
                prompt: nodeData.prompt,
                system: nodeData.system,
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
        }
        console.log(nodeConnection);
        setShow(true);
        setLoading(false);
      }
    };

    checkWorkflow();
  }, [isLoaded, pathname, user, router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-3">
        <p className="text-xl font-semibold">Setting Up your Workflow...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }
  return (
    <div className="h-full">
      {show ? (
        <WorkflowProvider>
          <LoadingProvider>
            <EditorProvider>
              <ConnectionsProvider>
                <EditorCanvas
                  workflow={workflow}
                  setworkflow={setWorkflow}
                  nodeConnection={nodeConnection}
                />
              </ConnectionsProvider>
            </EditorProvider>
          </LoadingProvider>
        </WorkflowProvider>
      ) : null}
    </div>
  );
};
export default Page;
