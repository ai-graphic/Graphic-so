"use client";

import { ConnectionProviderProps } from "@/providers/connections-providers";
import { EditorState, useEditor } from "@/providers/editor-provider";
import { EditorNodeType, nodeMapper, OutputType } from "@/lib/types";
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
// import SuperAgent from "./nodes/superagent";
import { Button } from "@/components/ui/button";
import FluxDev from "./nodes/FluxDev";
import ImageToImage from "./nodes/ImageToImage";
import FluxLora from "./nodes/FluxLora";
import TrainFlux from "./nodes/TrainFlux";
import StableVideo from "./nodes/stableVideo";
import DreamShaper from "./nodes/dreamshaper";
import FluxGeneral from "./nodes/fluxGeneral";
import FluxDevLora from "./nodes/fluxDevLora";
import ConsistentChar from "./nodes/ConsistantChar";
import CogVideoX from "./nodes/CogVideoX-5B";
import MusicGen from "./nodes/MusicGen";
import VideoToVideo from "./nodes/videoToVideo";
import TextToVideo from "./nodes/lumalabs-text-video";
import ImageToVideo from "./nodes/lumalabs-img-video";

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
  nodes: EditorNodeType[];
  edges: any;
  nodeConnection: ConnectionProviderProps;
  newState: EditorState;
  file: any;
  setFile: (file: any) => void;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (value: Option[]) => void;
  setNodes: (nodes: EditorNodeType[]) => void;
  setEdges: (edges: any) => void;
};
const ContentBasedOnTitle = ({
  nodes,
  edges,
  nodeConnection,
  newState,
  file,
  setFile,
  selectedSlackChannels,
  setSelectedSlackChannels,
  setNodes,
  setEdges,
}: Props) => {
  const [showButtons, setShowButtons] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const { state } = useEditor();

  const { selectedNode } = newState.editor;
  const title = selectedNode.data.title;
  // const [model, setModel] = useState<string>("vercel");
  const [localModel, setLocalModel] = useState<string>("Claude");
  // const [showSuperAgent, setShowSuperAgent] = useState(false);

  const vercelOptions = [
    {
      localModel: {
        placeholder: "Enter your model",
        type: "select",
        options: ["vercel", "claude", "mistral"],
      },
    },
    { system: { placeholder: "Enter your system Message", type: "text" } },
    { prompt: { placeholder: "Enter your prompt", type: "text" } },
    { max_tokens: { placeholder: 100, type: "number" } },
    { temperature: { placeholder: 0.7, type: "number" } },
  ];
  // interface Model {
  //   key: string;
  //   name: string;
  // }

  // const [modelArray, setModelArray] = useState<Model[]>([]);

  useEffect(() => {
    if (selectedOutput) {
      const syntheticEvent = {
        target: { value: selectedOutput },
      } as React.ChangeEvent<HTMLInputElement>;
      onContentChange(state, nodeConnection, title, syntheticEvent, "prompt");
    }
  }, [selectedOutput]);

  const modelOptionsMap: { [key: string]: any[] } = {
    vercel: vercelOptions,
  };

  //@ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]];
  const [triggerValue, setTriggerValue] = useState(
    nodeConnectionType.triggerValue
  );

  useEffect(() => {
    // const nodeModel = nodeConnectionType[selectedNode.id]?.model;
    // if (nodeModel) {
    //   setModel(nodeModel);
    // } else {
    //   setModel("Select Model");
    // }

    const currentPrompt = nodeConnectionType[selectedNode.id]?.prompt;
    if (currentPrompt) {
      setSelectedOutput(currentPrompt);
    } else {
      setSelectedOutput(null);
    }
  }, [selectedNode.id, nodeConnectionType]);

  // useEffect(() => {
  //   const isSuperAgent =
  //     nodeConnectionType[selectedNode.id]?.model === "SuperAgent";
  //   setShowSuperAgent(isSuperAgent);
  // }, [selectedNode.id, nodeConnectionType]);

  const [ishistoryChecked, setHistory] = useState(
    nodeConnectionType[selectedNode.id]?.model &&
      nodeConnectionType[selectedNode.id]?.history
  );

  // useEffect(() => {
  //   const modelKey = nodeConnectionType[selectedNode.id]?.model;
  //   if (modelKey) {
  //     const modelValue = localStorage.getItem(modelKey) || "";
  //     const newModel = { key: modelKey, name: modelValue };
  //     setModelArray((prevArray) => {
  //       if (prevArray.some((model) => model.key === modelKey)) {
  //         return prevArray;
  //       }
  //       return [...prevArray, newModel];
  //     });
  //   }
  // }, [nodeConnectionType, selectedNode.id]);

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
              {/* <p className="block text-sm font-medium text-gray-300">
                Select your Provider here
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
                <option value="vercel">Vercel</option>
                <option value="FLUX-image">FLUX-image</option>
                <option value="SuperAgent">SuperAgent</option>
              </select> */}
              {/* {showSuperAgent && (
                <SuperAgent
                  node={nodeConnectionType}
                  ishistoryChecked={ishistoryChecked}
                />
              )} */}

              {nodeConnectionType[selectedNode.id]?.model && (
                <div>
                  <div>
                    <p className="block text-sm font-medium text-gray-300">
                      Select your model here
                    </p>
                    <select
                      value={nodeConnection.aiNode[selectedNode.id].localModel}
                      onChange={(event) => {
                        const newModel = event.target.value;
                        setLocalModel(newModel);

                        onContentChange(
                          state,
                          nodeConnection,
                          title,
                          event as unknown as React.ChangeEvent<HTMLInputElement>,
                          "localModel"
                        );
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="Openai">Openai</option>
                      <option value="Claude">Claude</option>
                    </select>
                  </div>
                  <div>
                    <p className="block text-sm font-medium text-gray-300">
                      Enter Your Prompt Here
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="a beautiful castle frstingln illustration"
                        value={
                          selectedOutput ??
                          nodeConnectionType[selectedNode.id]?.prompt
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
                      <Button
                        onClick={() => {
                          const updatedOutput =
                            selectedOutput == null
                              ? `:input:`
                              : `${selectedOutput}:input:`;
                          setSelectedOutput(updatedOutput);
                        }}
                      >
                        @tag
                      </Button>
                    </div>
                    {showButtons &&
                      Object.entries(nodeConnection.output)
                        .filter(([id]) =>
                          state.editor.edges.some(
                            (edge) =>
                              edge.target === selectedNode.id &&
                              edge.source === id
                          )
                        )
                        .map(([id, outputs]) =>
                          (["text"] as (keyof OutputType)[]).map((type) =>
                            outputs[type]?.map((output, index) => (
                              <button
                                key={`${id}-${type}-${index}`}
                                className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={() => {
                                  setSelectedOutput(String(output));
                                  setShowButtons((prev) => !prev);
                                }}
                              >
                                {String(output)}
                              </button>
                            ))
                          )
                        )}
                  </div>
                </div>
              )}

              {nodeConnectionType[selectedNode.id]?.model &&
                modelOptionsMap[nodeConnectionType[selectedNode.id].model]?.map(
                  (optionObj) => {
                    const optionKey = Object.keys(optionObj)[0];
                    const optionValue = optionObj[optionKey];
                    if (
                      optionKey === "prompt" ||
                      optionKey === "ApiKey" ||
                      optionKey === "localModel"
                    )
                      return null;

                    return (
                      <div key={optionKey}>
                        <p className="block text-sm font-medium text-gray-300">
                          Enter your {optionKey} here
                        </p>
                        <Input
                          type={optionValue.type}
                          placeholder={optionValue.placeholder}
                          value={
                            nodeConnectionType[selectedNode.id]?.[optionKey] ||
                            ""
                          }
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
          ) : title === "Trigger" ? (
            <div>
              <Input
                type="text"
                value={triggerValue ?? nodeConnectionType.triggerValue}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setTriggerValue(newValue);
                  onContentChange(
                    state,
                    nodeConnection,
                    title,
                    event,
                    "triggerValue"
                  );
                  nodeConnectionType.triggerValue = newValue;
                }}
              />
            </div>
          ) : title === "Slack" || title === "Notion" ? (
            <div>
              <Input
                type="text"
                value={selectedOutput ?? nodeConnectionType.content}
                onClick={() => {
                  setShowButtons((prev) => !prev);
                }}
                onChange={(event) => {
                  const newValue = event.target.value;
                  onContentChange(
                    state,
                    nodeConnection,
                    title,
                    event,
                    "content"
                  );
                  nodeConnectionType.content = newValue;
                }}
              />

              {showButtons &&
                Object.entries(nodeConnection.output)
                  .filter(([id]) =>
                    state.editor.edges.some(
                      (edge) =>
                        edge.target === selectedNode.id && edge.source === id
                    )
                  )
                  .map(([id, outputs]) =>
                    (["text"] as (keyof OutputType)[]).map((type) =>
                      outputs[type]?.map((output, index) => (
                        <button
                          key={`${id}-${type}-${index}`}
                          className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          onClick={() => {
                            setSelectedOutput(String(output));
                            setShowButtons((prev) => !prev);
                          }}
                        >
                          {String(output)}
                        </button>
                      ))
                    )
                  )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-lg underline">{title}</p>
              {title === "flux-dev" && (
                <FluxDev
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "image-to-image" && (
                <ImageToImage
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "flux-lora" && (
                <FluxLora
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "train-flux" && (
                <TrainFlux
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "stable-video" && (
                <StableVideo
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "CogVideoX-5B" && (
                <CogVideoX
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "musicGen" && (
                <MusicGen
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "consistent-character" && (
                <ConsistentChar
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "dreamShaper" && (
                <DreamShaper
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "fluxGeneral" && (
                <FluxGeneral
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "fluxDevLora" && (
                <FluxDevLora
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "video-to-video" && (
                <VideoToVideo
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "lunalabs-ImageToVideo" && (
                <ImageToVideo
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
              {title === "lunalabs-TextToVideo" && (
                <TextToVideo
                  nodeConnectionType={nodeConnectionType}
                  title={title}
                />
              )}
            </div>
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
            nodes={nodes}
            edges={edges}
            channels={selectedSlackChannels}
            setChannels={setSelectedSlackChannels}
            setNodes={setNodes}
            setEdges={setEdges}
          />
        </div>
      </Card>
    </AccordionContent>
  );
};
export default ContentBasedOnTitle;
