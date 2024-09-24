"use client";
import EditorProvider from "@/hooks/editor-provider";
import {
  ConnectionsProvider,
  useNodeConnections,
} from "@/hooks/connections-providers";
import EditorCanvas from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas";
import { LoadingProvider } from "@/hooks/loading-provider";
import { WorkflowProvider } from "@/hooks/workflow-providers";
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
            const nodeData = dreamshaper[nodeId];
            if (!dreamshaper[nodeId]) {
              nodeConnection.dreamShaperNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image: "",
                negative_prompt: "",
                num_inference_steps: 30,
                guidance_scale: 7.5,
                num_outputs: 1,
                scheduler: "EulerAncestralDiscrete",
                upscale: 2,
                strength: 0.5,
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
            
            if (!consistentChar[nodeId]) {
              nodeConnection.consistentCharacterNode[nodeId] = {
                id: nodeId,
                prompt: "",
                subject: "",
                negative_prompt: "",
                randomise_poses: false,
                number_of_outputs: 1,
                number_of_images_per_pose: 1,
                num_outputs: 1,
                output_format: "webp",
                disable_safety_checker: false,
                output_quality: 80,
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
            if (!fluxDev[nodeId]) {
              nodeConnection.fluxDevNode[nodeId] = {
                id: nodeId,
                model: "",
                output: "",
                prompt: "",
                image_size: "landscape_4_3",
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
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
        if (workflow?.fluxGeneralTemplate) {
          const fluxGeneral = workflow.fluxGeneralTemplate
            ? JSON.parse(workflow.fluxGeneralTemplate)
            : {};
          Object.keys(fluxGeneral).forEach((nodeId) => {
            const nodeData = fluxGeneral[nodeId];
            if (!fluxGeneral[nodeId]) {
              nodeConnection.fluxGeneralNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image_size: "",
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
                seed: 0,
                sync_mode: false,
                enable_safety_checker: false,
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
            if (!fluxDevLora[nodeId]) {
              nodeConnection.fluxDevLoraNode[nodeId] = {
                id: nodeId,
                prompt: "",
                hf_loras: [],
                num_outputs: 1,
                aspect_ratio: "1:1",
                output_format: "webp",
                guidance_scale: 3.5,
                output_quality: 3.5,
                num_inference_steps: 28,
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
        if (workflow?.cogVideo5BTemplate) {
          const cogVideo5B = workflow.cogVideo5BTemplate
            ? JSON.parse(workflow.cogVideo5BTemplate)
            : {};
          Object.keys(cogVideo5B).forEach((nodeId) => {
            const nodeData = cogVideo5B[nodeId];
            if (!cogVideo5B[nodeId]) {
              nodeConnection.CogVideoX5BNode[nodeId] = {
                id: nodeId,
                prompt: "",
                num_inference_steps: 50,
                guidance_scale: 7,
                seed: 0,
                export_fps: 30,
                use_rife: false,
                negative_prompt: "",
              };
            } else {
              nodeConnection.CogVideoX5BNode[nodeId] = {
                ...nodeConnection.CogVideoX5BNode[nodeId],
                prompt: nodeData.prompt,
                num_inference_steps: nodeData.num_inference_steps,
                guidance_scale: nodeData.guidance_scale,
                negative_prompt: nodeData.negative_prompt,
                use_rife: nodeData.use_rife,
                export_fps: nodeData.export_fps,
                seed: nodeData.seed,
              };
            }
          });
        }
        if (workflow?.musicGenTemplate) {
          const musicGen = workflow.musicGenTemplate
            ? JSON.parse(workflow.musicGenTemplate)
            : {};
          Object.keys(musicGen).forEach((nodeId) => {
            const nodeData = musicGen[nodeId];
            if (!musicGen[nodeId]) {
              nodeConnection.musicgenNode[nodeId] = {
                id: nodeId,
                prompt: "",
                seed: 42,
                top_k: 250,
                top_p: 0,
                duration: 8,
                input_audio: "",
                temperature: 1,
                continuation: false,
                model_version: "stereo-large",
                output_format: "mp3",
                continuation_start: 0,
                multi_band_diffusion: false,
                normalization_strategy: "peak",
                classifier_free_guidance: 3,
              };
            } else {
              nodeConnection.musicgenNode[nodeId] = {
                ...nodeConnection.musicgenNode[nodeId],
                prompt: nodeData.prompt,
                seed: nodeData.seed,
                top_k: nodeData.top_k,
                top_p: nodeData.top_p,
                duration: nodeData.duration,
                input_audio: nodeData.input_audio,
                temperature: nodeData.temperature,
                continuation: nodeData.continuation,
                model_version: nodeData.model_version,
                output_format: nodeData.output_format,
                continuation_start: nodeData.continuation_start,
                multi_band_diffusion: nodeData.multi_band_diffusion,
                normalization_strategy: nodeData.normalization_strategy,
                classifier_free_guidance: nodeData.classifier_free_guidance,
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
            if (!imageToImage[nodeId]) {
              nodeConnection.imageToImageNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image_size: "",
                image_url: "",
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
                seed: 0,
                enable_safety_checker: false,
                sync_mode: false,
                strength: 0.95,
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
            if (!video[nodeId]) {
              nodeConnection.stableVideoNode[nodeId] = {
                id: nodeId,
                image_url: "",
                motion_bucket_id: 127,
                fps: 25,
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
        {
          workflow?.fluxloraTemplate;
        }
        {
          const fluxlora = workflow?.fluxloraTemplate
            ? JSON.parse(workflow.fluxloraTemplate)
            : {};
          Object.keys(fluxlora).forEach((nodeId) => {
            const nodeData = fluxlora[nodeId];
            if (!fluxlora[nodeId]) {
              nodeConnection.fluxLoraNode[nodeId] = {
                id: nodeId,
                prompt: "",
                image_size: "landscape_4_3",
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
                seed: 0,
                enable_safety_checker: false,
                loras: [],
                sync_mode: false,
                output_format: "jpeg",
              };
            } else {
              nodeConnection.fluxLoraNode[nodeId] = {
                ...nodeConnection.fluxLoraNode[nodeId],
                prompt: nodeData.prompt,
                image_size: nodeData.image_size,
                num_inference_steps: nodeData.num_inference_steps,
                guidance_scale: nodeData.guidance_scale,
                num_images: nodeData.num_images,
                seed: nodeData.seed,
                enable_safety_checker: nodeData.enable_safety_checker,
                loras: nodeData.loras,
                sync_mode: nodeData.sync_mode,
                output_format: nodeData.output_format,
              };
            }
          });
        }
        if (workflow?.videoToVideoTemplate) {
          const videoToVideo = workflow.videoToVideoTemplate
            ? JSON.parse(workflow.videoToVideoTemplate)
            : {};
          Object.keys(videoToVideo).forEach((nodeId) => {
            const nodeData = videoToVideo[nodeId];
            if (!videoToVideo[nodeId]) {
              nodeConnection.videoToVideoNode[nodeId] = {
                id: nodeId,
                prompt: "",
                num_inference_steps: 50,
                guidance_scale: 7,
                seed: 0,
                export_fps: 30,
                video_url: "",
                strength: 0.5,
              };
            } else {
              nodeConnection.videoToVideoNode[nodeId] = {
                ...nodeConnection.videoToVideoNode[nodeId],
                prompt: nodeData.prompt,
                seed: nodeData.seed,
                num_inference_steps: nodeData.num_inference_steps,
                guidance_scale: nodeData.guidance_scale,

                export_fps: nodeData.export_fps,
                video_url: nodeData.video_url,
                strength: nodeData.strength,
              };
            }
          });
        }
        if (workflow?.lunalabsImageToVideoTemplate) {
          const lunalabsImageToVideo = workflow.lunalabsImageToVideoTemplate
            ? JSON.parse(workflow.lunalabsImageToVideoTemplate)
            : {};
          Object.keys(lunalabsImageToVideo).forEach((nodeId) => {
            const nodeData = lunalabsImageToVideo[nodeId];
            if (!lunalabsImageToVideo[nodeId]) {
              nodeConnection.lunalabsImageToVideoNode[nodeId] = {
                id: nodeId,
                prompt: "",
                start_frame_url: "",
                end_frame_url: "",
                aspect_ratio: "16:9",
                loop: false,
              };
            } else {
              nodeConnection.lunalabsImageToVideoNode[nodeId] = {
                ...nodeConnection.lunalabsImageToVideoNode[nodeId],
                prompt: nodeData.prompt,
                loop: nodeData.loop,
                aspect_ratio: nodeData.aspect_ratio,
                start_frame_url: nodeData.start_frame_url,
                end_frame_url: nodeData.end_frame_url,
              };
            }
          });
        }
        if (workflow?.lunalabsTextToVideoTemplate) {
          const lunalabsTextToVideo = workflow.lunalabsTextToVideoTemplate
            ? JSON.parse(workflow.lunalabsTextToVideoTemplate)
            : {};
          Object.keys(lunalabsTextToVideo).forEach((nodeId) => {
            const nodeData = lunalabsTextToVideo[nodeId];
            if (!lunalabsTextToVideo[nodeId]) {
              nodeConnection.lunalabsTextToVideoNode[nodeId] = {
                id: nodeId,
                prompt: "",
                aspect_ratio: "16:9",
                loop: false,
              };
            } else {
              nodeConnection.lunalabsTextToVideoNode[nodeId] = {
                ...nodeConnection.lunalabsTextToVideoNode[nodeId],
                prompt: nodeData.prompt,
                aspect_ratio: nodeData.aspect_ratio,
                loop: nodeData.loop,
              };
            }
          });
        }
        if (workflow?.autoCaptionTemplate) {
          const autoCaption = workflow.autoCaptionTemplate
            ? JSON.parse(workflow.autoCaptionTemplate)
            : {};
          Object.keys(autoCaption).forEach((nodeId) => {
            const nodeData = autoCaption[nodeId];
            if (!autoCaption[nodeId]) {
              nodeConnection.autocaptionNode[nodeId] = {
                id: nodeId,
                font: "Poppins/Poppins-ExtraBold.ttf",
                color: "white",
                kerning: -5,
                opacity: 0,
                MaxChars: 20,
                fontsize: 7,
                translate: false,
                output_video: false,
                stroke_color: "black",
                stroke_width: 2.6,
                right_to_left: false,
                subs_position: "bottom75",
                highlight_color: "yellow",
                video_file_input: "",
                transcript_file_input: "",
                output_transcript: true,
              };
            } else {
              nodeConnection.autocaptionNode[nodeId] = {
                ...nodeConnection.autocaptionNode[nodeId],
                font: nodeData.font,
                color: nodeData.color,
                kerning: nodeData.kerning,
                opacity: nodeData.opacity,
                MaxChars: nodeData.MaxChars,
                fontsize: nodeData.fontsize,
                translate: nodeData.translate,
                output_video: nodeData.output_video,
                stroke_color: nodeData.stroke_color,
                stroke_width: nodeData.stroke_width,
                right_to_left: nodeData.right_to_left,
                subs_position: nodeData.subs_position,
                highlight_color: nodeData.highlight_color,
                video_file_input: nodeData.video_file_input,
                transcript_file_input: nodeData.transcript_file_input,
                output_transcript: nodeData.output_transcript,
              };
            }
          });
        }
        if (workflow?.sadTalkerTemplate) {
          const sadTalker = workflow.sadTalkerTemplate
            ? JSON.parse(workflow.sadTalkerTemplate)
            : {};
          Object.keys(sadTalker).forEach((nodeId) => {
            const nodeData = sadTalker[nodeId];
            if (!sadTalker[nodeId]) {
              nodeConnection.sadTalkerNode[nodeId] = {
                id: nodeId,
                source_image_url: "",
                driven_audio_url: "",
                face_model_resolution: "256",
                expression_scale: 1,
                face_enhancer: null,
                preprocess: "crop",
              };
            } else {
              nodeConnection.sadTalkerNode[nodeId] = {
                ...nodeConnection.sadTalkerNode[nodeId],
                source_image_url: nodeData.source_image_url,
                driven_audio_url: nodeData.driven_audio_url,
                face_model_resolution: nodeData.face_model_resolution,
                expression_scale: nodeData.expression_scale,
                face_enhancer: nodeData.face_enhancer,
                preprocess: nodeData.preprocess,
              };
            }
          });
        }
        if (workflow?.textToVoiceTemplate) {
          const textToVoice = workflow.textToVoiceTemplate
            ? JSON.parse(workflow.textToVoiceTemplate)
            : {};
          Object.keys(textToVoice).forEach((nodeId) => {
            const nodeData = textToVoice[nodeId];
            if (!textToVoice[nodeId]) {
              nodeConnection.textToVoiceNode[nodeId] = {
                id: nodeId,
                prompt: "",
                model_id: "eleven_multilingual_v2",
                voice: "Rachel",
                stability: 0.1,
                similarity_boost: 0.3,
                style: 0.2,
              };
            } else {
              nodeConnection.textToVoiceNode[nodeId] = {
                ...nodeConnection.textToVoiceNode[nodeId],
                prompt: nodeData.prompt,
                model_id: nodeData.model_id,
                voice: nodeData.voice,
                stability: nodeData.stability,
                similarity_boost: nodeData.similarity_boost,
                style: nodeData.style,
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
                temperature: 0.7,
                maxTokens: 100,
                endpoint: "",
                num_outputs: 0,
                aspect_ratio: "",
                output_format: "",
                guidance_scale: 0,
                tool: "",
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
              };
            }
          });
        }
        setShow(true);
        setLoading(false);
      }
    };

    checkWorkflow();
  }, [isLoaded, pathname, user, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center gap-3">
        <p className="text-xl font-semibold">Setting Up your Workflow...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }
  return (
    <div className="h-screen">
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
