import z from "zod";
import { ConnectionProviderProps } from "@/hooks/connections-providers";

export const EditUserProfileSchema = z.object({
  email: z.string().email("Required"),
  name: z.string().min(1, "Required"),
});

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type ConnectionTypes = "Google Drive" | "Notion" | "Slack" | "Discord";

export type Connection = {
  title: ConnectionTypes;
  description: string;
  image: string;
  connectionKey: keyof ConnectionProviderProps;
  accessTokenKey?: string;
  alwaysTrue?: boolean;
  slackSpecial?: boolean;
};
export type OutputType = {
  image: string[];
  text: string[];
  video: string[];
};

export type EditorCanvasTypes =
  | "Email"
  | "Condition"
  | "AI"
  | "Slack"
  | "Google Drive"
  | "Notion"
  | "Custom Webhook"
  | "Google Calendar"
  | "Trigger"
  | "Chat"
  | "Wait"
  | "flux-dev"
  | "image-to-image"
  | "flux-lora"
  | "stable-video"
  | "train-flux"
  | "consistent-character"
  | "dreamShaper"
  | "fluxGeneral"
  | "fluxDevLora"
  | "CogVideoX-5B"
  | "musicGen"
  | "video-to-video"
  | "lumalabs-ImageToVideo"
  | "lumalabs-TextToVideo"
  | "autoCaption"
  | "sadTalker";

export type EditorCanvasCardType = {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  metadata: any;
  type: EditorCanvasTypes;
};

export type EditorNodeType = {
  id: string;
  type: EditorCanvasCardType["type"];
  position: {
    x: number;
    y: number;
  };
  data: EditorCanvasCardType;
};

export type EditorNode = EditorNodeType;

export type EditorActions =
  | {
      type: "LOAD_DATA";
      payload: {
        elements: EditorNode[];
        edges: {
          id: string;
          source: string;
          target: string;
        }[];
      };
    }
  | {
      type: "UPDATE_NODE";
      payload: {
        elements: EditorNode[];
      };
    }
  | { type: "REDO" }
  | { type: "UNDO" }
  | {
      type: "SELECTED_ELEMENT";
      payload: {
        element: EditorNode;
      };
    };

export const nodeMapper: Record<string, string> = {
  Notion: "notionNode",
  Slack: "slackNode",
  Discord: "discordNode",
  "Google Drive": "googleNode",
  AI: "aiNode",
  Trigger: "triggerNode",
  Chat: "chatNode",
  "flux-dev": "fluxDevNode",
  "image-to-image": "imageToImageNode",
  "flux-lora": "fluxLoraNode",
  "stable-video": "stableVideoNode",
  "train-flux": "trainFluxNode",
  "consistent-character": "consistentCharacterNode",
  dreamShaper: "dreamShaperNode",
  fluxGeneral: "fluxGeneralNode",
  fluxDevLora: "fluxDevLoraNode",
  "CogVideoX-5B": "CogVideoX5BNode",
  musicGen: "musicgenNode",
  "video-to-video": "videoToVideoNode",
  "lumalabs-ImageToVideo": "lunalabsImageToVideoNode",
  "lumalabs-TextToVideo": "lunalabsTextToVideoNode",
  autoCaption: "autocaptionNode",
  sadTalker: "sadTalkerNode",
};

export type Option = {
  [key: string]: {
    placeholder: string | number | boolean;
    type: string;
  };
};

export interface Product {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  twitter_handle: string;
  product_website: string;
  codename: string;
  punchline: string;
  description: string;
  logo_src: string;
  user_id: string;
  tags: string[];
  view_count: number;
  approved: boolean;
  labels: string[];
  categories: string;
  publish: boolean;
  created: string;
  shared: boolean;
}
