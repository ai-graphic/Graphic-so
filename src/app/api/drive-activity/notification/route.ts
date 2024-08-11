import {postContentToWebHook} from '@/app/(main)/(pages)/connections/_actions/discord-connection'
import {onCreateNewPageInDatabase} from '@/app/(main)/(pages)/connections/_actions/notion-connection'
import {postMessageToSlack} from '@/app/(main)/(pages)/connections/_actions/slack-connection'
import {db} from '@/lib/db'
import axios from 'axios'
import {headers} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'
import {google} from "googleapis";
import {auth, clerkClient} from "@clerk/nextjs/server";
import {v4 as uuidv4} from "uuid";

export async function POST(req: NextRequest) {
    console.log('🔴 Changed', Date.now())
    const headersList = headers()
    // console.log(headersList);
    let channelResourceId
    headersList.forEach((value, key) => {
        if (key == 'x-goog-resource-id') {
            channelResourceId = value
        }
    })

    if (channelResourceId) {
        const user = await db.user.findFirst({
            where: {
                googleResourceId: channelResourceId,
            },
            select: {clerkId: true, credits: true},
        })
            const workflow = await db.workflows.findMany({
                where: {
                    userId: user?.clerkId,
                },
            })
            if (workflow) {
                workflow.map(async (flow) => {
                    const flowPath = JSON.parse(flow.flowPath!)
                    let current = 0
                    while (current < flowPath.length) {
                        if (flowPath[current] == 'Discord') {
                            const discordMessage = await db.discordWebhook.findFirst({
                                where: {
                                    userId: flow.userId,
                                },
                                select: {
                                    url: true,
                                },
                            })
                            if (discordMessage) {
                                console.log(discordMessage.url)
                                await postContentToWebHook(
                                    flow.discordTemplate!,
                                    discordMessage.url
                                )
                                flowPath.splice(flowPath[current], 1)
                            }
                        }
                        if (flowPath[current] == 'Slack') {
                            console.log(flow.slackChannels)
                            const channels = flow.slackChannels.map((channel) => {
                                return {
                                    label: '',
                                    value: channel,
                                }
                            })
                            console.log(flow.slackAccessToken)
                            await postMessageToSlack(
                                flow.slackAccessToken!,
                                channels,
                                flow.slackTemplate!
                            )
                            flowPath.splice(flowPath[current], 1)
                        }
                        if (flowPath[current] == 'Notion') {
                            await onCreateNewPageInDatabase(
                                flow.notionDbId!,
                                flow.notionAccessToken!,
                                JSON.parse(flow.notionTemplate!)
                            )
                            flowPath.splice(flowPath[current], 1)
                        }
                        if (flowPath[current] == 'Wait') {
                            const res = await axios.put(
                                'https://api.cron-job.org/jobs',
                                {
                                    job: {
                                        url: `${process.env.NGROK_URI}?flow_id=${flow.id}`,
                                        enabled: 'true',
                                        schedule: {
                                            timezone: 'Asia/Kolkata',
                                            expiresAt: 0,
                                            hours: [-1],
                                            mdays: [-1],
                                            minutes: ['*****'],
                                            months: [-1],
                                            wdays: [-1],
                                        },
                                    },
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${process.env.CRON_JOB_KEY!}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                            if (res) {
                                flowPath.splice(flowPath[current], 1)
                                const cronPath = await db.workflows.update({
                                    where: {
                                        id: flow.id,
                                    },
                                    data: {
                                        cronPath: JSON.stringify(flowPath),
                                    },
                                })
                                if (cronPath) break
                            }
                            break
                        }
                        current++
                    }

                    await db.user.update({
                        where: {
                            clerkId: user?.clerkId,
                        },
                        data: {
                            credits: `${parseInt(user?.credits!) - 1}`,
                        },
                    })
                })
                return Response.json(
                    {
                        message: 'flow completed',
                    },
                    {
                        status: 200,
                    }
                )
            }
        return Response.json(
            {
                message: 'success',
            },
            {
                status: 200,
            }
        )
    }
}