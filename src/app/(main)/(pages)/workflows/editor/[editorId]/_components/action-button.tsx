import React, { useCallback, useEffect, useState } from "react";
import { Option } from "./Settings-content";
import {
  ConnectionProviderProps,
  useNodeConnections,
} from "@/hooks/connections-providers";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { onCreateNodeTemplate } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { toast } from "sonner";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import axios from "axios";
import { useEditor } from "@/hooks/editor-provider";
import Link from "next/link";
import { useLoading } from "@/hooks/loading-provider";
import SaveFlow from "./save-flow";
import { EditorNodeType } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { on } from "events";
import { useBilling } from "@/hooks/billing-provider";

type Props = {
  currentService: string;
  channels?: Option[];
  setChannels?: (value: Option[]) => void;
  nodes: EditorNodeType[];
  edges: any;
  setNodes: (nodes: EditorNodeType[]) => void;
  setEdges: (edges: any) => void;
};

const ActionButton = ({
  currentService,
  channels,
  setChannels,
  nodes,
  edges,
  setNodes,
  setEdges,
}: Props) => {
  const pathname = usePathname();
  const { isLoading, setIsLoading } = useLoading();
  const { user } = useUser();
  const { credits, setCredits } = useBilling();
  const { nodeConnection } = useNodeConnections();
  const onSendDiscordMessage = useCallback(async () => {
    const response = await postContentToWebHook(
      nodeConnection.discordNode.content,
      nodeConnection.discordNode.webhookURL
    );

    if (response.message == "success") {
      nodeConnection.setDiscordNode((prev: any) => ({
        ...prev,
        content: "",
      }));
    }
  }, [nodeConnection.discordNode]);

  const onStoreNotionContent = useCallback(async () => {
    const response = await onCreateNewPageInDatabase(
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    );
    if (response) {
      nodeConnection.setNotionNode((prev: any) => ({
        ...prev,
        content: "",
      }));
    }
  }, [nodeConnection.notionNode]);

  const onStoreSlackContent = useCallback(async () => {
    const response = await postMessageToSlack(
      nodeConnection.slackNode.slackAccessToken,
      channels!,
      nodeConnection.slackNode.content
    );
    if (response.message == "Success") {
      toast.success("Message sent successfully");
      nodeConnection.setSlackNode((prev: any) => ({
        ...prev,
        content: "",
      }));
      setChannels!([]);
    } else {
      toast.error(response.message);
    }
  }, [nodeConnection.slackNode, channels]);


  // what is parameter to set dependecny array 

  const onLivePortrait = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 10) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/live-portrait", {
        video_url: nodeConnection.livePortraitNode[id].video_url,
        image_url: nodeConnection.livePortraitNode[id].image_url,
        userid: user?.id,
        blink: nodeConnection.livePortraitNode[id].blink,
        eyebrow: nodeConnection.livePortraitNode[id].eyebrow,
        wink: nodeConnection.livePortraitNode[id].wink,
        pupil_x: nodeConnection.livePortraitNode[id].pupil_x,
        pupil_y: nodeConnection.livePortraitNode[id].pupil_y,
        aaa: nodeConnection.livePortraitNode[id].aaa,
        eee: nodeConnection.livePortraitNode[id].eee,
        woo: nodeConnection.livePortraitNode[id].woo,
        smile: nodeConnection.livePortraitNode[id].smile,
        flag_lip_zero: nodeConnection.livePortraitNode[id].flag_lip_zero,
        flag_stitching: nodeConnection.livePortraitNode[id].flag_stitching,
        flag_relative: nodeConnection.livePortraitNode[id].flag_relative,
        flag_pasteback: nodeConnection.livePortraitNode[id].flag_pasteback,
        flag_do_crop: nodeConnection.livePortraitNode[id].flag_do_crop,
        flag_do_rot: nodeConnection.livePortraitNode[id].flag_do_rot,
        dsize: nodeConnection.livePortraitNode[id].dsize ,
        scale: nodeConnection.livePortraitNode[id].scale,
        vx_ratio: nodeConnection.livePortraitNode[id].vx_ratio,
        vy_ratio: nodeConnection.livePortraitNode[id].vy_ratio,
        batch_size: nodeConnection.livePortraitNode[id].batch_size,
        enable_safety_checker: nodeConnection.livePortraitNode[id].enable_safety_checker,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 10).toString());
    } catch (error) {
      console.error("Error during Live Portrait API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, [])



  const onFluxDev = useCallback(
    async (id: string, nodeConnection: any) => {
      try {
        if (Number(credits) < 1) {
          toast.error("Insufficient credits");
          return;
        }
        setIsLoading(id, true);
        const response = await axios.post("/api/ai/fal/flux-dev", {
          prompt: nodeConnection.fluxDevNode[id].prompt,
          image_size: nodeConnection.fluxDevNode[id].image_size,
          userid: user?.id,
          credits: credits,
          num_inference_steps:
            nodeConnection.fluxDevNode[id].num_inference_steps,
          guidance_scale: nodeConnection.fluxDevNode[id].guidance_scale,
          num_images: nodeConnection.fluxDevNode[id].num_images,
          seed: nodeConnection.fluxDevNode[id].seed,
          enable_safety_checker:
            nodeConnection.fluxDevNode[id].enable_safety_checker,
          sync_mode: nodeConnection.fluxDevNode[id].sync_mode,
        });
        nodeConnection.setOutput((prev: any) => ({
          ...prev,
          ...(prev.output || {}),
          [id]: {
            image: [...(prev.output?.[id]?.image || []), response.data],
            text: [...(prev.output?.[id]?.text || [])],
            video: [...(prev.output?.[id]?.video || [])],
          },
        }));
        setCredits((prev) => (Number(prev) - 1).toString());
      } catch (error) {
        console.error("Error during Flux Dev API call:", error);
        toast.error("Error during Flux Dev API call");
        toast.error("Please check your credits");
      } finally {
        setIsLoading(id, false);
      }
    },
    [nodeConnection.fluxDevNode, pathname]
  );

  const onImageToImage = useCallback(
    async (id: string, nodeConnection: any) => {
      try {
        if (Number(credits) < 1) {
          toast.error("Insufficient credits");
          return;
        }
        setIsLoading(id, true);

        const response = await axios.post("/api/ai/fal/image-to-image", {
          prompt: nodeConnection.imageToImageNode[id].prompt,
          image_size: nodeConnection.imageToImageNode[id].image_size,
          image_url: nodeConnection.imageToImageNode[id].image_url,
          userid: user?.id,
          num_inference_steps:
            nodeConnection.imageToImageNode[id].num_inference_steps,
          guidance_scale: nodeConnection.imageToImageNode[id].guidance_scale,
          num_images: nodeConnection.imageToImageNode[id].num_images,
          seed: nodeConnection.imageToImageNode[id].seed,
          enable_safety_checker:
            nodeConnection.imageToImageNode[id].enable_safety_checker,
          sync_mode: nodeConnection.imageToImageNode[id].sync_mode,
          strength: nodeConnection.imageToImageNode[id].strength,
        });
        nodeConnection.setOutput((prev: any) => ({
          ...prev,
          ...(prev.output || {}),
          [id]: {
            image: [...(prev.output?.[id]?.image || []), response.data],
            text: [...(prev.output?.[id]?.text || [])],
            video: [...(prev.output?.[id]?.video || [])],
          },
        }));
        setCredits((prev) => (Number(prev) - 1).toString());
      } catch (error) {
        console.error("Error during Image to Image API call:", error);
      } finally {
        setIsLoading(id, false);
      }
    },
    []
  );
  const onFluxLora = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);

      const response = await axios.post("/api/ai/fal/flux-lora", {
        prompt: nodeConnection.fluxLoraNode[id].prompt,
        image_size: nodeConnection.fluxLoraNode[id].image_size,
        userid: user?.id,
        num_inference_steps:
          nodeConnection.fluxLoraNode[id].num_inference_steps,
        guidance_scale: nodeConnection.fluxLoraNode[id].guidance_scale,
        num_images: nodeConnection.fluxLoraNode[id].num_images,
        seed: nodeConnection.fluxLoraNode[id].seed,
        enable_safety_checker:
          nodeConnection.fluxLoraNode[id].enable_safety_checker,
        loras: nodeConnection.fluxLoraNode[id].loras,
        sync_mode: nodeConnection.fluxLoraNode[id].sync_mode,
        output_format: nodeConnection.fluxLoraNode[id].output_format,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || []), response.data],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || [])],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Flux Lora API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);
  const onTrainFlux = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 60) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/train-flux", {
        images_data_url: nodeConnection.trainFluxNode[id].images_data_url,
        userid: user?.id,
        trigger_word: nodeConnection.trainFluxNode[id].trigger_word,
        iter_multiplier: nodeConnection.trainFluxNode[id].iter_multiplier,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || []), response.data],
          video: [...(prev.output?.[id]?.video || [])],
        },
      }));
      setCredits((prev) => (Number(prev) - 60).toString());
    } catch (error) {
      console.error("Error during Train Flux API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);
  const onStableVideo = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 10) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/stable-video", {
        image_url: nodeConnection.stableVideoNode[id].image_url,
        userid: user?.id,
        motion_bucket_id: nodeConnection.stableVideoNode[id].motion_bucket_id,
        fps: nodeConnection.stableVideoNode[id].fps,
        cond_aug: nodeConnection.stableVideoNode[id].cond_aug,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: [...(prev.output?.[id] || []), response.data],
      }));
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 10).toString());
    } catch (error) {
      console.error("Error during Stable Video API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onConsistantChar = useCallback(
    async (id: string, nodeConnection: any) => {
      try {
        if (Number(credits) < 1) {
          toast.error("Insufficient credits");
          return;
        }
        setIsLoading(id, true);
        nodeConnection.consistentCharacterNode[id];
        const response = await axios.post(
          "/api/ai/replicate/consistent-character",
          {
            prompt: nodeConnection.consistentCharacterNode[id]?.prompt,
            userid: user?.id,
            subject: nodeConnection.consistentCharacterNode[id]?.subject,
            num_outputs:
              nodeConnection.consistentCharacterNode[id]?.num_outputs,
            negative_prompt:
              nodeConnection.consistentCharacterNode[id]?.negative_prompt,
            randomise_poses:
              nodeConnection.consistentCharacterNode[id]?.randomise_poses,
            number_of_outputs:
              nodeConnection.consistentCharacterNode[id]?.number_of_outputs,
            disable_safety_checker:
              nodeConnection.consistentCharacterNode[id]
                ?.disable_safety_checker,
            number_of_images_per_pose:
              nodeConnection.consistentCharacterNode[id]
                ?.number_of_images_per_pose,
            output_format:
              nodeConnection.consistentCharacterNode[id]?.output_format,
            output_quality:
              nodeConnection.consistentCharacterNode[id]?.output_quality,
          }
        );
        nodeConnection.setOutput((prev: any) => ({
          ...prev,
          ...(prev.output || {}),
          [id]: {
            image: [...(prev.output?.[id]?.image || []), response.data],
            text: [...(prev.output?.[id]?.text || [])],
            video: [...(prev.output?.[id]?.video || [])],
          },
        }));
        setCredits((prev) => (Number(prev) - 1).toString());
      } catch (error) {
        console.error("Error during Consistant Character API call:", error);
      } finally {
        setIsLoading(id, false);
      }
    },
    []
  );

  const onFluxDevLora = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/replicate/fluxDevlora", {
        prompt: nodeConnection.fluxDevLoraNode[id]?.prompt,
        hf_loras: nodeConnection.fluxDevLoraNode[id]?.hf_loras,
        userid: user?.id,
        num_outputs: nodeConnection.fluxDevLoraNode[id]?.num_outputs,
        aspect_ratio: nodeConnection.fluxDevLoraNode[id]?.aspect_ratio,
        output_format: nodeConnection.fluxDevLoraNode[id]?.output_format,
        guidance_scale: nodeConnection.fluxDevLoraNode[id]?.guidance_scale,
        output_quality: nodeConnection.fluxDevLoraNode[id]?.output_quality,
        num_inference_steps:
          nodeConnection.fluxDevLoraNode[id].num_inference_steps,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || []), response.data],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || [])],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Flux Dev Lora API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onDreamShaper = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);

      const response = await axios.post("/api/ai/replicate/dreamshaper", {
        prompt: nodeConnection.dreamShaperNode[id]?.prompt,
        userid: user?.id,
        image: nodeConnection.dreamShaperNode[id]?.image,
        num_inference_steps:
          nodeConnection.dreamShaperNode[id]?.num_inference_steps,
        negative_prompt: nodeConnection.dreamShaperNode[id]?.negative_prompt,
        strength: nodeConnection.dreamShaperNode[id]?.strength,
        scheduler: nodeConnection.dreamShaperNode[id]?.scheduler,
        upscale: nodeConnection.dreamShaperNode[id]?.upscale,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || []), response.data],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || [])],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Dream Shaper API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onFluxGeneral = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/flux-general", {
        prompt: nodeConnection.fluxGeneralNode[id]?.prompt,
        userid: user?.id,
        num_inference_steps:
          nodeConnection.fluxGeneralNode[id]?.num_inference_steps,
        image_size: nodeConnection.fluxGeneralNode[id]?.image_size,
        guidance_scale: nodeConnection.fluxGeneralNode[id]?.guidance_scale,
        num_images: nodeConnection.fluxGeneralNode[id]?.num_images,
        seed: nodeConnection.fluxGeneralNode[id]?.seed,
        sync_mode: nodeConnection.fluxGeneralNode[id]?.sync_mode,
        enable_safety_checker:
          nodeConnection.fluxGeneralNode[id]?.enable_safety_checker,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || []), response.data],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || [])],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Flux General API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onMusicGen = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/replicate/musicgen", {
        prompt: nodeConnection.musicgenNode[id]?.prompt,
        userid: user?.id,
        seed: nodeConnection.musicgenNode[id]?.seed,
        top_k: nodeConnection.musicgenNode[id]?.top_k,
        top_p: nodeConnection.musicgenNode[id]?.top_p,
        duration: nodeConnection.musicgenNode[id]?.duration,
        input_audio: nodeConnection.musicgenNode[id]?.input_audio,
        temperature: nodeConnection.musicgenNode[id]?.temperature,
        continuation: nodeConnection.musicgenNode[id]?.continuation,
        model_version: nodeConnection.musicgenNode[id]?.model_version,
        output_format: nodeConnection.musicgenNode[id]?.output_format,
        continuation_start: nodeConnection.musicgenNode[id]?.continuation_start,
        multi_band_diffusion:
          nodeConnection.musicgenNode[id]?.multi_band_diffusion,
        normalization_strategy:
          nodeConnection.musicgenNode[id]?.normalization_strategy,
        classifier_free_guidance:
          nodeConnection.musicgenNode[id]?.classifier_free_guidance,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Music Gen API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onCogVideoX = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 10) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/cogVideox-5b", {
        prompt: nodeConnection.CogVideoX5BNode[id]?.prompt,
        userid: user?.id,
        num_inference_steps:
          nodeConnection.CogVideoX5BNode[id]?.num_inference_steps,
        guidance_scale: nodeConnection.CogVideoX5BNode[id]?.guidance_scale,
        negative_prompt: nodeConnection.CogVideoX5BNode[id]?.negative_prompt,
        use_rife: nodeConnection.CogVideoX5BNode[id]?.use_rife,
        export_fps: nodeConnection.CogVideoX5BNode[id]?.export_fps,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 10).toString());
    } catch (error) {
      console.error("Error during Cog Video X API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onAiSearch = useCallback(
    async (id: string, nodeConnection: any) => {
      if (!nodeConnection.aiNode[id]) {
        toast.error("Please select a model first");
        return;
      }
      if (!nodeConnection.aiNode[id].prompt) {
        toast.error("Please enter a prompt first");
        return;
      }
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      if (nodeConnection.aiNode[id].model === "vercel") {
        try {
          setIsLoading(id, true);
          const response = await axios.post("/api/ai/vercel", {
            prompt: nodeConnection.aiNode[id]?.prompt,
            system: nodeConnection.aiNode[id]?.system,
            userid: user?.id,
            model: nodeConnection.aiNode[id]?.localModel,
            temperature: nodeConnection.aiNode[id]?.temperature,
            maxTokens: nodeConnection.aiNode[id]?.max_tokens,
            tools: nodeConnection.aiNode[id]?.tool,
          });
          nodeConnection.setOutput((prev: any) => ({
            ...prev,
            ...(prev.output || {}),
            [id]: {
              image: [...(prev.output?.[id]?.image || [])],
              text: [...(prev.output?.[id]?.text || []), response.data],
              video: [...(prev.output?.[id]?.video || [])],
            },
          }));
          setCredits((prev) => (Number(prev) - 1).toString());
        } catch (error) {
          console.error("Error during AI search:", error);
        } finally {
          setIsLoading(id, false);
        }
      } else if (nodeConnection.aiNode[id].model === "FLUX-image") {
        try {
          setIsLoading(id, true);
          const response = await axios.post("/api/ai/FLUX-image", {
            prompt: nodeConnection.aiNode[id].prompt,
            userid: user?.id,
            temperature: nodeConnection.aiNode[id].temperature,
            maxTokens: nodeConnection.aiNode[id].maxTokens,
            num_outputs: nodeConnection.aiNode[id].num_outputs,
            aspect_ratio: nodeConnection.aiNode[id].aspect_ratio,
            output_format: nodeConnection.aiNode[id].output_format,
            guidance_scale: nodeConnection.aiNode[id].guidance_scale,
            output_quality: nodeConnection.aiNode[id].output_quality,
            num_inference_steps: nodeConnection.aiNode[id].num_inference_steps,
          });
          nodeConnection.setOutput((prev: any) => ({
            ...prev,
            ...(prev.output || {}),
            [id]: {
              image: [...(prev.output?.[id]?.image || []), response.data[0]],
              text: [...(prev.output?.[id]?.text || [])],
              video: [...(prev.output?.[id]?.video || [])],
            },
          }));
          setCredits((prev) => (Number(prev) - 1).toString());
        } catch (error) {
          console.error("Error during Replicate API call:", error);
        } finally {
          setIsLoading(id, false);
        }
      } else if (nodeConnection.aiNode[id].model === "SuperAgent") {
        ("AI model:");
        try {
          ("yo");
          const response = await axios.post("/api/ai/superagent/getoutput", {
            prompt: nodeConnection.aiNode[id].prompt,
            workflowId: nodeConnection.aiNode[id].id,
            userid: user?.id,
            history: nodeConnection.aiNode[id].history,
          });
          nodeConnection.setOutput((prev: any) => ({
            ...prev,
            ...(prev.output || {}),
            [id]: {
              image: [...(prev.output?.[id]?.image || [])],
              text: [...(prev.output?.[id]?.text || []), response.data.output],
              video: [...(prev.output?.[id]?.video || [])],
            },
          }));
          setCredits((prev) => (Number(prev) - 1).toString());
        } catch (error) {
          console.error("Error during superAgent API call:", error);
        } finally {
          setIsLoading(id, false);
        }
      }
    },
    [nodeConnection.aiNode, pathname]
  );

  const onVideoToVideo = useCallback(
    async (id: string, nodeConnection: any) => {
      try {
        if (Number(credits) < 10) {
          toast.error("Insufficient credits");
          return;
        }
        setIsLoading(id, true);
        const response = await axios.post("/api/ai/fal/video-to-video", {
          prompt: nodeConnection.videoToVideoNode[id].prompt,
          userid: user?.id,
          negative_prompt: nodeConnection.videoToVideoNode[id].negative_prompt,
          num_inference_steps:
            nodeConnection.videoToVideoNode[id]?.num_inference_steps,
          guidance_scale: nodeConnection.videoToVideoNode[id]?.guidance_scale,
          use_rife: nodeConnection.videoToVideoNode[id]?.use_rife,
          export_fps: nodeConnection.videoToVideoNode[id]?.export_fps,
          video_url: nodeConnection.videoToVideoNode[id]?.video_url,
          strength: nodeConnection.videoToVideoNode[id]?.strength,
        });
        nodeConnection.setOutput((prev: any) => ({
          ...prev,
          ...(prev.output || {}),
          [id]: {
            image: [...(prev.output?.[id]?.image || [])],
            text: [...(prev.output?.[id]?.text || [])],
            video: [...(prev.output?.[id]?.video || []), response.data],
          },
        }));
        setCredits((prev) => (Number(prev) - 10).toString());
      } catch (error) {
        console.error("Error during Video to Video API call:", error);
      } finally {
        setIsLoading(id, false);
      }
    },
    []
  );

  const onLunaLabsTextToVideo = useCallback(
    async (id: string, nodeConnection: any) => {
      try {
        if (Number(credits) < 10) {
          toast.error("Insufficient credits");
          return;
        }
        setIsLoading(id, true);
        const response = await axios.post("/api/ai/lunalabs/text-video", {
          prompt: nodeConnection.lunalabsTextToVideoNode[id]?.prompt,
          userid: user?.id,
          aspect_ratio:
            nodeConnection.lunalabsTextToVideoNode[id]?.aspect_ratio,
          loop: nodeConnection.lunalabsTextToVideoNode[id]?.loop,
        });
        nodeConnection.setOutput((prev: any) => ({
          ...prev,
          ...(prev.output || {}),
          [id]: {
            image: [...(prev.output?.[id]?.image || [])],
            text: [...(prev.output?.[id]?.text || [])],
            video: [...(prev.output?.[id]?.video || []), response.data],
          },
        }));
        setCredits((prev) => (Number(prev) - 10).toString());
      } catch (error) {
        console.error("Error during Luna Labs Text to Video API call:", error);
      } finally {
        setIsLoading(id, false);
      }
    },
    []
  );

  const onLunaLabsImageToVideo = useCallback(
    async (id: string, nodeConnection: any) => {
      try {
        if (Number(credits) < 10) {
          toast.error("Insufficient credits");
          return;
        }
        setIsLoading(id, true);
        const response = await axios.post("/api/ai/lunalabs/image-video", {
          prompt: nodeConnection.lunalabsImageToVideoNode[id]?.prompt,
          userid: user?.id,
          start_frame_url:
            nodeConnection.lunalabsImageToVideoNode[id]?.start_frame_url,
          end_frame_url:
            nodeConnection.lunalabsImageToVideoNode[id]?.end_frame_url,
          aspect_ratio:
            nodeConnection.lunalabsImageToVideoNode[id]?.aspect_ratio,
          loop: nodeConnection.lunalabsImageToVideoNode[id]?.loop,
        });
        nodeConnection.setOutput((prev: any) => ({
          ...prev,
          ...(prev.output || {}),
          [id]: {
            image: [...(prev.output?.[id]?.image || [])],
            text: [...(prev.output?.[id]?.text || [])],
            video: [...(prev.output?.[id]?.video || []), response.data],
          },
        }));
        setCredits((prev) => (Number(prev) - 10).toString());
      } catch (error) {
        console.error("Error during Luna Labs Image to Video API call:", error);
      } finally {
        setIsLoading(id, false);
      }
    },
    []
  );

  const onSadTalker = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/sadtalker", {
        source_image_url: nodeConnection.sadTalkerNode[id].source_image_url,
        driven_audio_url: nodeConnection.sadTalkerNode[id].driven_audio_url,
        userid: user?.id,
        face_model_resolution:
          nodeConnection.sadTalkerNode[id].face_model_resolution,
        expression_scale: nodeConnection.sadTalkerNode[id].expression_scale,
        face_enhancer: nodeConnection.sadTalkerNode[id].face_enhancer,
        preprocess: nodeConnection.sadTalkerNode[id].preprocess,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Sad Talker API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onAutoCaption = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/replicate/autocaption", {
        userid: user?.id,
        font: nodeConnection.autocaptionNode[id]?.font,
        color: nodeConnection.autocaptionNode[id]?.color,
        kerning: nodeConnection.autocaptionNode[id]?.kerning,
        opacity: nodeConnection.autocaptionNode[id].opacity,
        MaxChars: nodeConnection.autocaptionNode[id].MaxChars,
        fontsize: nodeConnection.autocaptionNode[id].fontsize,
        translate: nodeConnection.autocaptionNode[id].translate,
        output_video: nodeConnection.autocaptionNode[id].output_video,
        stroke_color: nodeConnection.autocaptionNode[id].stroke_color,
        stroke_width: nodeConnection.autocaptionNode[id].stroke_width,
        right_to_left: nodeConnection.autocaptionNode[id].right_to_left,
        subs_position: nodeConnection.autocaptionNode[id].subs_position,
        highlight_color: nodeConnection.autocaptionNode[id].highlight_color,
        video_file_input: nodeConnection.autocaptionNode[id].video_file_input,
        transcript_file_input:
          nodeConnection.autocaptionNode[id].transcript_file_input,
        output_transcript: nodeConnection.autocaptionNode[id].output_transcript,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Auto Caption API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onTextToVideo = useCallback(async (id: string, nodeConnection: any) => {
    try {
      if (Number(credits) < 1) {
        toast.error("Insufficient credits");
        return;
      }
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/elevenlabs/text-to-voice", {
        prompt: nodeConnection.textToVoiceNode[id]?.prompt,
        voice: nodeConnection.textToVoiceNode[id]?.voice,
        userid: user?.id,
        stability: nodeConnection.textToVoiceNode[id]?.stability,
        similarity_boost: nodeConnection.textToVoiceNode[id]?.similarity_boost,
        style: nodeConnection.textToVoiceNode[id]?.style,
      });
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [id]: {
          image: [...(prev.output?.[id]?.image || [])],
          text: [...(prev.output?.[id]?.text || [])],
          video: [...(prev.output?.[id]?.video || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
    } catch (error) {
      console.error("Error during Text to Video API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);
  // ...
  const onCreateLocalNodeTempate = useCallback(
    async (currentService: any) => {
      if (currentService === "AI") {
        const aiNodeAsString = JSON.stringify(nodeConnection.aiNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "live-portrait") {
        const aiNodeAsString = JSON.stringify(nodeConnection.livePortraitNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "flux-dev") {
        const aiNodeAsString = JSON.stringify(nodeConnection.fluxDevNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "image-to-image") {
        const aiNodeAsString = JSON.stringify(nodeConnection.imageToImageNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "flux-lora") {
        const aiNodeAsString = JSON.stringify(nodeConnection.fluxLoraNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "train-flux") {
        const aiNodeAsString = JSON.stringify(nodeConnection.trainFluxNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "stable-video") {
        const aiNodeAsString = JSON.stringify(nodeConnection.stableVideoNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "consistent-character") {
        const aiNodeAsString = JSON.stringify(
          nodeConnection.consistentCharacterNode
        );
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "dreamShaper") {
        const aiNodeAsString = JSON.stringify(nodeConnection.dreamShaperNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "fluxGeneral") {
        const aiNodeAsString = JSON.stringify(nodeConnection.fluxGeneralNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "fluxDevLora") {
        const aiNodeAsString = JSON.stringify(nodeConnection.fluxDevLoraNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "musicGen") {
        const aiNodeAsString = JSON.stringify(nodeConnection.musicgenNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "CogVideoX-5B") {
        const aiNodeAsString = JSON.stringify(nodeConnection.CogVideoX5BNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "video-to-video") {
        const aiNodeAsString = JSON.stringify(nodeConnection.videoToVideoNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "lumalabs-TextToVideo") {
        const aiNodeAsString = JSON.stringify(
          nodeConnection.lunalabsTextToVideoNode
        );
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "lumalabs-ImageToVideo") {
        const aiNodeAsString = JSON.stringify(
          nodeConnection.lunalabsImageToVideoNode
        );
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "sadTalker") {
        const aiNodeAsString = JSON.stringify(nodeConnection.sadTalkerNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "autoCaption") {
        const aiNodeAsString = JSON.stringify(nodeConnection.autocaptionNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "text-to-voice") {
        const aiNodeAsString = JSON.stringify(nodeConnection.textToVoiceNode);
        const response = await onCreateNodeTemplate(
          aiNodeAsString,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "Discord") {
        const response = await onCreateNodeTemplate(
          nodeConnection.discordNode.content,
          currentService,
          pathname.split("/").pop()!
        );

        if (response) {
          toast.message(response);
        }
      }
      if (currentService === "Slack") {
        const response = await onCreateNodeTemplate(
          nodeConnection.slackNode.content,
          currentService,
          pathname.split("/").pop()!,
          channels,
          nodeConnection.slackNode.slackAccessToken
        );

        if (response) {
          toast.message(response);
        }
      }

      if (currentService === "Notion") {
        const response = await onCreateNodeTemplate(
          JSON.stringify(nodeConnection.notionNode.content),
          currentService,
          pathname.split("/").pop()!,
          [],
          nodeConnection.notionNode.accessToken,
          nodeConnection.notionNode.databaseId
        );

        if (response) {
          toast.message(response);
        }
      }
    },
    [nodeConnection, channels]
  );

  const { selectedNode } = useEditor().state.editor;
  const [aiOutput, setAiOutput] = useState({
    image: [],
    text: [],
    video: [],
  });

  useEffect(() => {
    if (nodeConnection.output && selectedNode.id) {
      setAiOutput(
        (nodeConnection.output as Record<string, any>)[selectedNode.id] || {
          image: [],
          text: [],
          video: [],
        }
      );
    }
  }, [nodeConnection.output, selectedNode.id]);

  const renderActionButton = () => {
    switch (currentService) {
      case "Discord":
        return (
          <>
            <Button variant="outline" onClick={onSendDiscordMessage}>
              Test Message
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        );
      case "AI":
        return (
          <>
            {isLoading[selectedNode.id] ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            ) : (
              <div>
                {nodeConnection.aiNode[selectedNode.id]?.model !==
                  "FLUX-image" ? (
                  <div className="font-extralight">
                    <p className="font-bold">Outputs</p>
                    {aiOutput.text.map((output, index) => (
                      <div key={index}>
                        {index + 1}. {output}
                      </div> // Each output is wrapped in a div
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    {aiOutput.image.map((output, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {index + 1}.
                        </span>
                        <Link
                          target="_blank"
                          href={output}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          {output}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => onAiSearch(selectedNode.id, nodeConnection)}
              disabled={isLoading[selectedNode.id]}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        );

      case "Notion":
        return (
          <>
            <Button variant="outline" onClick={onStoreNotionContent}>
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        );

      case "Slack":
        return (
          <>
            <Button variant="outline" onClick={onStoreSlackContent}>
              Send Message
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save Template
            </Button>
          </>
        );
      case "flux-dev":
        return (
          <>
            {nodeConnection.fluxDevNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onFluxDev(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "image-to-image":
        return (
          <>
            {nodeConnection.imageToImageNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onImageToImage(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "flux-lora":
        return (
          <>
            {nodeConnection.fluxLoraNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onFluxLora(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "train-flux":
        return (
          <>
            <Button
              variant="outline"
              onClick={() => onTrainFlux(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "live-portrait":
        return (
          <>
            {nodeConnection.livePortraitNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onLivePortrait(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "stable-video":
        return (
          <>
            {nodeConnection.stableVideoNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onStableVideo(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "consistent-character":
        return (
          <>
            {nodeConnection.consistentCharacterNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onConsistantChar(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "fluxDevLora":
        return (
          <>
            {nodeConnection.fluxDevLoraNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onFluxDevLora(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "dreamShaper":
        return (
          <>
            {nodeConnection.dreamShaperNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onDreamShaper(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "fluxGeneral":
        return (
          <>
            {nodeConnection.fluxGeneralNode[selectedNode.id] &&
              aiOutput.image.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.image.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <img
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onFluxGeneral(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );

      case "CogVideoX-5B":
        return (
          <>
            {nodeConnection.CogVideoX5BNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onCogVideoX(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "musicGen":
        return (
          <>
            {nodeConnection.musicgenNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <audio
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onMusicGen(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "video-to-video":
        return (
          <>
            {nodeConnection.videoToVideoNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onVideoToVideo(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "lumalabs-TextToVideo":
        return (
          <>
            {nodeConnection.lunalabsTextToVideoNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() =>
                onLunaLabsTextToVideo(selectedNode.id, nodeConnection)
              }
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "lumalabs-ImageToVideo":
        return (
          <>
            {nodeConnection.lunalabsImageToVideoNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() =>
                onLunaLabsImageToVideo(selectedNode.id, nodeConnection)
              }
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "autoCaption":
        return (
          <>
            {nodeConnection.autocaptionNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onAutoCaption(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "sadTalker":
        return (
          <>
            {nodeConnection.sadTalkerNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <video
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                        width="320"
                        height="240"
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onSadTalker(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );
      case "text-to-voice":
        return (
          <>
            {nodeConnection.textToVoiceNode[selectedNode.id] &&
              aiOutput.video.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.video.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <audio
                        src={output}
                        className="text-blue-500 hover:text-blue-600"
                        controls
                      />
                    </div>
                  ))}
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => onTextToVideo(selectedNode.id, nodeConnection)}
            >
              Test
            </Button>
            <Button
              onClick={() => onCreateLocalNodeTempate(currentService)}
              variant="outline"
            >
              Save {currentService} Template
            </Button>
          </>
        );

      default:
        return null;
    }
  };
  return (
    <div className="flex flex-col gap-2 w-full">
      {renderActionButton()}
      <SaveFlow
        edges={edges}
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  );
};

export default ActionButton;
