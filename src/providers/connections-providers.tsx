'use client'

import {createContext, useContext, useState} from "react";

export type ConnectionProviderProps = {
    discordNode: {
        webhookURL: string
        content: string
        webhookName: string
        guildName: string
    }
    setDiscordNode: React.Dispatch<React.SetStateAction<any>>
    aiNode: {
        ApiKey: string
        prompt: string
        model: string
        output: string
        temperature: number
        maxTokens: number
        endpoint: string
    }
    setAINode: React.Dispatch<React.SetStateAction<any>>
    googleNode: {}[]
    setGoogleNode: React.Dispatch<React.SetStateAction<any>>
    notionNode: {
        accessToken: string
        databaseId: string
        workspaceName: string
        content: ''
    }
    workflowTemplate: {
        discord?: string
        notion?: string
        slack?: string
        ai?: string 
    }
    setNotionNode: React.Dispatch<React.SetStateAction<any>>
    slackNode: {
        appId: string
        authedUserId: string
        authedUserToken: string
        slackAccessToken: string
        botUserId: string
        teamId: string
        teamName: string
        content: string
    }
    setSlackNode: React.Dispatch<React.SetStateAction<any>>
    setWorkFlowTemplate: React.Dispatch<
        React.SetStateAction<{
            discord?: string
            notion?: string
            slack?: string
            ai?: string 
        }>
    >
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

type ConnectionWithChildProps = {
    children: React.ReactNode
}

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
    aiNode: {
        ApiKey: "",
        prompt: "",
        model: "",
        output: "",
        temperature: 0,
        maxTokens: 0,
        endpoint: "",
    },
    workflowTemplate: {
        discord: '',
        notion: '',
        slack: '',
        ai: '',
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
    isLoading: false,
    setGoogleNode: () => undefined,
    setDiscordNode: () => undefined,
    setNotionNode: () => undefined,
    setSlackNode: () => undefined,
    setIsLoading: () => undefined,
    setWorkFlowTemplate: () => undefined,
    setAINode: () => undefined,
}

const ConnectionsContext = createContext(InitialValues)
const {Provider} = ConnectionsContext;

export const ConnectionsProvider = ({ children }: ConnectionWithChildProps) => {
    const [discordNode, setDiscordNode] = useState(InitialValues.discordNode)
    const [googleNode, setGoogleNode] = useState(InitialValues.googleNode)
    const [notionNode, setNotionNode] = useState(InitialValues.notionNode)
    const [slackNode, setSlackNode] = useState(InitialValues.slackNode)
    const [isLoading, setIsLoading] = useState(InitialValues.isLoading)
    const [aiNode, setAINode] = useState(InitialValues.aiNode)
    const [workflowTemplate, setWorkFlowTemplate] = useState(
        InitialValues.workflowTemplate
    )

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
        setAINode, 
    }

    return <Provider value={values}>{children}</Provider>
}

export const useNodeConnections = () => {
    const nodeConnection = useContext(ConnectionsContext)
    return { nodeConnection }
}
