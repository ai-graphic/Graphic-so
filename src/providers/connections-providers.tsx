"use client";

import { createContext, useContext, useState } from "react";

export type ConnectionProviderProps = {
  discordNode: {
    webhookURL: string;
    content: string;
    webhookName: string;
    guildName: string;
  };
  setDiscordNode: React.Dispatch<React.SetStateAction<any>>;
  triggerNode: {
    triggerType: string;
    triggerValue: string;
  }
  setTriggerNode: React.Dispatch<React.SetStateAction<any>>;
  aiNode: {
    [id: string]: {
      id: string;
      ApiKey: string;
      prompt: string;
      model: string;
      localModel: string;
      output: string;
      temperature: number;
      maxTokens: number;
      endpoint: string;
      num_outputs: number;
      aspect_ratio: string;
      output_format: string;
      guidance_scale: number;
      output_quality: number;
      num_inference_steps: number;
      model_name: string;
      hf_token: string;
      steps: number;
      learning_rate: number;
      batch_size: number;
      resolution: string;
      lora_linear: boolean;
      lora_linear_alpha: number;
      repo_id: string;
      images: string;
    };
    
  };
  output: string[];
  setAINode: React.Dispatch<React.SetStateAction<any>>;
  addAINode: (id: string) => void; // Add this line
  googleNode: any[];
  setGoogleNode: React.Dispatch<React.SetStateAction<any>>;
  notionNode: {
    accessToken: string;
    databaseId: string;
    workspaceName: string;
    content: string;
  };
  setNotionNode: React.Dispatch<React.SetStateAction<any>>;
  slackNode: {
    appId: string;
    authedUserId: string;
    authedUserToken: string;
    slackAccessToken: string;
    botUserId: string;
    teamId: string;
    teamName: string;
    content: string;
  };
  setSlackNode: React.Dispatch<React.SetStateAction<any>>;
  workflowTemplate: {
    discord?: string;
    notion?: string;
    slack?: string;
    ai?: string;
  };
  setWorkFlowTemplate: React.Dispatch<
    React.SetStateAction<{
      discord?: string;
      notion?: string;
      slack?: string;
      ai?: string;
    }>
  >;
  
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type ConnectionWithChildProps = {
  children: React.ReactNode;
};

const InitialValues: ConnectionProviderProps = {
  discordNode: {
    webhookURL: "",
    content: "",
    webhookName: "",
    guildName: "",
  },
  triggerNode: {
    triggerType: "",
    triggerValue: "",
  },
  googleNode: [],
  notionNode: {
    accessToken: "",
    databaseId: "",
    workspaceName: "",
    content: "",
  },
  slackNode: {
    appId: "",
    authedUserId: "",
    authedUserToken: "",
    slackAccessToken: "",
    botUserId: "",
    teamId: "",
    teamName: "",
    content: "",
  },
  aiNode: {},
  output: [],
  workflowTemplate: {
    discord: "",
    notion: "",
    slack: "",
    ai: "",
  },
  isLoading: false,
  setGoogleNode: () => undefined,
  setTriggerNode: () => undefined,
  setDiscordNode: () => undefined,
  setNotionNode: () => undefined,
  setSlackNode: () => undefined,
  setIsLoading: () => undefined,
  setWorkFlowTemplate: () => undefined,
  setAINode: () => undefined,
  addAINode: () => undefined,
};
const generateDefaultAINode = (id: string) => ({
  id,
  ApiKey: "",
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
});

const ConnectionsContext = createContext(InitialValues);
const { Provider } = ConnectionsContext;




export const ConnectionsProvider = ({ children }: ConnectionWithChildProps) => {
  const [discordNode, setDiscordNode] = useState(InitialValues.discordNode);
  const [googleNode, setGoogleNode] = useState(InitialValues.googleNode);
  const [notionNode, setNotionNode] = useState(InitialValues.notionNode);
  const [slackNode, setSlackNode] = useState(InitialValues.slackNode);
  const [isLoading, setIsLoading] = useState(InitialValues.isLoading);
  const [aiNode, setAINode] = useState(InitialValues.aiNode);
  const [output, setOutput] = useState(InitialValues.output);
  const [triggerNode, setTriggerNode] = useState(InitialValues.triggerNode);
  const [workflowTemplate, setWorkFlowTemplate] = useState(
    InitialValues.workflowTemplate
  );
  const addAINode = (id: string) => {
    setAINode((prev) => ({
      ...prev,
      [id]: generateDefaultAINode(id),
    }));
  };
  
  const values = {
    discordNode,
    setDiscordNode,
    googleNode,
    setGoogleNode,
    notionNode,
    setNotionNode,
    slackNode,
    setSlackNode,
    isLoading,
    setIsLoading,
    workflowTemplate,
    setWorkFlowTemplate,
    aiNode,
    output,
    setAINode,
    addAINode,
    triggerNode,
    setTriggerNode,
  };

  return <Provider value={values}>{children}</Provider>;
};

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext);
  return { nodeConnection };
};
