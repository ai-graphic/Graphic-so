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
    };
  };
  output: string[];
  setAINode: React.Dispatch<React.SetStateAction<any>>;
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
        webhookURL: '',
        content: '',
        webhookName: '',
        guildName: '',
    },
    googleNode: [],
    notionNode: {
        accessToken: '',
        databaseId: '',
        workspaceName: '',
        content: '',
    },
    slackNode: {
        appId: '',
        authedUserId: '',
        authedUserToken: '',
        slackAccessToken: '',
        botUserId: '',
        teamId: '',
        teamName: '',
        content: '',
    },
  aiNode: {
  },
  output: [],
  workflowTemplate: {
    discord: "",
    notion: "",
    slack: "",
    ai: "",
  },
  isLoading: false,
  setGoogleNode: () => undefined,
  setDiscordNode: () => undefined,
  setNotionNode: () => undefined,
  setSlackNode: () => undefined,
  setIsLoading: () => undefined,
  setWorkFlowTemplate: () => undefined,
  setAINode: () => undefined,
};

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
  const [workflowTemplate, setWorkFlowTemplate] = useState(
    InitialValues.workflowTemplate
  );

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
  };

  return <Provider value={values}>{children}</Provider>;
};

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext);
  return { nodeConnection };
};
