"use client";
import React from "react";
import {
  Calendar,
  CircuitBoard,
  Database,
  GitBranch,
  HardDrive,
  Mail,
  MousePointerClickIcon,
  Image,
  ImagePlayIcon,
  Video,
  Slack,
  Timer,
  Webhook,
  Zap,
  MessageCircle,
  Music,
  CaptionsIcon,
} from "lucide-react";
import { EditorCanvasTypes } from "@/lib/types";

type Props = { type: EditorCanvasTypes };
const EditorCanvasIconHelper = ({ type }: Props) => {
  switch (type) {
    case "Email":
      return <Mail className="flex-shrink-0" size={30} />;
    case "Condition":
      return <GitBranch className="flex-shrink-0" size={30} />;
    case "flux-dev":
      return <ImagePlayIcon className="flex-shrink-0" size={30} />;
    case "image-to-image":
      return <ImagePlayIcon className="flex-shrink-0" size={30} />;
    case "flux-lora":
      return <Image className="flex-shrink-0" size={30} />;
    case "stable-video":
      return <Video className="flex-shrink-0" size={30} />;
    case "sadTalker":
      return <Video className="flex-shrink-0" size={30} />;
    case "autoCaption":
      return <CaptionsIcon className="flex-shrink-0" size={30} />;
    case "train-flux":
      return <Image className="flex-shrink-0" size={30} />;
    case "consistent-character":
      return <ImagePlayIcon className="flex-shrink-0" size={30} />;
    case "dreamShaper":
      return <ImagePlayIcon className="flex-shrink-0" size={30} />;
    case "fluxGeneral":
      return <Image className="flex-shrink-0" size={30} />;
    case "fluxDevLora":
      return <Image className="flex-shrink-0" size={30} />;
    case "AI":
      return <CircuitBoard className="flex-shrink-0" size={30} />;
    case "Slack":
      return <Slack className="flex-shrink-0" size={30} />;
    case "Google Drive":
      return <HardDrive className="flex-shrink-0" size={30} />;
    case "Notion":
      return <Database className="flex-shrink-0" size={30} />;
    case "Custom Webhook":
      return <Webhook className="flex-shrink-0" size={30} />;
    case "Google Calendar":
      return <Calendar className="flex-shrink-0" size={30} />;
    case "Trigger":
      return <MousePointerClickIcon className="flex-shrink-0" size={30} />;
    case "Chat":
      return <MessageCircle className="flex-shrink-0" size={30} />;
    case "Wait":
      return <Timer className="flex-shrink-0" size={30} />;
    case "musicGen":
      return <Music className="flex-shrink-0" size={30} />;
    case "CogVideoX-5B":
      return <Video className="flex-shrink-0" size={30} />;
    default:
      return <Zap className="flex-shrink-0" size={30} />;
  }
};

export default EditorCanvasIconHelper;
