import { Connection } from "@/lib/types";
import {
  CreditCard,
  HomeIcon,
  SettingsIcon,
  SparkleIcon,
  Workflow,
} from "lucide-react";

export const clients = [...new Array(10)].map((client, index) => ({
  href: `/${index + 1}.png`,
}));

export const LLMS = [
  "OPENAI",
  "AZURE_OPENAI",
  "HUGGINGFACE",
  "PERPLEXITY",
  "TOGETHER_AI",
  "ANTHROPIC",
  "BEDROCK",
  "GROQ",
  "MISTRAL",
  "COHERE_CHAT",
  "GEMINI",
];

export const ToolType = [
  {
    value: "ALGOLIA",
    title: "Algolia Index",
    metadata: [
      {
        key: "index",
        type: "input",
        label: "Algolia Index",
      },
      {
        key: "appId",
        type: "input",
        label: "Algolia App ID",
      },
      {
        key: "apiKey",
        type: "password",
        label: "Algolia API Key",
      },
    ],
  },
  {
    value: "BING_SEARCH",
    title: "Bing Search",
    metadata: [
      {
        key: "bingSearchUrl",
        type: "input",
        label: "Bing Search URL",
      },
      {
        key: "bingSubscriptionKey",
        type: "input",
        label: "Bing Subscription Key",
      },
    ],
  },
  {
    value: "METAPHOR",
    title: "Metaphor Search",
    metadata: [
      {
        key: "metaphorApiKey",
        type: "input",
        label: "Metaphor API Key",
      },
    ],
  },
  {
    value: "CHATGPT_PLUGIN",
    title: "ChatGPT plugin",
    metadata: [
      {
        key: "chatgptPluginURL",
        type: "input",
        label: "Plugin manifest url",
      },
    ],
  },
  {
    value: "REPLICATE",
    title: "Replicate",
    metadata: [
      {
        key: "model",
        type: "input",
        label: "Model",
      },
      {
        key: "apiKey",
        type: "input",
        label: "Replicate API key",
      },
      {
        key: "arguments",
        type: "json",
        label: "Other arguments",
      },
    ],
  },
  {
    value: "SCRAPER",
    title: "Web extractor",
    metadata: [
      {
        key: "apiKey",
        type: "input",
        label: "Replicate API key",
      },
    ],
  },
  {
    value: "ADVANCED_SCRAPER",
    title: "Advanced Web extractor",
    metadata: [
      {
        key: "apiKey",
        type: "input",
        label: "Replicate API key",
      },
    ],
  },
  {
    value: "GOOGLE_SEARCH",
    title: "Google search",
    metadata: [
      {
        key: "apiKey",
        type: "input",
        label: "Google search api key",
      },
    ],
  },
  {
    value: "HTTP",
    title: "API Request",
    metadata: [
      {
        key: "headers",
        type: "json",
        label: "Headers",
      },
    ],
  },
  {
    value: "PUBMED",
    title: "PubMed",
    metadata: [],
  },
  {
    value: "CODE_EXECUTOR",
    title: "Code interpreter (alpha)",
    metadata: [],
  },
  {
    value: "BROWSER",
    title: "Browser",
    metadata: [],
  },
  {
    value: "HAND_OFF",
    title: "Human hand-off (Alpha)",
    metadata: [],
  },
  {
    value: "FUNCTION",
    title: "Function",
    metadata: [
      {
        key: "functionName",
        type: "input",
        label: "Function name",
        helpText: "Use lowercase letters, ex: get_article",
      },
      {
        key: "args",
        type: "json",
        label: "Arguments",
        helpText: "Add function arguments in the following format",
        json: {
          title: { type: "string", description: "Article title" },
          url: { type: "string", description: "The url of the article" },
        },
      },
    ],
  },
];

export const products = [
  {
    title: "Moonbeam",
    link: "https://gomoonbeam.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Cursor",
    link: "https://cursor.so",
    thumbnail: "/p2.png",
  },
  {
    title: "Rogue",
    link: "https://userogue.com",
    thumbnail: "/p3.png",
  },

  {
    title: "Editorially",
    link: "https://editorially.org",
    thumbnail: "/p4.png",
  },
  {
    title: "Editrix AI",
    link: "https://editrix.ai",
    thumbnail: "/p5.png",
  },
  {
    title: "Pixel Perfect",
    link: "https://app.pixelperfect.quest",
    thumbnail: "/p6.png",
  },

  {
    title: "Algochurn",
    link: "https://algochurn.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Aceternity UI",
    link: "https://ui.aceternity.com",
    thumbnail: "/p2.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail: "/p3.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail: "/p4.png",
  },
  {
    title: "Renderwork Studio",
    link: "https://renderwork.studio",
    thumbnail: "/p5.png",
  },

  {
    title: "Creme Digital",
    link: "https://cremedigital.com",
    thumbnail: "/p6.png",
  },
  {
    title: "Golden Bells Academy",
    link: "https://goldenbellsacademy.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Invoker Labs",
    link: "https://invoker.lol",
    thumbnail: "/p2.png",
  },
  {
    title: "E Free Invoice",
    link: "https://efreeinvoice.com",
    thumbnail: "/p3.png",
  },
];

export const menuOptions = [
  { name: "Dashboard", Component: HomeIcon, href: "/dashboard" },
  { name: "Workflows", Component: Workflow, href: "/workflows" },
  { name: "Connections", Component: SparkleIcon, href: "/connections" },
  { name: "Billing", Component: CreditCard, href: "/billing" },
  { name: "Settings", Component: SettingsIcon, href: "/settings" },
];

export const EditorCanvasDefaultCardTypes = {
  AI: {
    description:
      "Use the power of AI to summarize, respond, create and much more.",
    type: ["Action", "Trigger"],
  },
  Chat: {
    description: "sharable Chat interface to interact with the workflow.",
    type: "Action",
  },
  Slack: { description: "Send a notification to slack", type: "Action" },
  Notion: { description: "Create entries directly in notion.", type: "Action" },
  Discord: {
    description: "Post messages to your discord server",
    type: "Action",
  },
  "flux-dev": {
    description: "Development tools for creating and testing flux models.",
    type: "Action",
  },
  "image-to-image": {
    description: "Convert one image to another using AI models.",
    type: "Action",
  },
  "flux-lora": {
    description: "Low-rank adaptation for fine-tuning flux models.",
    type: "Action",
  },
  "train-flux": {
    description: "Train flux models with custom datasets.",
    type: "Action",
  },
  "stable-video": {
    description: "Generate stable videos using AI techniques.",
    type: "Action",
  },
  "text-to-voice": {
    description: "Convert text to voice using elevenLabs AI models.",
    type: "Action",
  },
  autoCaption: {
    description: "Generate captions for videos using AI models.",
    type: "Action",
  },
  sadTalker: {
    description: "Generate Video with images and audio files using AI models.",
    type: "Action",
  },
  musicGen: {
    description: "Generate music using Meta Music-Gen models.",
    type: "Action",
  },
  "CogVideoX-5B": {
    description: "Generate videos using open source CogVideoX-5B models.",
    type: "Action",
  },
  "video-to-video": {
    description: "Convert one video to another using AI models.",
    type: "Action",
  },
  "lumalabs-ImageToVideo": {
    description: "Convert images to videos using Luma Labs models.",
    type: "Action",
  },
  "lumalabs-TextToVideo": {
    description: "Convert text to videos using Luma Labs models.",
    type: "Action",
  },
  "consistent-character": {
    description: "Create images of a given character in different poses.",
    type: "Action",
  },
  dreamShaper: {
    description:
      "Generate a new image from an input image with DreamShaper V6.",
    type: "Action",
  },
  fluxGeneral: {
    description:
      "Generate stable images with FLUX.1 [dev], next generation text-to-image model.",
    type: "Action",
  },
  fluxDevLora: {
    description: "FLUX.1-Dev Multi LoRA Explorer.",
    type: "Action",
  },
  "Google Calendar": {
    description: "Create a calendar invite.",
    type: "Action",
  },
  "Custom Webhook": {
    description:
      "Connect any app that has an API key and send data to your applicaiton.",
    type: "Action",
  },
  Trigger: {
    description: "An event that starts the workflow.",
    type: "Trigger",
  },
  Email: { description: "Send and email to a user", type: "Action" },
  Wait: {
    description: "Delay the next action step by using the wait timer.",
    type: "Action",
  },
  Condition: {
    description: "Boolean operator that creates different conditions lanes.",
    type: "Action",
  },
  "Google Drive": {
    description:
      "Connect with Google drive to trigger actions or to create files and folders.",
    type: "Action",
  },
};

export const CONNECTIONS: Connection[] = [
  {
    title: "Google Drive",
    description: "Connect your google drive to listen to folder changes",
    image: "/googleDrive.png",
    connectionKey: "googleNode",
    alwaysTrue: true,
  },
  {
    title: "Discord",
    description: "Connect your discord to send notification and messages",
    image: "/discord.png",
    connectionKey: "discordNode",
    accessTokenKey: "webhookURL",
  },
  {
    title: "Notion",
    description: "Create entries in your notion dashboard and automate tasks.",
    image: "/notion.png",
    connectionKey: "notionNode",
    accessTokenKey: "accessToken",
  },
  {
    title: "Slack",
    description:
      "Use slack to send notifications to team members through your own custom bot.",
    image: "/slack.png",
    connectionKey: "slackNode",
    accessTokenKey: "slackAccessToken",
    slackSpecial: true,
  },
];

export const creditsRequired = {
  "text-to-voice": 1,
  "image-to-video": 10,
  "text-to-video": 10,
  "video-to-video": 10,
  "lumalabs-ImageToVideo": 10,
  "lumalabs-TextToVideo": 10,
  "consistent-character": 1,
  dreamShaper: 1,
  fluxGeneral: 1,
  fluxDevLora: 1,
  "Google Calendar": 1,
  "Custom Webhook": 1,
  autoCaption: 1,
  sadTalker: 1,
  musicGen: 1,
  "CogVideoX-5B": 10,
  "flux-dev": 1,
  "flux-lora": 1,
  AI: 1,
  "image-to-image": 1,
  "stable-video": 10,
  "train-flux": 60,
  "Chat": 0,
};
