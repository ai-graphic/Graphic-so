'use server'

import {db} from '@/lib/db'
import {Option} from "@/components/ui/multiple-selector";
import {channel} from "diagnostics_channel";

export const onCreateNodesEdges = async (
    flowId: string,
    nodes: string,
    edges: string,
    flowPath: string
) => {
    const flow = await db.workflows.update({
        where: {
            id: flowId,
        },
        data: {
            nodes,
            edges,
            flowPath: flowPath,
        },
    })

    if (flow) return {message: 'flow saved'}
}

export const onFlowPublish = async (workflowId: string, state: boolean) => {
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
        })

        if (response) {
            const channelList = await db.workflows.findUnique({
                where: {
                    id: workflowId,
                },
                select: {
                    slackChannels: true,
                },
            })

            if (channelList) {
                //remove duplicates before insert
                const NonDuplicated = channelList.slackChannels.filter(
                    (channel) => channel !== channels![0].value
                )

                NonDuplicated!
                    .map((channel) => channel)
                    .forEach(async (channel) => {
                        await db.workflows.update({
                            where: {
                                id: workflowId,
                            },
                            data: {
                                slackChannels: {
                                    push: channel,
                                },
                            },
                        })
                    })

                return 'Slack template saved'
            }
            channels!
                .map((channel) => channel.value)
                .forEach(async (channel) => {
                    await db.workflows.update({
                        where: {
                            id: workflowId,
                        },
                        data: {
                            slackChannels: {
                                push: channel,
                            },
                        },
                    })
                })
            return 'Slack template saved'
        }
    }
}

export const getworkflow = async (workflowId: string) => {
    const workflow = await db.workflows.findUnique({
        where: {
            id: workflowId,
        },
    })

    if (workflow) {
        return workflow
    }
}

// export const onGetNodeTemplate = async (
//     type: string,
//     workflowId: string,
// ) => {
//     if (type === 'Discord') {
//         try {
//             // Fetching the specific workflow by ID
//             const response = await db.workflows.findUnique({
//                 where: {
//                     id: workflowId,
//                 },
//                 select: {
//                     discordTemplate: true,  // Only fetch the discordTemplate field
//                 },
//             });
//
//             // Check if the workflow and the discordTemplate exists
//             if (response && response.discordTemplate) {
//                 return {
//                     success: true,
//                     message: 'Discord template fetched successfully',
//                     discordTemplate: response.discordTemplate,
//                 };
//             } else {
//                 return {
//                     success: false,
//                     message: 'No discord template found or workflow does not exist',
//                 };
//             }
//         } catch (error) {
//             console.error('Error fetching discord template:', error);
//             return {
//                 success: false,
//                 message: 'An error occurred while fetching the discord template',
//             };
//         }
//     }
// };
