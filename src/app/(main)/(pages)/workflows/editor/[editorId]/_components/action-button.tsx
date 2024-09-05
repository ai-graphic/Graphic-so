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

  const onFluxDev = useCallback(async () => {}, []);
  const onImageToImage = useCallback(async () => {}, []);
  const onFluxLora = useCallback(async () => {}, []);
  const onTrainFlux = useCallback(async () => {}, []);
  const onStableVideo = useCallback(async () => {}, []);

  const onAiSearch = useCallback(
    async (id: string) => {
      if (!nodeConnection.aiNode[id]) {
        toast.error("Please select a model first");
        return;
      }
      if (
        !nodeConnection.aiNode[id].ApiKey &&
        !nodeConnection.aiNode[id].prompt
      ) {
        toast.error("Please enter an API key and prompt first");
        return;
      }
      setIsLoading(id, true);
      console.log("AI Node:", id);
      if (nodeConnection.aiNode[id].model === "Openai") {
        try {
          setIsLoading(id, true);
          const messages = [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: nodeConnection.aiNode[id].prompt,
            },
          ];
          console.log("Messages:", messages);
          const response = await axios.post(
            nodeConnection.aiNode[id].endpoint ||
              "https://api.openai.com/v1/chat/completions",
            {
              model: nodeConnection.aiNode.localModel || "gpt-3.5-turbo",
              messages: messages,
            },
            {
              headers: {
                Authorization: `Bearer ${nodeConnection.aiNode[id].ApiKey}`,
              },
            }
          );
          nodeConnection.setAINode((prev: any) => ({
            ...prev,
            output: {
              ...(prev.output || {}),
              [id]: [
                ...(prev.output?.[id] || []),
                response.data.choices[0].message.content.trim(),
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
            apiKey: nodeConnection.aiNode[id].ApiKey,
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
            <Button variant="outline" onClick={onFluxDev}>
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
            <Button variant="outline" onClick={onImageToImage}>
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
            <Button variant="outline" onClick={onFluxLora}>
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
            <Button variant="outline" onClick={onTrainFlux}>
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
            <Button variant="outline" onClick={onStableVideo}>
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
