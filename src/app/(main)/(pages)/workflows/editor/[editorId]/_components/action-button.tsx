import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { SelectionMode } from "reactflow";
import { divMode } from "@tsparticles/engine";
import Link from "next/link";

type Props = {
  currentService: string;
  nodeConnection: ConnectionProviderProps;
  channels?: Option[];
  setChannels?: (value: Option[]) => void;
};

const ActionButton = ({
  currentService,
  nodeConnection,
  channels,
  setChannels,
}: Props) => {
  const pathname = usePathname();

  const nodeConnectionRef = useRef(nodeConnection);
  // Update the ref whenever nodeConnection changes
  useEffect(() => {
    nodeConnectionRef.current = nodeConnection;
  }, [nodeConnection]);

  const onSendDiscordMessage = useCallback(async () => {
    const response = await postContentToWebHook(
      nodeConnectionRef.current.discordNode.content,
      nodeConnectionRef.current.discordNode.webhookURL
    );

    if (response.message == "success") {
      nodeConnectionRef.current.setDiscordNode((prev: any) => ({
        ...prev,
        content: "",
      }));
    }
  }, []);

  const onStoreNotionContent = useCallback(async () => {
    console.log(
      nodeConnectionRef.current.notionNode.databaseId,
      nodeConnectionRef.current.notionNode.accessToken,
      nodeConnectionRef.current.notionNode.content
    );
    const response = await onCreateNewPageInDatabase(
      nodeConnectionRef.current.notionNode.databaseId,
      nodeConnectionRef.current.notionNode.accessToken,
      nodeConnectionRef.current.notionNode.content
    );
    if (response) {
      nodeConnectionRef.current.setNotionNode((prev: any) => ({
        ...prev,
        content: "",
      }));
    }
  }, [])
  const onStoreSlackContent = useCallback(async () => {
    const response = await postMessageToSlack(
      nodeConnectionRef.current.slackNode.slackAccessToken,
      channels!,
      nodeConnectionRef.current.slackNode.content
    );
    if (response.message == "Success") {
      toast.success("Message sent successfully");
      nodeConnectionRef.current.setSlackNode((prev: any) => ({
        ...prev,
        content: "",
      }));
      setChannels!([]);
    } else {
      toast.error(response.message);
    }
  }, [channels, setChannels]);
  // ... existing code ...

  const onAiSearch = useCallback(
    async (id: string) => {
      console.log("AI Node:", id);
      if (nodeConnectionRef.current.aiNode[id].model === "Openai") {
        try {
          const messages = [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: nodeConnectionRef.current.aiNode[id].prompt,
            },
          ];
          console.log("Messages:", messages);
          const response = await axios.post(
            nodeConnectionRef.current.aiNode[id].endpoint ||
              "https://api.openai.com/v1/chat/completions",
            {
              model: nodeConnectionRef.current.aiNode.localModel || "gpt-3.5-turbo",
              messages: messages,
            },
            {
              headers: {
                Authorization: `Bearer ${nodeConnectionRef.current.aiNode[id].ApiKey}`, // Use environment variable for the API key
              },
            }
          );
          nodeConnectionRef.current.setAINode((prev: any) => ({
            ...prev,
            output: {
              ...(prev.output || {}), // Ensure prev.output is an object
              [id]: [
                ...(prev.output?.[id] || []), // Spread the existing array or an empty array if it doesn't exist
                response.data.choices[0].message.content.trim(), // Append the new content
              ],
            },
          }));
          console.log("AI Response:", response.data);
        } catch (error) {
          console.error("Error during AI search:", error);
        }
      } else if (nodeConnectionRef.current.aiNode[id].model === "FLUX-image") {
        console.log("AI model:", nodeConnectionRef.current.aiNode[id].model);
        try {
          const response = await axios.post("/api/AiResponse/FLUX-image", {
            prompt: nodeConnectionRef.current.aiNode[id].prompt,
            apiKey: nodeConnectionRef.current.aiNode[id].ApiKey,
            temperature: nodeConnectionRef.current.aiNode[id].temperature,
            maxTokens: nodeConnectionRef.current.aiNode[id].maxTokens,
            num_outputs: nodeConnectionRef.current.aiNode[id].num_outputs,
            aspect_ratio: nodeConnectionRef.current.aiNode[id].aspect_ratio,
            output_format: nodeConnectionRef.current.aiNode[id].output_format,
            guidance_scale: nodeConnectionRef.current.aiNode[id].guidance_scale,
            output_quality: nodeConnectionRef.current.aiNode[id].output_quality,
            num_inference_steps: nodeConnectionRef.current.aiNode[id].num_inference_steps,
          });
          nodeConnectionRef.current.setAINode((prev: any) => ({
            ...prev,
            output: {
              ...(prev.output || {}),
              [id]: [...(prev.output?.[id] || []), response.data[0]],
            },
          }));
          console.log("Replicate API Response:", response.data[0]);
        } catch (error) {
          console.error("Error during Replicate API call:", error);
        }
      } else if (nodeConnectionRef.current.aiNode[id].model === "train-LORA") {
        console.log("AI model:", nodeConnectionRef.current.aiNode[id].model);
      }
    },
    []
  );

  // ...
  const onCreateLocalNodeTempate = useCallback(async () => {
    if (currentService === "AI") {
      console.log("AI Node:", nodeConnectionRef.current.aiNode);
      const aiNodeAsString = JSON.stringify(nodeConnectionRef.current.aiNode);
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
        nodeConnectionRef.current.discordNode.content,
        currentService,
        pathname.split("/").pop()!
      );

      if (response) {
        toast.message(response);
      }
    }
    if (currentService === "Slack") {
      const response = await onCreateNodeTemplate(
        nodeConnectionRef.current.slackNode.content,
        currentService,
        pathname.split("/").pop()!,
        channels,
        nodeConnectionRef.current.slackNode.slackAccessToken
      );

      if (response) {
        toast.message(response);
      }
    }

    if (currentService === "Notion") {
      const response = await onCreateNodeTemplate(
        JSON.stringify(nodeConnectionRef.current.notionNode.content),
        currentService,
        pathname.split("/").pop()!,
        [],
        nodeConnectionRef.current.notionNode.accessToken,
        nodeConnectionRef.current.notionNode.databaseId
      );

      if (response) {
        toast.message(response);
      }
    }
  }, [currentService, pathname, channels]); 

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
            <div>
              Output:{" "}
              {nodeConnection.aiNode[selectedNode.id]?.model === "Openai" ? (
                aiOutput.join(", ")
              ) : (
                <div className="flex flex-col space-y-2">
                {aiOutput.map((output, index) => (
                  <div key={index} className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{index + 1}.</span>
                  <Link target="_blank" href={output} className="text-blue-500 hover:text-blue-600">
                    {output}
                  </Link>
                </div>
                ))}
              </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => onAiSearch(selectedNode.id)}
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

      default:
        return null;
    }
  };
  return renderActionButton();
};

export default ActionButton;
