import { EditorCanvasCardType } from "@/lib/types";
import { ConnectionProviderProps } from "@/providers/connections-providers";
import React from "react";
import { EditorState, useEditor } from "@/providers/editor-provider";
import { getDiscordConnectionUrl } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import {
  getNotionConnection,
  getNotionDatabase,
} from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import {
  getSlackConnection,
  listBotChannels,
} from "@/app/(main)/(pages)/connections/_actions/slack-connection";
import { Option } from "@/components/ui/multiple-selector";
import { Prompt } from "next/font/google";

export const onDragStart = (
  event: any,
  nodeType: EditorCanvasCardType["type"]
) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

export const onSlackContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }));
};
export const onAIContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setAINode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onfluxDevContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setfluxDevNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onImageToImageContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setimageToImageNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onFluxLoraContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setfluxLoraNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onStableVideoContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setstableVideoNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onTrainFluxContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.settrainFluxNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onConsistentCharacterContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setconsistentCharacterNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onDreamShaperContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setDreamShaperNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onFluxGeneralContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setFluxGeneralNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onFluxDevLoraContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setFluxDevLoraNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onCogVideoXContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setCogVideoX5BNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onMusicGenContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setmusicgenNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onVideoToVideoContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setvideoToVideoNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onTextToVideoContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");

  nodeConnection.setlunalabsTextToVideoNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onImageToVideoContent = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  const firstcontent = state.editor.selectedNode.id;
  const finalcontent = firstcontent + "." + content;
  const [id, key] = finalcontent.split(".");
  nodeConnection.setlunalabsImageToVideoNode((prev: any) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [key]: event.target.value,
    },
  }));
};

export const onDiscordContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }));
};

export const onNotionContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setNotionNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }));
};

export const onContentChange = (
  state: EditorState,
  nodeConnection: ConnectionProviderProps,
  nodeType: string,
  event: React.ChangeEvent<HTMLInputElement>,
  content: string
) => {
  if (nodeType === "Slack") {
    onSlackContent(nodeConnection, event);
  } else if (nodeType === "Discord") {
    onDiscordContent(nodeConnection, event);
  } else if (nodeType === "Notion") {
    onNotionContent(nodeConnection, event);
  } else if (nodeType === "AI") {
    onAIContent(state, nodeConnection, event, content);
  } else if (nodeType === "flux-dev") {
    onfluxDevContent(state, nodeConnection, event, content);
  } else if (nodeType === "image-to-image") {
    onImageToImageContent(state, nodeConnection, event, content);
  } else if (nodeType === "flux-lora") {
    onFluxLoraContent(state, nodeConnection, event, content);
  } else if (nodeType === "stable-video") {
    onStableVideoContent(state, nodeConnection, event, content);
  } else if (nodeType === "train-flux") {
    onTrainFluxContent(state, nodeConnection, event, content);
  } else if (nodeType === "consistent-character") {
    onConsistentCharacterContent(state, nodeConnection, event, content);
  } else if (nodeType === "dreamShaper") {
    onDreamShaperContent(state, nodeConnection, event, content);
  } else if (nodeType === "fluxGeneral") {
    onFluxGeneralContent(state, nodeConnection, event, content);
  } else if (nodeType === "fluxDevLora") {
    onFluxDevLoraContent(state, nodeConnection, event, content);
  } else if (nodeType === "CogVideoX-5B") {
    onCogVideoXContent(state, nodeConnection, event, content);
  } else if (nodeType === "musicGen") {
    onMusicGenContent(state, nodeConnection, event, content);
  } else if (nodeType === "video-to-video") {
    onVideoToVideoContent(state, nodeConnection, event, content);
  } else if (nodeType === "lunalabs-TextToVideo") {
    onTextToVideoContent(state, nodeConnection, event, content);
  } else if (nodeType === "lunalabs-ImageToVideo") {
    onImageToVideoContent(state, nodeConnection, event, content);
  }
};

export const onAddTemplateSlack = (
  nodeConnection: ConnectionProviderProps,
  template: string
) => {
  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    content: `${prev.content} ${template}`,
  }));
};

export const onAddTemplateDiscord = (
  nodeConnection: ConnectionProviderProps,
  template: string
) => {
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    content: `${prev.content} ${template}`,
  }));
};

export const onAddTemplate = (
  nodeConnection: ConnectionProviderProps,
  title: string,
  template: string
) => {
  if (title === "Slack") {
    onAddTemplateSlack(nodeConnection, template);
  } else if (title === "Discord") {
    onAddTemplateDiscord(nodeConnection, template);
  }
};

export const onConnections = async (
  nodeConnection: ConnectionProviderProps,
  editorState: EditorState,
  googleFile: any
) => {
  if (editorState.editor.selectedNode.data.title == "Discord") {
    const connection = await getDiscordConnectionUrl();
    if (connection) {
      nodeConnection.setDiscordNode((prev: any) => ({
        ...prev,

        webhookURL: connection.url,
        content: "",
        webhookName: connection.name,
        guildName: connection.guildName,
      }));
    }
  }
  if (editorState.editor.selectedNode.data.title == "Notion") {
    const connection = await getNotionConnection();
    if (connection) {
      nodeConnection.setNotionNode((prev: any) => ({
        ...prev,
        accessToken: connection.accessToken,
        databaseId: connection.databaseId,
        workspaceName: connection.workspaceName,
        content: {
          name: googleFile.name,
          kind: googleFile.kind,
          type: googleFile.mimeType,
        },
      }));
      if (nodeConnection.notionNode.databaseId !== "") {
        const response = await getNotionDatabase(
          nodeConnection.notionNode.databaseId,
          nodeConnection.notionNode.accessToken
        );
      }
    }
  }
  if (editorState.editor.selectedNode.data.title == "Slack") {
    const connection = await getSlackConnection();
    if (connection) {
      nodeConnection.setSlackNode((prev: any) => ({
        ...prev,
        appId: connection.appId,
        authedUserId: connection.authedUserId,
        authedUserToken: connection.authedUserToken,
        slackAccessToken: connection.slackAccessToken,
        botUserId: connection.botUserId,
        teamId: connection.teamId,
        teamName: connection.teamName,
        userId: connection.userId,
        content: "",
      }));
    }
  }
};

export const fetchBotSlackChannels = async (
  token: string,
  setSlackChannels: (slackChannels: Option[]) => void
) => {
  await listBotChannels(token)?.then((channels) => setSlackChannels(channels));
};
