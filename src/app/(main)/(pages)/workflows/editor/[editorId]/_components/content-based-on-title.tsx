"use client";

import { ConnectionProviderProps } from "@/providers/connections-providers";
import { EditorState, useEditor } from "@/providers/editor-provider";
import { nodeMapper } from "@/lib/types";
import { AccordionContent } from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import GoogleFileDetails from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/google-file-details";
import GoogleDriveFiles from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/google-drive-files";
import ActionButton from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/action-button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;

  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

interface GroupOption {
  [key: string]: Option[];
}

type Props = {
  nodeConnection: ConnectionProviderProps;
  newState: EditorState;
  file: any;
  setFile: (file: any) => void;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (value: Option[]) => void;
};
const ContentBasedOnTitle = ({
  nodeConnection,
  newState,
  file,
  setFile,
  selectedSlackChannels,
  setSelectedSlackChannels,
}: Props) => {
  const [showButtons, setShowButtons] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  console.log("btn", showButtons);
  const { state } = useEditor();

  const { selectedNode } = newState.editor;
  const title = selectedNode.data.title;
  const [model, setModel] = useState<string>("Select Model");
  const FluxOptions = [
    {
      locaModel: { placeholder: "alvdansen/frosting_lane_flux", type: "text" },
    },
    {
      ApiKey: {
        placeholder: "r8_BdC**********************************",
        type: "password",
      },
    },
    {
      prompt: {
        placeholder: "a beautiful castle frstingln illustration",
        type: "text",
      },
    },
    { num_outputs: { placeholder: 1, type: "number" } },
    { aspect_ratio: { placeholder: "1:1", type: "text" } },
    { output_format: { placeholder: "webp", type: "text" } },
    { guidance_scale: { placeholder: 3.5, type: "number" } },
    { output_quality: { placeholder: 80, type: "number" } },
    { num_inference_steps: { placeholder: 20, type: "number" } },
  ];
  const OpenaiOptions = [
    { locaModel: { placeholder: "gpt-3.5-turbo", type: "text" } },
    {
      ApiKey: {
        placeholder: "sk-proj-***************************************",
        type: "password",
      },
    },
    { prompt: { placeholder: "Enter your prompt", type: "text" } },
    { temperature: { placeholder: 0.7, type: "number" } },
    { max_tokens: { placeholder: 150, type: "number" } },
  ];
  // const LoraOptions = [
  //   { images: "A zip/tar file containing the images that will be used for training. File names must be their captions: a_photo_of_TOK.png, etc. Min 12 images required." },
  //   { locaModel: "defaultLoraModel" },
  //   { endpoint: "https://api.lora.example.com" },
  //   { ApiKey: "defaultLoraApiKey" },
  //   { model_name: "LoraModel" },
  //   { hf_token: "defaultHfToken" },
  //   { steps: "10" },
  //   { learning_rate: "0.01" },
  //   { batch_size: "8" },
  //   { resolution: "1024" },
  //   { lora_linear: "true" },
  //   { lora_linear_alpha: "0.1" },
  //   { repo_id: "defaultRepoId" },
  // ];
  interface Model {
    key: string;
    name: string;
  }
  useEffect(() => {
    // Check if the selectedNode has a model and update the state accordingly
    const nodeModel = nodeConnectionType[selectedNode.id]?.model;
    if (nodeModel) {
      setModel(nodeModel);
    } else {
      // Reset to default "Select Model" if the new node does not have a model
      setModel("Select Model");
    }

    const currentPrompt = nodeConnectionType[selectedNode.id]?.prompt;
    if (currentPrompt) {
      setSelectedOutput(currentPrompt);
    } else {
      // Reset selectedOutput if the new node does not have a prompt
      setSelectedOutput(null);
    }
  }, [selectedNode.id]);

  const [modelArray, setModelArray] = useState<Model[]>([]);

  useEffect(() => {
    if (selectedOutput) {
      const syntheticEvent = {
        target: { value: selectedOutput },
      } as React.ChangeEvent<HTMLInputElement>;
      onContentChange(state, nodeConnection, title, syntheticEvent, "prompt");
    }
  }, [selectedOutput]);

  const modelOptionsMap: { [key: string]: any[] } = {
    "FLUX-image": FluxOptions,
    Openai: OpenaiOptions,
    // "train-LORA": LoraOptions,
  };

  useEffect(() => {
    const reqGoogle = async () => {
      const response: { data: { message: { files: any } } } = await axios.get(
        "/api/drive"
      );
      if (response) {
        const firstThreeFiles = response.data.message.files.slice(0, 3);
        console.log(firstThreeFiles);
        toast.success("Files fetched successfully");
        setFile(firstThreeFiles); // Update state with the new files
      } else {
        toast.error("Something went wrong");
      }
    };
    reqGoogle();
  }, [setFile]); //
  const [selectedKey, setSelectedKey] = useState<string>("");

  //@ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]];
  console.log("Node Connection Type:", nodeConnectionType);
  if (!nodeConnectionType) return <p>Not connected</p>;

  useEffect(() => {
    const modelKey = nodeConnectionType[selectedNode.id]?.model;
    if (modelKey) {
      const modelValue = localStorage.getItem(modelKey) || "";
      const newModel = { key: modelKey, name: modelValue };
      setModelArray((prevArray) => {
        if (prevArray.some((model) => model.key === modelKey)) {
          return prevArray;
        }
        return [...prevArray, newModel];
      });
    }
  }, [nodeConnectionType, selectedNode.id]);
  console.log("Model Array:", modelArray);

  const isConnected =
    title === "Google Drive"
      ? !nodeConnection.isLoading
      : !!nodeConnectionType[
          `${
            title === "Slack"
              ? "slackAccessToken"
              : title === "Discord"
              ? "webhookURL"
              : title === "Notion"
              ? "accessToken"
              : ""
          }`
        ];

  return (
    <AccordionContent>
      <Card>
        {title === "Discord" && (
          <CardHeader>
            <CardTitle>{nodeConnectionType.webhookName}</CardTitle>
            <CardDescription>{nodeConnectionType.guildName}</CardDescription>
          </CardHeader>
        )}
        <div className="flex flex-col gap-3 px-6 py-3 pb-20">
          <p>
            {title === "Notion"
              ? "Values to be stored"
              : title === "Google Drive"
              ? ""
              : "Message"}
          </p>
          {title === "AI" ? (
            <div className="gap-2 flex flex-col">
              <p className="block text-sm font-medium text-gray-300">
                Select Your model
              </p>
              <select
                value={model}
                onChange={(event) => {
                  const newModel = event.target.value;
                  setModel(newModel);

                  onContentChange(
                    state,
                    nodeConnection,
                    title,
                    event as unknown as React.ChangeEvent<HTMLInputElement>,
                    "model"
                  );
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option disabled value="Select Model">
                  Select Model
                </option>
                <option value="Openai">Openai</option>
                <option value="FLUX-image">FLUX-image</option>
                {/* <option value="train-LORA">train-LORA</option> */}
              </select>
              <p className="block text-sm font-medium text-gray-300">
                Enter Your Prompt Here
              </p>
              <Input
                type="text"
                placeholder="a beautiful castle frstingln illustration"
                value={
                  selectedOutput ?? nodeConnectionType[selectedNode.id]?.prompt
                }
                onClick={() => {
                  setShowButtons((prev) => !prev);
                }}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setSelectedOutput(newValue);
                  onContentChange(
                    state,
                    nodeConnection,
                    title,
                    event,
                    "prompt"
                  );
                }}
              />
              {showButtons &&
                nodeConnection.aiNode.output &&
                state.editor.edges &&
                Object.entries(nodeConnection.aiNode.output)
                  .filter(([id]) =>
                    state.editor.edges.some(
                      (edge) =>
                        edge.target === selectedNode.id && edge.source === id
                    )
                  )
                  .map(
                    ([id, outputs]) =>
                      Array.isArray(outputs) &&
                      outputs.map((output, index) => (
                        <button
                          key={`${id}-${index}`}
                          className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          onClick={() => {
                            setSelectedOutput(String(output));
                            setShowButtons((prev) => !prev);
                          }}
                        >
                          {String(output)}
                        </button>
                      ))
                  )}

              <p className=" text-sm font-medium text-gray-300">
                Enter Your ApiKey Here
              </p>
              <div className="flex justify-center items-center gap-2">
                <Input
                  type="text"
                  placeholder="Click to select API Key"
                  value={
                    selectedKey ?? nodeConnectionType[selectedNode.id]?.apiKey
                  }
                  onChange={(event) => {
                    const newValue = event.target.value;
                    setSelectedKey(newValue);
                    onContentChange(
                      state,
                      nodeConnection,
                      title,
                      event,
                      "apiKey"
                    );
                  }}
                />

                {modelArray
                  .filter((modelObj) => modelObj.key === model)
                  .map((modelObj) => (
                    <button
                      key={modelObj.key}
                      className="bg-gray-500 hover:bg-gray-300 hover:text-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-xs"
                      onClick={() => {
                        console.log("model", modelObj);
                        nodeConnectionType[selectedNode.id].ApiKey =
                          modelObj.name;
                        setSelectedKey(modelObj.name);
                      }}
                    >
                      Load
                    </button>
                  ))}
              </div>
              {nodeConnectionType[selectedNode.id]?.model &&
                modelOptionsMap[nodeConnectionType[selectedNode.id].model]?.map(
                  (optionObj) => {
                    const optionKey = Object.keys(optionObj)[0];
                    const optionValue = optionObj[optionKey];
                    if (optionKey === "prompt" || optionKey === "ApiKey")
                      return null;

                    return (
                      <div key={optionKey}>
                        <p className="block text-sm font-medium text-gray-300">
                          Enter Your{" "}
                          {optionKey.charAt(0).toUpperCase() +
                            optionKey.slice(1)}{" "}
                          here
                        </p>
                        <Input
                          type={optionValue.type} // Use the type from the option object
                          placeholder={optionValue.placeholder} // Use placeholder from the option object
                          value={
                            nodeConnectionType[selectedNode.id]?.[optionKey] ||
                            ""
                          } // Add optional chaining and default value
                          onChange={(event) =>
                            onContentChange(
                              state,
                              nodeConnection,
                              title,
                              event,
                              optionKey
                            )
                          }
                        />
                      </div>
                    );
                  }
                )}
            </div>
          ) : title === "Google Drive" ? (
            <div></div>
          ) : (
            <Input
              type="text"
              value={nodeConnectionType.content}
              onClick={() => {
                setShowButtons((prev) => !prev);
              }}
              onChange={(event) =>
                onContentChange(state, nodeConnection, title, event, "content")
              }
            />
          )}

          {JSON.stringify(file) !== "{}" && title !== "Google Drive" && (
            <Card className="w-full">
              <CardContent className="px-2 py-3">
                <div className="flex flex-col gap-4">
                  <CardDescription>Drive File</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    <GoogleFileDetails
                      nodeConnection={nodeConnection}
                      title={title}
                      gFile={file}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {title === "Google Drive" && <GoogleDriveFiles />}
          <ActionButton
            currentService={title}
            nodeConnection={nodeConnection}
            channels={selectedSlackChannels}
            setChannels={setSelectedSlackChannels}
          />
        </div>
      </Card>
    </AccordionContent>
  );
};
export default ContentBasedOnTitle;
