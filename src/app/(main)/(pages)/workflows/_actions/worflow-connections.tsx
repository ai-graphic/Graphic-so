'use server'

import {auth, currentUser} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import {Option} from "@/components/ui/multiple-selector";

export const getGoogleListener = async () => {
    const {userId} = auth();

    if (userId) {
        const listener = await db.user.findUnique({
            where: {
                clerkId: userId,
            },
            select: {
                googleResourceId: true,
            },
        })

        if (listener) return listener;
    }
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
    console.log(state)
    const published = await db.workflows.update({
        where: {
            id: workflowId,
        },
        data: {
            publish: state,
        },
    })

    if (published.publish) return 'Workflow published'
    return 'Workflow unpublished'
}

export const onCreateNodeTemplate = async (
    content: string,
    type: string,
    workflowId: string,
    channels?: Option[],
    accessToken?: string,
    notionDbId?: string
) => {
    if (type === 'Discord') {
        const response = await db.workflows.update({
            where: {
                id: workflowId,
            },
            data: {
                discordTemplate: content,
            },
        })

        if (response) {
            return 'Discord template saved'
        }
    }
    if (type === 'Slack') {
        const response = await db.workflows.update({
            where: {
                id: workflowId,
            },
            data: {
                slackTemplate: content,
                slackAccessToken: accessToken,
            },
        });
    
        if (response && channels) {
            // Use the new channels directly, assuming they are not duplicates
            const newChannelNames = channels.map(channel => channel.label);
    
            // Update the workflow with the new set of channels
            await db.workflows.update({
                where: {
                    id: workflowId,
                },
                data: {
                    slackChannels: newChannelNames,
                },
            });
    
            return 'Slack template saved';
        }
    }

    if (type === 'Notion') {
        const response = await db.workflows.update({
            where: {
                id: workflowId,
            },
            data: {
                notionTemplate: content,
                notionAccessToken: accessToken,
                notionDbId: notionDbId,
            },
        })

        if (response) return 'Notion template saved'
    }
    if (type === 'AI') {
        const response = await db.workflows.update({
            where: {
                id: workflowId,
            },
            data: {
                AiTemplate: content,
                aiAccessToken: accessToken,
            },
        });

        if (response) {
            return 'AI template saved';
        }
    }
}

export const onGetWorkflows = async () => {
    const user = await currentUser()
    if (user) {
        const workflow = await db.workflows.findMany({
            where: {
                userId: user.id,
            },
        })

        if (workflow) return workflow
    }
}

export const onCreateWorkflow = async (name: string, description: string) => {
    const user = await currentUser()

    if (user) {
        //create new workflow
        const workflow = await db.workflows.create({
            data: {
                userId: user.id,
                name,
                description,
            },
        })

        if (workflow) return { message: 'workflow created' }
        return { message: 'Oops! try again' }
    }
}

export const onGetNodesEdges = async (flowId: string) => {
    const nodesEdges = await db.workflows.findUnique({
        where: {
            id: flowId,
        },
        select: {
            nodes: true,
            edges: true,
        },
    })
    if (nodesEdges?.nodes && nodesEdges?.edges) return nodesEdges
}