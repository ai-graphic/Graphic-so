import React, { useCallback, useEffect, useState } from "react";
import { Option } from "./content-based-on-title";
import { ConnectionProviderProps } from "@/providers/connections-providers";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { onCreateNodeTemplate } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { toast } from "sonner";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import axios from "axios";
import { useEditor } from "@/providers/editor-provider";
import Link from "next/link";
import { useLoading } from "@/providers/loading-provider";
import FlowInstance from "./flow-instance";
import { EditorNodeType } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { on } from "events";
import { useBilling } from "@/providers/billing-provider";

type Props = {
  currentService: string;
  nodeConnection: ConnectionProviderProps;
  channels?: Option[];
  setChannels?: (value: Option[]) => void;
  nodes: EditorNodeType[];
  edges: any;
  setNodes: (nodes: EditorNodeType[]) => void;
  setEdges: (edges: any) => void;
};

const ActionButton = ({
  currentService,
  nodeConnection,
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
    console.log(
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    );
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

  const onFluxDev = useCallback(
    async (id: string) => {
      console.log("Flux Dev Node:", id);
      try {
        setIsLoading(id, true);
        console.log("Flux Dev Node:", nodeConnection.fluxDevNode);
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
        nodeConnection.setAINode((prev: any) => ({
          ...prev,
          output: {
            ...(prev.output || {}),
            [id]: [...(prev.output?.[id] || []), response.data],
          },
        }));
        setCredits((prev) => (Number(prev) - 1).toString());
        console.log("Flux Dev Response:", response.data);
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

  const onImageToImage = useCallback(async (id: string) => {
    console.log("Image to Image Node:", id);
    try {
      setIsLoading(id, true);
      console.log("Flux Dev Node:", nodeConnection.imageToImageNode);
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
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Image to Image Response:", response.data);
    } catch (error) {
      console.error("Error during Image to Image API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);
  const onFluxLora = useCallback(async (id: string) => {
    console.log("Flux Lora Node:", id);
    try {
      setIsLoading(id, true);
      console.log("Flux Dev Node:", nodeConnection.fluxLoraNode);
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
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Flux Lora Response:", response.data);
    } catch (error) {
      console.error("Error during Flux Lora API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);
  const onTrainFlux = useCallback(async (id: string) => {
    console.log("Train Flux Node:", id);
    try {
      setIsLoading(id, true);
      const response = await axios.post("/api/ai/fal/train-flux", {
        images_data_url: nodeConnection.trainFluxNode[id].images_data_url,
        trigger_word: nodeConnection.trainFluxNode[id].trigger_word,
        userid: user?.id,
        iter_multiplier: nodeConnection.trainFluxNode[id].iter_multiplier,
      });
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Train Flux Response:", response.data);
    } catch (error) {
      console.error("Error during Train Flux API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);
  const onStableVideo = useCallback(async (id: string) => {
    console.log("Stable Video Node:", id);
    try {
      setIsLoading(id, true);
      console.log("Stable Video Node:", nodeConnection);
      console.log("Stable Video Node:", nodeConnection.stableVideoNode);
      const response = await axios.post("/api/ai/fal/stable-video", {
        image_url: nodeConnection.stableVideoNode[id].image_url,
        userid: user?.id,
        motion_bucket_id: nodeConnection.stableVideoNode[id].motion_bucket_id,
        fps: nodeConnection.stableVideoNode[id].fps,
        cond_aug: nodeConnection.stableVideoNode[id].cond_aug,
      });
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Stable Video Response:", response.data);
    } catch (error) {
      console.error("Error during Stable Video API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onConsistantChar = useCallback(async (id: string) => {
    console.log("Consistant Character Node:", id);
    try {
      setIsLoading(id, true);
      console.log(
        "Consistant Character Node:",
        nodeConnection.consistentCharacterNode[id]
      );
      const response = await axios.post(
        "/api/ai/replicate/consistent-character",
        {
          prompt: nodeConnection.consistentCharacterNode[id]?.prompt,
          userid: user?.id,
          subject: nodeConnection.consistentCharacterNode[id]?.subject,
          num_outputs: nodeConnection.consistentCharacterNode[id]?.num_outputs,
          negative_prompt:
            nodeConnection.consistentCharacterNode[id]?.negative_prompt,
          randomise_poses:
            nodeConnection.consistentCharacterNode[id]?.randomise_poses,
          number_of_outputs:
            nodeConnection.consistentCharacterNode[id]?.number_of_outputs,
          disable_safety_checker:
            nodeConnection.consistentCharacterNode[id]?.disable_safety_checker,
          number_of_images_per_pose:
            nodeConnection.consistentCharacterNode[id]
              ?.number_of_images_per_pose,
          output_format:
            nodeConnection.consistentCharacterNode[id]?.output_format,
          output_quality:
            nodeConnection.consistentCharacterNode[id]?.output_quality,
        }
      );
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Consistant Character Response:", response.data);
    } catch (error) {
      console.error("Error during Consistant Character API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onFluxDevLora = useCallback(async (id: string) => {
    console.log("Flux Dev Lora Node:", id);
    try {
      setIsLoading(id, true);
      console.log("Flux Dev Lora Node:", nodeConnection.fluxDevLoraNode[id]);
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
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Flux Dev Lora Response:", response.data);
    } catch (error) {
      console.error("Error during Flux Dev Lora API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onDreamShaper = useCallback(async (id: string) => {
    console.log("Dream Shaper Node:", id);
    try {
      setIsLoading(id, true);
      console.log("Dream Shaper Node:", nodeConnection.dreamShaperNode[id]);
      const response = await axios.post("/api/ai/replicate/dreamshaper", {
        prompt: nodeConnection.dreamShaperNode[id]?.prompt,
        userid: user?.id,
        num_inference_steps:
          nodeConnection.dreamShaperNode[id]?.num_inference_steps,
        image: nodeConnection.dreamShaperNode[id]?.image,
        negative_prompt: nodeConnection.dreamShaperNode[id]?.negative_prompt,
        strength: nodeConnection.dreamShaperNode[id]?.strength,
        scheduler: nodeConnection.dreamShaperNode[id]?.scheduler,
        upscale: nodeConnection.dreamShaperNode[id]?.upscale,
      });
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Dream Shaper Response:", response.data);
    } catch (error) {
      console.error("Error during Dream Shaper API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onFluxGeneral = useCallback(async (id: string) => {
    console.log("Flux General Node:", id);
    try {
      setIsLoading(id, true);
      console.log("Flux General Node:", nodeConnection.fluxGeneralNode[id]);
      const response = await axios.post("/api/ai/fal/fluxGeneral", {
        prompt: nodeConnection.fluxGeneralNode[id]?.prompt,
        userid: user?.id,
        num_inference_steps:
          nodeConnection.fluxGeneralNode[id]?.num_inference_steps,
        guidance_scale: nodeConnection.fluxGeneralNode[id]?.guidance_scale,
        num_images: nodeConnection.fluxGeneralNode[id]?.num_images,
        seed: nodeConnection.fluxGeneralNode[id]?.seed,
        sync_mode: nodeConnection.fluxGeneralNode[id]?.sync_mode,
        enable_safety_checker:
          nodeConnection.fluxGeneralNode[id]?.enable_safety_checker,
      });
      nodeConnection.setAINode((prev: any) => ({
        ...prev,
        output: {
          ...(prev.output || {}),
          [id]: [...(prev.output?.[id] || []), response.data],
        },
      }));
      setCredits((prev) => (Number(prev) - 1).toString());
      console.log("Flux General Response:", response.data);
    } catch (error) {
      console.error("Error during Flux General API call:", error);
    } finally {
      setIsLoading(id, false);
    }
  }, []);

  const onAiSearch = useCallback(
    async (id: string) => {
      if (!nodeConnection.aiNode[id]) {
        toast.error("Please select a model first");
        return;
      }
      if (
        !nodeConnection.aiNode[id].prompt
      ) {
        toast.error("Please enter a prompt first");
        return;
      }
      setIsLoading(id, true);
      console.log("AI Node:", id);
      if (nodeConnection.aiNode[id].model === "Openai") {
        try {
          setIsLoading(id, true);
          const response = await axios.post("/api/ai/openai", {
            prompt : nodeConnection.aiNode[id]?.prompt,
            system: nodeConnection.aiNode[id]?.system,
            userid: user?.id,
          })
          nodeConnection.setAINode((prev: any) => ({
            ...prev,
            output: {
              ...(prev.output || {}),
              [id]: [
                ...(prev.output?.[id] || []),
                response.data,
              ],
            },
          }));
          console.log("AI Response:", response.data);
        } catch (error) {
          console.error("Error during AI search:", error);
        } finally {
          setIsLoading(id, false);
        }
      } else if (nodeConnection.aiNode[id].model === "FLUX-image") {
        console.log("AI model:", nodeConnection.aiNode[id].model);
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
          nodeConnection.setAINode((prev: any) => ({
            ...prev,
            output: {
              ...(prev.output || {}),
              [id]: [...(prev.output?.[id] || []), response.data[0]],
            },
          }));
          setCredits((prev) => (Number(prev) - 1).toString());
          console.log("Replicate API Response:", response.data[0]);
        } catch (error) {
          console.error("Error during Replicate API call:", error);
        } finally {
          setIsLoading(id, false);
        }
      } else if (nodeConnection.aiNode[id].model === "SuperAgent") {
        console.log("AI model:");
        try {
          console.log("yo");
          const response = await axios.post("/api/ai/superagent/getoutput", {
            prompt: nodeConnection.aiNode[id].prompt,
            workflowId: nodeConnection.aiNode[id].id,
            userid: user?.id,
            history: nodeConnection.aiNode[id].history,
          });
          console.log("chup", response.data);
          nodeConnection.setAINode((prev: any) => ({
            ...prev,
            output: {
              ...(prev.output || {}),
              [id]: [...(prev.output?.[id] || []), response.data.output],
            },
          }));
        } catch (error) {
          console.error("Error during superAgent API call:", error);
        } finally {
          setIsLoading(id, false);
        }
      }
    },
    [nodeConnection.aiNode, pathname]
  );

  // ...
  const onCreateLocalNodeTempate = useCallback(async () => {
    if (currentService === "AI") {
      console.log("AI Node:", nodeConnection.aiNode);
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
    if (currentService === "flux-dev") {
      console.log("AI Node:", nodeConnection.fluxDevNode);
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
      console.log("AI Node:", nodeConnection.imageToImageNode);
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
      console.log("AI Node:", nodeConnection.fluxLoraNode);
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
      console.log("AI Node:", nodeConnection.trainFluxNode);
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
      console.log("AI Node:", nodeConnection.stableVideoNode);
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
      console.log("AI Node:", nodeConnection.consistentCharacterNode);
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
      console.log("AI Node:", nodeConnection.dreamShaperNode);
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
      console.log("AI Node:", nodeConnection.fluxGeneralNode);
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
      console.log("AI Node:", nodeConnection.fluxDevLoraNode);
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
  }, [nodeConnection, channels]);

  const { selectedNode } = useEditor().state.editor;
  const [aiOutput, setAiOutput] = useState<string[]>([]);
  console.log("aioutput:", aiOutput);

  useEffect(() => {
    if (nodeConnection.aiNode.output && selectedNode.id) {
      setAiOutput(
        (nodeConnection.aiNode.output as unknown as Record<string, string[]>)[
          selectedNode.id
        ] || []
      );
    }
  }, [nodeConnection.aiNode.output, selectedNode.id]);

  const renderActionButton = () => {
    switch (currentService) {
      case "Discord":
        return (
          <>
            <Button variant="outline" onClick={onSendDiscordMessage}>
              Test Message
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
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
                    {aiOutput.map((output, index) => (
                      <div key={index}>
                        {index + 1}. {output}
                      </div> // Each output is wrapped in a div
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    {aiOutput.map((output, index) => (
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
              onClick={() => onAiSearch(selectedNode.id)}
              disabled={isLoading[selectedNode.id]}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
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
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
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
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "flux-dev":
        return (
          <>
            {nodeConnection.fluxDevNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onFluxDev(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "image-to-image":
        return (
          <>
            {nodeConnection.imageToImageNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onImageToImage(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "flux-lora":
        return (
          <>
            {nodeConnection.fluxLoraNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onFluxLora(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "train-flux":
        return (
          <>
            <Button
              variant="outline"
              onClick={() => onTrainFlux(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "stable-video":
        return (
          <>
            {nodeConnection.stableVideoNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onStableVideo(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "consistent-character":
        return (
          <>
            {nodeConnection.consistentCharacterNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onConsistantChar(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "fluxDevLora":
        return (
          <>
            {nodeConnection.fluxDevLoraNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onFluxDevLora(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "dreamShaper":
        return (
          <>
            {nodeConnection.dreamShaperNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onDreamShaper(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );
      case "fluxGeneral":
        return (
          <>
            {nodeConnection.fluxGeneralNode[selectedNode.id] &&
              aiOutput.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {aiOutput.map((output, index) => (
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
              onClick={() => onFluxGeneral(selectedNode.id)}
            >
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
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
      <FlowInstance
        edges={edges}
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  );
};

export default ActionButton;
