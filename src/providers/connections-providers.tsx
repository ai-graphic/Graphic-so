"use client";

import { createContext, useContext, useState } from "react";

export type ConnectionProviderProps = {
  discordNode: {
    webhookURL: string;
    content: string;
    webhookName: string;
    guildName: string;
  };
  isFlow: any[];
  setisFlow: React.Dispatch<React.SetStateAction<any[]>>;
  setDiscordNode: React.Dispatch<React.SetStateAction<any>>;
  triggerNode: {
    triggerImage: string;
    triggerValue: string;
  };
  setTriggerNode: React.Dispatch<React.SetStateAction<any>>;
  chatNode: {
    chatType: string;
    chatid: string;
    chatHistory: string[];
    chatinput: string;
  };
  setChatNode: React.Dispatch<React.SetStateAction<any>>;
  aiNode: {
    [id: string]: {
      id: string;
      system: string;
      prompt: string;
      model: string;
      localModel: string;
      temperature: number;
      maxTokens: number;
      endpoint: string;
      num_outputs: number;
      aspect_ratio: string;
      output_format: string;
      guidance_scale: number;
      output_quality: number;
      tool: string;
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
      history: boolean;
    };
  };
  fluxDevNode: {
    [id: string]: {
      id: string;
      model: string;
      output: string;
      prompt: string;
      image_size: string;
      num_inference_steps: number;
      guidance_scale: number;
      num_images: number;
      seed: number;
      enable_safety_checker: boolean;
      sync_mode: boolean;
    };
  };
  imageToImageNode: {
    [id: string]: {
      id: string;
      prompt: string;
      image_size: string;
      image_url: string;
      num_inference_steps: number;
      guidance_scale: number;
      num_images: number;
      seed: number;
      enable_safety_checker: boolean;
      sync_mode: boolean;
      strength: number;
    };
  };
  fluxLoraNode: {
    [id: string]: {
      id: string;
      prompt: string;
      image_size: string;
      num_inference_steps: number;
      guidance_scale: number;
      num_images: number;
      seed: number;
      enable_safety_checker: boolean;
      loras: [];
      sync_mode: boolean;
      output_format: string;
    };
  };
  stableVideoNode: {
    [id: string]: {
      id: string;
      image_url: string;
      motion_bucket_id: string;
      fps: number;
      cond_aug: boolean;
    };
  };
  trainFluxNode: {
    [id: string]: {
      id: string;
      images_data_url: string;
      trigger_word: string;
      iter_multiplier: number;
    };
  };
  consistentCharacterNode: {
    [id: string]: {
      id: string;
      prompt: string;
      subject: string;
      negative_prompt: string;
      randomise_poses: boolean;
      number_of_outputs: number;
      number_of_images_per_pose: number;
      num_outputs: number;
      output_format: string;
      disable_safety_checker: boolean;
      output_quality: number;
    };
  };
  dreamShaperNode: {
    [id: string]: {
      id: string;
      prompt: string;
      image: string;
      negative_prompt: string;
      num_inference_steps: number;
      guidance_scale: number;
      num_outputs: number;
      scheduler: string;
      upscale: number;
      strength: number;
    };
  };
  fluxGeneralNode: {
    [id: string]: {
      id: string;
      prompt: string;
      image_size: string;
      num_inference_steps: number;
      guidance_scale: number;
      num_images: number;
      seed: number;
      sync_mode: boolean;
      enable_safety_checker: boolean;
    };
  };
  fluxDevLoraNode: {
    [id: string]: {
      id: string;
      prompt: string;
      hf_loras: string[];
      num_outputs: number;
      aspect_ratio: string;
      output_format: string;
      guidance_scale: number;
      output_quality: string;
      num_inference_steps: number;
    };
  };
  musicgenNode: {
    [id: string]: {
      prompt: string;
      id: string;
      seed: number;
      top_k: number;
      top_p: number;
      duration: number;
      input_audio: string;
      temperature: number;
      continuation: boolean;
      model_version: string;
      output_format: string;
      continuation_start: number;
      multi_band_diffusion: boolean;
      normalization_strategy: string;
      classifier_free_guidance: number;
    };
  };
  CogVideoX5BNode: {
    [id: string]: {
      id: string;
      prompt: string;
      num_inference_steps: number;
      guidance_scale: number;
      seed: number;
      export_fps: number;
      use_rife: boolean;
      negative_prompt: string;
    };
  };
  videoToVideoNode: {
    [id: string]: {
      id: string;
      prompt: string;
      num_inference_steps: number;
      guidance_scale: number;
      seed: number;
      export_fps: number;
      video_url: string;
      strength: number;
    };
  };
  lunalabsImageToVideoNode: {
    [id: string]: {
      id: string;
      prompt: string;
      start_frame_url : string,
      end_frame_url : string,
      aspect_ratio : "",
      loop : boolean,
    };
  };
  lunalabsTextToVideoNode: {
    [id: string]: {
      id: string;
      prompt: string;
      aspect_ratio : "",
      loop : boolean,
    };
  };
  setvideoToVideoNode: React.Dispatch<React.SetStateAction<any>>;
  setlunalabsImageToVideoNode: React.Dispatch<React.SetStateAction<any>>;
  setlunalabsTextToVideoNode: React.Dispatch<React.SetStateAction<any>>;
  history: any;
  setCogVideoX5BNode: React.Dispatch<React.SetStateAction<any>>;
  setmusicgenNode: React.Dispatch<React.SetStateAction<any>>;
  setDreamShaperNode: React.Dispatch<React.SetStateAction<any>>;
  setFluxGeneralNode: React.Dispatch<React.SetStateAction<any>>;
  setFluxDevLoraNode: React.Dispatch<React.SetStateAction<any>>;
  setconsistentCharacterNode: React.Dispatch<React.SetStateAction<any>>;
  setfluxDevNode: React.Dispatch<React.SetStateAction<any>>;
  setimageToImageNode: React.Dispatch<React.SetStateAction<any>>;
  setfluxLoraNode: React.Dispatch<React.SetStateAction<any>>;
  setstableVideoNode: React.Dispatch<React.SetStateAction<any>>;
  settrainFluxNode: React.Dispatch<React.SetStateAction<any>>;
  output: {
    [id: string]: {
      image: string[];
      text: string[];
      video: string[];
    };
  };
  setOutput: React.Dispatch<
    React.SetStateAction<{
      [id: string]: { image: string[]; text: string[]; video: string[] };
    }>
  >;
  setAINode: React.Dispatch<React.SetStateAction<any>>;
  addAINode: (id: string, type: string) => void; // Add this line
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
  chatNode: {
    chatType: "",
    chatid: "",
    chatHistory: [],
    chatinput: "",
  },
  isFlow: [],
  setisFlow: () => undefined,
  discordNode: {
    webhookURL: "",
    content: "",
    webhookName: "",
    guildName: "",
  },
  triggerNode: {
    triggerImage: "",
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
  fluxDevNode: {},
  imageToImageNode: {},
  fluxLoraNode: {},
  stableVideoNode: {},
  consistentCharacterNode: {},
  dreamShaperNode: {},
  fluxGeneralNode: {},
  fluxDevLoraNode: {},
  trainFluxNode: {},
  output: {},
  setOutput: () => undefined,
  workflowTemplate: {
    discord: "",
    notion: "",
    slack: "",
    ai: "",
  },

  videoToVideoNode: {},
  lunalabsImageToVideoNode: {},
  lunalabsTextToVideoNode: {},
  setvideoToVideoNode: () => undefined,
  setlunalabsImageToVideoNode: () => undefined,
  setlunalabsTextToVideoNode: () => undefined,
  history: {},
  CogVideoX5BNode: {},
  musicgenNode: {},
  setmusicgenNode: () => undefined,
  setCogVideoX5BNode: () => undefined,
  isLoading: false,
  setDreamShaperNode: () => undefined,
  setFluxGeneralNode: () => undefined,
  setFluxDevLoraNode: () => undefined,
  setconsistentCharacterNode: () => undefined,
  setGoogleNode: () => undefined,
  setTriggerNode: () => undefined,
  setDiscordNode: () => undefined,
  setNotionNode: () => undefined,
  setSlackNode: () => undefined,
  setIsLoading: () => undefined,
  setWorkFlowTemplate: () => undefined,
  setChatNode: () => undefined,
  setAINode: () => undefined,
  addAINode: () => undefined,
  setfluxDevNode: () => undefined,
  setimageToImageNode: () => undefined,
  setfluxLoraNode: () => undefined,
  setstableVideoNode: () => undefined,
  settrainFluxNode: () => undefined,
};
const generateDefaultAINode = (id: string) => ({
  id,
  system: "",
  prompt: "",
  model: "vercel",
  localModel: "Claude",
  tool : "",
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
  history: true,
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
  const [chatNode, setChatNode] = useState(InitialValues.chatNode);
  const [triggerNode, setTriggerNode] = useState(InitialValues.triggerNode);
  const [fluxDevNode, setfluxDevNode] = useState(InitialValues.fluxDevNode);
  const [CogVideoX5BNode, setCogVideoX5BNode] = useState(
    InitialValues.CogVideoX5BNode
  );
  const [musicgenNode, setmusicgenNode] = useState(InitialValues.musicgenNode);
  const [isFlow, setisFlow] = useState(InitialValues.isFlow);
  const [imageToImageNode, setimageToImageNode] = useState(
    InitialValues.imageToImageNode
  );
  const [fluxLoraNode, setfluxLoraNode] = useState(InitialValues.fluxLoraNode);
  const [stableVideoNode, setstableVideoNode] = useState(
    InitialValues.stableVideoNode
  );
  const [trainFluxNode, settrainFluxNode] = useState(
    InitialValues.trainFluxNode
  );
  const [consistentCharacterNode, setconsistentCharacterNode] = useState(
    InitialValues.consistentCharacterNode
  );
  const [dreamShaperNode, setDreamShaperNode] = useState(
    InitialValues.dreamShaperNode
  );
  const [fluxGeneralNode, setFluxGeneralNode] = useState(
    InitialValues.fluxGeneralNode
  );
  const [fluxDevLoraNode, setFluxDevLoraNode] = useState(
    InitialValues.fluxDevLoraNode
  );
  const [workflowTemplate, setWorkFlowTemplate] = useState(
    InitialValues.workflowTemplate
  );
  const [videoToVideoNode, setvideoToVideoNode] = useState(
    InitialValues.videoToVideoNode
  );
  const [lunalabsImageToVideoNode, setlunalabsImageToVideoNode] = useState(
    InitialValues.lunalabsImageToVideoNode
  );
  const [lunalabsTextToVideoNode, setlunalabsTextToVideoNode] = useState(
    InitialValues.lunalabsTextToVideoNode
  );

  const addAINode = (id: string, type: string) => {
    if (type === "AI") {
      setAINode((prev) => ({
        ...prev,
        [id]: generateDefaultAINode(id),
      }));
    } else if (type === "flux-dev") {
      setfluxDevNode((prev) => ({
        ...prev,
        [id]: {
          id,
          model: "",
          output: "",
          prompt: "",
          image_size: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          num_images: 0,
          seed: 0,
          enable_safety_checker: false,
          sync_mode: false,
        },
      }));
    } else if (type === "image-to-image") {
      setimageToImageNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image_size: "",
          image_url: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          num_images: 0,
          seed: 0,
          enable_safety_checker: false,
          sync_mode: false,
          strength: 0,
        },
      }));
    } else if (type === "flux-lora") {
      setfluxLoraNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image_size: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          num_images: 0,
          seed: 0,
          enable_safety_checker: false,
          loras: [],
          sync_mode: false,
          output_format: "",
        },
      }));
    } else if (type === "stable-video") {
      setstableVideoNode((prev) => ({
        ...prev,
        [id]: {
          id,
          image_url: "",
          motion_bucket_id: "",
          fps: 0,
          cond_aug: false,
        },
      }));
    } else if (type === "train-flux") {
      settrainFluxNode((prev) => ({
        ...prev,
        [id]: {
          id,
          images_data_url: "",
          trigger_word: "",
          iter_multiplier: 0,
        },
      }));
    } else if (type === "consistent-character") {
      setconsistentCharacterNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          subject: "",
          negative_prompt: "",
          randomise_poses: false,
          number_of_outputs: 0,
          number_of_images_per_pose: 0,
          num_outputs: 0,
          output_format: "",
          disable_safety_checker: false,
          output_quality: 0,
        },
      }));
    } else if (type === "dreamShaper") {
      setDreamShaperNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image: "",
          negative_prompt: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          num_outputs: 0,
          scheduler: "",
          upscale: 0,
          strength: 0,
        },
      }));
    } else if (type === "fluxGeneral") {
      setFluxGeneralNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image_size: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          num_images: 0,
          seed: 0,
          sync_mode: false,
          enable_safety_checker: false,
        },
      }));
    } else if (type === "fluxDevLora") {
      setFluxDevLoraNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          hf_loras: [],
          num_outputs: 0,
          aspect_ratio: "",
          output_format: "",
          guidance_scale: 0,
          output_quality: "",
          num_inference_steps: 0,
        },
      }));
    } else if (type === "musicGen") {
      setmusicgenNode((prev) => ({
        ...prev,
        [id]: {
          prompt: "",
          id,
          seed: 0,
          top_k: 0,
          top_p: 0,
          duration: 0,
          input_audio: "",
          temperature: 0,
          continuation: false,
          model_version: "",
          output_format: "",
          continuation_start: 0,
          multi_band_diffusion: false,
          normalization_strategy: "",
          classifier_free_guidance: 0,
        },
      }));
    } else if (type === "CogVideoX-5B") {
      setCogVideoX5BNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          seed: 0,
          export_fps: 0,
          use_rife: false,
          negative_prompt: "",
        },
      }));
    } else if (type === "video-to-video") {
      setvideoToVideoNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          num_inference_steps: 0,
          guidance_scale: 0,
          seed: 0,
          export_fps: 0,
          video_url: "",
          strength: 0,
        },
      }));
    } else if (type === "lumalabs-ImageToVideo") {
      setlunalabsImageToVideoNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          start_frame_url: "",
          end_frame_url: "",
          aspect_ratio: "",
          loop: false,
        },
      }));
    } else if (type === "lumalabs-TextToVideo") {
      setlunalabsTextToVideoNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          aspect_ratio: "",
          loop: false,
        },
      }));
    }
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
    setOutput,
    setAINode,
    addAINode,
    triggerNode,
    setTriggerNode,
    chatNode,
    setChatNode,
    history,
    fluxDevNode,
    setfluxDevNode,
    imageToImageNode,
    setimageToImageNode,
    fluxLoraNode,
    setfluxLoraNode,
    stableVideoNode,
    setstableVideoNode,
    trainFluxNode,
    settrainFluxNode,
    consistentCharacterNode,
    setconsistentCharacterNode,
    dreamShaperNode,
    setDreamShaperNode,
    fluxGeneralNode,
    setFluxGeneralNode,
    fluxDevLoraNode,
    setFluxDevLoraNode,
    isFlow,
    setisFlow,
    musicgenNode,
    setmusicgenNode,
    CogVideoX5BNode,
    setCogVideoX5BNode,
    videoToVideoNode,
    setvideoToVideoNode,
    lunalabsImageToVideoNode,
    setlunalabsImageToVideoNode,
    lunalabsTextToVideoNode,
    setlunalabsTextToVideoNode,
  };

  return <Provider value={values}>{children}</Provider>;
};

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext);
  return { nodeConnection };
};
