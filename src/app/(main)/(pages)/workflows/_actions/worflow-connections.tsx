"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Option } from "@/components/ui/multiple-selector";

export const getGoogleListener = async () => {
  const { userId } = auth();

  if (userId) {
    const listener = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        googleResourceId: true,
      },
    });

    if (listener) return listener;
  }
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  const published = await db.workflows.update({
    where: {
      id: workflowId,
    },
    data: {
      publish: state,
    },
  });

  if (published.publish) return "Workflow published";
  return "Workflow unpublished";
};

export const onCreateNodeTemplate = async (
  content: string,
  type: string,
  workflowId: string,
  channels?: Option[],
  accessToken?: string,
  notionDbId?: string
) => {
  if (type === "Discord") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        discordTemplate: content,
      },
    });

    if (response) {
      return "Discord template saved";
    }
  }
  if (type === "Slack") {
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
      const newChannelNames = channels.map((channel) => channel.label);

      // Update the workflow with the new set of channels
      await db.workflows.update({
        where: {
          id: workflowId,
        },
        data: {
          slackChannels: newChannelNames,
        },
      });

      return "Slack template saved";
    }
  }

  if (type === "Notion") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        notionTemplate: content,
        notionAccessToken: accessToken,
        notionDbId: notionDbId,
      },
    });

    if (response) return "Notion template saved";
  }
  if (type === "AI") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        AiTemplate: content,
      },
    });

    if (response) {
      return "AI template saved";
    }
  }
  if (type === "live-portrait") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        livePortraitTemplate: content,
      },
    });

    if (response) {
      return "live portrait template saved";
    }
  }
  if (type === "flux-dev") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        fluxDevTemplate: content,
      },
    });

    if (response) {
      return "flux-dev template saved";
    }
  }
  if (type === "image-to-image") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        ImageToImageTemplate: content,
      },
    });

    if (response) {
      return "image-to-image template saved";
    }
  }
  if (type === "flux-lora") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        fluxloraTemplate: content,
      },
    });

    if (response) {
      return "flux-lora template saved";
    }
  }
  if (type === "stable-video") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        videoTemplate: content,
      },
    });

    if (response) {
      return "stable-video template saved";
    }
  }
  if (type === "text-to-voice") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        textToVoiceTemplate: content,
      },
    });

    if (response) {
      return "text-to-voice template saved";
    }
  }
  if (type === "sadTalker") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        sadTalkerTemplate: content,
      },
    });

    if (response) {
      return "sadTalker template saved";
    }
  }
  if (type === "autoCaption") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        autoCaptionTemplate: content,
      },
    });

    if (response) {
      return "autoCaption template saved";
    }
  }
  if (type === "train-flux") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        fluxTrainTemplate: content,
      },
    });

    if (response) {
      return "train-flux template saved";
    }
  }
  if (type === "consistent-character") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        CharacterTemplate: content,
      },
    });

    if (response) {
      return "consistent-character template saved";
    }
  }
  if (type === "dreamShaper") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        DreamShaperTemplate: content,
      },
    });

    if (response) {
      return "dreamShaper template saved";
    }
  }
  if (type === "fluxGeneral") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        fluxGeneralTemplate: content,
      },
    });

    if (response) {
      return "fluxGeneral template saved";
    }
  }
  if (type === "fluxDevLora") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        fluxDevLora: content,
      },
    });

    if (response) {
      return "fluxDevLora template saved";
    }
  }
  if (type === "CogVideoX-5B") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        cogVideo5BTemplate: content,
      },
    });

    if (response) {
      return "CogVideo-5B template saved";
    }
  }
  if (type === "musicGen") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        musicGenTemplate: content,
      },
    });

    if (response) {
      return "musicGen template saved";
    }
  }

  if (type === "video-to-video") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        videoToVideoTemplate: content,
      },
    });

    if (response) {
      return "video-to-video template saved";
    }
  }
  if (type === "lumalabs-ImageToVideo") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        lunalabsImageToVideoTemplate: content,
      },
    });

    if (response) {
      return "lumalabs-ImageToVideo template saved";
    }
  }
  if (type === "lumalabs-TextToVideo") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        lunalabsTextToVideoTemplate: content,
      },
    });

    if (response) {
      return "lumalabs-TextToVideo template saved";
    }
  }
};

export const onGetWorkflows = async () => {
  const user = await currentUser();
  if (user) {
    const workflow = await db.workflows.findMany({
      where: {
        userId: user.id,
      },
    });

    if (workflow) return workflow;

  }
};

export const onCreateWorkflow = async (name: string, description: string) => {
  const user = await currentUser();

  if (user) {
    //create new workflow
    const workflow = await db.workflows.create({
      data: {
        userId: user.id,
        name,
        description,
        createdAt: new Date().toISOString(),
      },
    });

    if (workflow) return { message: "workflow created" };
    return { message: "Oops! try again" };
  }
};

export const onGetNodesEdges = async (flowId: string) => {
  const nodesEdges = await db.workflows.findUnique({
    where: {
      id: flowId,
    },
    select: {
      nodes: true,
      edges: true,
    },
  });
  if (nodesEdges?.nodes && nodesEdges?.edges) return nodesEdges;
};

export const onUpdateChatHistory = async (
  workflowId: string,
  chatHistory: any
) => {
  const currentData = await db.workflows.findUnique({
    where: {
      id: workflowId,
    },
  });
  chatHistory = JSON.stringify(chatHistory);
  let updatedHistory;
  if (currentData && currentData.chatHistory) {
    updatedHistory = [...currentData.chatHistory, chatHistory];
  } else {
    updatedHistory = [chatHistory];
  }
  const published = await db.workflows.update({
    where: {
      id: workflowId,
    },
    data: {
      chatHistory: updatedHistory,
    },
  });

  if (published) return updatedHistory;
};

export const ondublicateWorkflow = async (
  name: string,
  description: string,
  id: string,
  share?: boolean,
  url?: string
) => {
  const user = await currentUser();

  if (user) {
    // Fetch the existing workflow by ID
    const existingWorkflow = await db.workflows.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingWorkflow) {
      return { message: "Workflow not found" };
    }
        // Create a new workflow with the same data
    const workflow = await db.workflows.create({
      data: {
        userId: user.id,
        name,
        description,
        nodes: existingWorkflow.nodes,
        edges: existingWorkflow.edges,
        chatHistory: existingWorkflow.chatHistory,
        AiTemplate: existingWorkflow.AiTemplate,
        fluxDevLora: existingWorkflow.fluxDevLora,
        fluxDevTemplate: existingWorkflow.fluxDevTemplate,
        fluxGeneralTemplate: existingWorkflow.fluxGeneralTemplate,
        fluxloraTemplate: existingWorkflow.fluxloraTemplate,
        videoTemplate: existingWorkflow.videoTemplate,
        CharacterTemplate: existingWorkflow.CharacterTemplate,
        DreamShaperTemplate: existingWorkflow.DreamShaperTemplate,
        ImageToImageTemplate: existingWorkflow.ImageToImageTemplate,
        fluxTrainTemplate: existingWorkflow.fluxTrainTemplate,
        flowPath: existingWorkflow.flowPath,
        cogVideo5BTemplate: existingWorkflow.cogVideo5BTemplate,
        musicGenTemplate: existingWorkflow.musicGenTemplate,
        videoToVideoTemplate: existingWorkflow.videoToVideoTemplate,
        lunalabsImageToVideoTemplate:
          existingWorkflow.lunalabsImageToVideoTemplate,
        lunalabsTextToVideoTemplate:
          existingWorkflow.lunalabsTextToVideoTemplate,
        autoCaptionTemplate: existingWorkflow.autoCaptionTemplate,
        sadTalkerTemplate: existingWorkflow.sadTalkerTemplate,
        publish: existingWorkflow.publish,
        createdAt: new Date().toISOString(),
        shared: share || false,
        thumbnail: url ?? existingWorkflow.thumbnail,
        textToVoiceTemplate: existingWorkflow.textToVoiceTemplate,
      },
    });
    const message = share ? "Workflow shared" : "Workflow duplicated";

    if (workflow)
      return { message: message, workflowid: workflow.id };
    return { message: "Oops! try again" };
  }
};
