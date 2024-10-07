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
  livePortraitNode: {
    [id: string]: {
      id: string;
      video_url: string;
      image_url: string;
      blink: number;
      eyebrow: number;
      wink: number;
      pupil_x: number;
      pupil_y: number;
      aaa: number;
      eee: number;
      woo: number;
      smile: number;
      flag_lip_zero: boolean;
      flag_stitching: boolean;
      flag_relative: boolean;
      flag_pasteback: boolean;
      flag_do_crop: boolean;
      flag_do_rot: boolean;
      dsize: number;
      scale: number;
      vx_ratio: number;
      vy_ratio: number;
      batch_size: number;
      enable_safety_checker: boolean;
    };
  },
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
      motion_bucket_id: number;
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
      output_quality: number;
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
      start_frame_url: string;
      end_frame_url: string;
      aspect_ratio: string;
      loop: boolean;
    };
  };
  lunalabsTextToVideoNode: {
    [id: string]: {
      id: string;
      prompt: string;
      aspect_ratio: string;
      loop: boolean;
    };
  };
  sadTalkerNode: {
    [id: string]: {
      id: string;
      source_image_url: string;
      driven_audio_url: string;
      face_model_resolution: string;
      expression_scale: number;
      face_enhancer: null | string;
      preprocess: string;
    };
  };
  autocaptionNode: {
    [id: string]: {
      id: string;
      font: string;
      color: string;
      kerning: number;
      opacity: number;
      MaxChars: number;
      fontsize: number;
      translate: boolean;
      output_video: boolean;
      stroke_color: string;
      stroke_width: number;
      right_to_left: boolean;
      subs_position: string;
      highlight_color: string;
      video_file_input: string;
      transcript_file_input: string;
      output_transcript: boolean;
    };
  };
  textToVoiceNode: {
    [id: string]: {
      id: string;
      prompt: string;
      voice: string;
      model_id: string;
      stability: number;
      similarity_boost: number;
      style: number;
    };
  };
  setTextToVoiceNode: React.Dispatch<React.SetStateAction<any>>;
  setTalkerNode: React.Dispatch<React.SetStateAction<any>>;
  setAutocaptionNode: React.Dispatch<React.SetStateAction<any>>;
  setvideoToVideoNode: React.Dispatch<React.SetStateAction<any>>;
  setlunalabsImageToVideoNode: React.Dispatch<React.SetStateAction<any>>;
  setlunalabsTextToVideoNode: React.Dispatch<React.SetStateAction<any>>;
  history: any;
  setCogVideoX5BNode: React.Dispatch<React.SetStateAction<any>>;
  setmusicgenNode: React.Dispatch<React.SetStateAction<any>>;
  setDreamShaperNode: React.Dispatch<React.SetStateAction<any>>;
  setFluxGeneralNode: React.Dispatch<React.SetStateAction<any>>;
  // TODO: added this node
  setLivePortraitNode:React.Dispatch<React.SetStateAction<any>>;
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
  livePortraitNode:{},
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

  workflowTemplate: {
    discord: "",
    notion: "",
    slack: "",
    ai: "",
  },
  history: {},
  CogVideoX5BNode: {},
  musicgenNode: {},
  videoToVideoNode: {},
  lunalabsImageToVideoNode: {},
  lunalabsTextToVideoNode: {},
  sadTalkerNode: {},
  autocaptionNode: {},
  textToVoiceNode: {},
  setTextToVoiceNode: () => undefined,
  setTalkerNode: () => undefined,
  setAutocaptionNode: () => undefined,
  setvideoToVideoNode: () => undefined,
  setlunalabsImageToVideoNode: () => undefined,
  setlunalabsTextToVideoNode: () => undefined,
  setOutput: () => undefined,
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
  //TODO: i added this
  setLivePortraitNode:() => undefined,
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
  tool: "",
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
  // i added this 
  const [livePortraitNode,setLivePortraitNode] = useState(InitialValues.livePortraitNode);
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
  const [sadTalkerNode, setTalkerNode] = useState(InitialValues.sadTalkerNode);
  const [autocaptionNode, setAutocaptionNode] = useState(
    InitialValues.autocaptionNode
  );
  const [textToVoiceNode, setTextToVoiceNode] = useState(
    InitialValues.textToVoiceNode
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
          image_size: "landscape_4_3",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          seed: 0,
          enable_safety_checker: false,
          sync_mode: false,
        },
      }));
    } 
    // todo : i added this 
    else if (type === "live-portrait") {
      setLivePortraitNode((prev) => ({
        ...prev,
        [id]: {
          id,
          video_url:"",
          image_url:"",
          blink:0,
          eyebrow:0,
          wink:0,
          pupil_x:0,
          pupil_y:0,
          aaa:0,
          eee:0,
          woo:0,
          smile:0,
          flag_lip_zero:true,
          flag_stitching:true,
          flag_relative:true,
          flag_pasteback:true,
          flag_do_crop:true,
          flag_do_rot:true,
          dsize:512,
          scale:2.3,
          vx_ratio:0,
          vy_ratio:-0.125,
          batch_size:32,
          enable_safety_checker:false,
        },
      }));
    } 
    else if (type === "image-to-image") {
      setimageToImageNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image_size: "",
          image_url: "",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          seed: 0,
          enable_safety_checker: false,
          sync_mode: false,
          strength: 0.95,
        },
      }));
    } else if (type === "flux-lora") {
      setfluxLoraNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image_size: "landscape_4_3",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          seed: 0,
          enable_safety_checker: false,
          loras: [],
          sync_mode: false,
          output_format: "jpeg",
        },
      }));
    } else if (type === "stable-video") {
      setstableVideoNode((prev) => ({
        ...prev,
        [id]: {
          id,
          image_url: "",
          motion_bucket_id: 127,
          fps: 25,
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
          iter_multiplier: 1,
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
          number_of_outputs: 1,
          number_of_images_per_pose: 1,
          num_outputs: 1,
          output_format: "webp",
          disable_safety_checker: false,
          output_quality: 80,
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
          num_inference_steps: 30,
          guidance_scale: 7.5,
          num_outputs: 1,
          scheduler: "EulerAncestralDiscrete",
          upscale: 2,
          strength: 0.5,
        },
      }));
    } else if (type === "fluxGeneral") {
      setFluxGeneralNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          image_size: "",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
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
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          guidance_scale: 3.5,
          output_quality: 3.5,
          num_inference_steps: 28,
        },
      }));
    } else if (type === "musicGen") {
      setmusicgenNode((prev) => ({
        ...prev,
        [id]: {
          prompt: "",
          id,
          seed: 42,
          top_k: 250,
          top_p: 0,
          duration: 8,
          input_audio: "",
          temperature: 1,
          continuation: false,
          model_version: "stereo-large",
          output_format: "mp3",
          continuation_start: 0,
          multi_band_diffusion: false,
          normalization_strategy: "peak",
          classifier_free_guidance: 3,
        },
      }));
    } else if (type === "CogVideoX-5B") {
      setCogVideoX5BNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          num_inference_steps: 50,
          guidance_scale: 7,
          seed: 0,
          export_fps: 30,
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
          num_inference_steps: 50,
          guidance_scale: 7,
          seed: 0,
          export_fps: 30,
          video_url: "",
          strength: 0.5,
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
          aspect_ratio: "16:9",
          loop: false,
        },
      }));
    } else if (type === "lumalabs-TextToVideo") {
      setlunalabsTextToVideoNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          aspect_ratio: "16:9",
          loop: false,
        },
      }));
    } else if (type === "sadTalker") {
      setTalkerNode((prev) => ({
        ...prev,
        [id]: {
          id,
          source_image_url: "",
          driven_audio_url: "",
          face_model_resolution: "256",
          expression_scale: 1,
          face_enhancer: null,
          preprocess: "crop",
        },
      }));
    } else if (type === "autoCaption") {
      setAutocaptionNode((prev) => ({
        ...prev,
        [id]: {
          id,
          font: "Poppins/Poppins-ExtraBold.ttf",
          color: "white",
          kerning: -5,
          opacity: 0,
          MaxChars: 20,
          fontsize: 7,
          translate: false,
          output_video: false,
          stroke_color: "black",
          stroke_width: 2.6,
          right_to_left: false,
          subs_position: "bottom75",
          highlight_color: "yellow",
          video_file_input: "",
          transcript_file_input: "",
          output_transcript: true,
        },
      }));
    } else if (type === "text-to-voice") {
      setTextToVoiceNode((prev) => ({
        ...prev,
        [id]: {
          id,
          prompt: "",
          voice: "Rachel",
          model_id: "eleven_multilingual_v2",
          stability: 0.1,
          similarity_boost: 0.2,
          style: 0.3,
        },
      }));
    };
  }

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
    //TODO: i added this 
    livePortraitNode,
    setLivePortraitNode,
    //
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
    sadTalkerNode,
    setTalkerNode,
    autocaptionNode,
    setAutocaptionNode,
    textToVoiceNode,
    setTextToVoiceNode,
  };

  return <Provider value={values}>{children}</Provider>;
};

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext);
  return { nodeConnection };
};
