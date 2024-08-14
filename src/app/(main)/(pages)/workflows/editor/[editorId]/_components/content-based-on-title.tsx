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
import { use, useEffect, useState } from "react";
import { getFileMetaData } from "@/app/(main)/(pages)/connections/_actions/google-connections";
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
  // const [Template, setTemplate] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // const pathName = usePathname();
  const [showButtons, setShowButtons] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [model, setModel] = useState<string>("Select Model");
  const FluxOptions = [
    { locaModel: "alvdansen/frosting_lane_flux" },
    { ApiKey: "r8_BdC**********************************" },
    { prompt: "a beautiful castle frstingln illustration" },
    { num_outputs: 1 },
    { aspect_ratio: "1:1" },
    { output_format: "webp" },
    { guidance_scale: 3.5 },
    { output_quality: 80 },
    { num_inference_steps: 20 },
  ];
  const OpenaiOptions = [
    { locaModel: "gpt-3.5-turbo" },
    { ApiKey: "sk-proj-***************************************" },
    { prompt: "Enter your prompt" },
    { temperature: "0.7" },
    { max_tokens: "150" },
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
  const modelOptionsMap: { [key: string]: any[] } = {
    "FLUX-image": FluxOptions,
    Openai: OpenaiOptions,
    // "train-LORA": LoraOptions,
  };

  console.log("btn", showButtons);
  const { state } = useEditor();

  const { selectedNode } = newState.editor;
  const title = selectedNode.data.title;

  useEffect(() => {
    const reqGoogle = async () => {
      const response: { data: { message: { files: any } } } = await axios.get(
        "/api/drive"
      );
      if (response) {
        // Take only the first three files, if they exist
        const firstThreeFiles = response.data.message.files.slice(0, 3);
        console.log(firstThreeFiles);
        toast.success("Files fetched successfully");
        setFile(firstThreeFiles); // Update state with the new files
      } else {
        toast.error("Something went wrong");
      }
    };
    reqGoogle();
  }, []);

  //@ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]];
  console.log("Node Connection Type:", nodeConnectionType);
  if (!nodeConnectionType) return <p>Not connected</p>;

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
  useEffect(() => {
    if (selectedOutput) {
      const syntheticEvent = {
        target: { value: selectedOutput },
      } as React.ChangeEvent<HTMLInputElement>;
      onContentChange(state, nodeConnection, title, syntheticEvent, "prompt");
    }
  }, [selectedOutput]);

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
                value={selectedOutput ?? nodeConnectionType.prompt}
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
              {modelOptionsMap[model]?.map((optionObj) => {
                const optionKey = Object.keys(optionObj)[0];
                if (optionKey === "prompt") return null;

                return (
                  <div key={optionKey}>
                    <p className="block text-sm font-medium text-gray-300">
                      Enter Your{" "}
                      {optionKey.charAt(0).toUpperCase() + optionKey.slice(1)}{" "}
                      Here
                    </p>
                    <Input
                      type="text"
                      placeholder={optionObj[optionKey]} // Use placeholder for default values
                      value={nodeConnectionType[optionKey]}
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
              })}
            </div>
          ) : title === "Google Drive" ? (
            <div></div>
          ) : (
            <Input
              type="text"
              value={nodeConnectionType.content}
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
