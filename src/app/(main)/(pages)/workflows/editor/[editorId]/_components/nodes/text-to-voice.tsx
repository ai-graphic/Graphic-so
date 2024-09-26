"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import Prompt from "./_components/prompt";

interface Voice {
    name: string;
    preview_url: string;
  }  

const TextToVoiceNodeOption: Option[] = [
  { stability: { placeholder: "Enter stability", type: "number" } },
  {
    similarity_boost: { placeholder: "Enter similarity boost", type: "number" },
  },
  { style: { placeholder: "Enter style", type: "text" } },
];

const TextToVoice = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [params, setParams] = React.useState<any>({
    stability: null,
    similarity_boost: null,
    style: null,
    voice: null,
  });
  const [voices, setVoices] = useState<Voice[]>([]);
  const [showOptions, setShowOptions] = React.useState<boolean>(false);


  useEffect(() => {
    axios
      .get("https://api.elevenlabs.io/v1/voices")
      .then((response) => {
        setVoices(response.data.voices);
      })
      .catch((error) => {
        toast.error("Failed to fetch voices");
      });
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Prompt nodeConnectionType={nodeConnectionType} title={nodeConnectionType.title} />
      <div className="flex flex-col gap-2">
        <label
          htmlFor="voice-select"
          className="block text-sm font-medium text-gray-300"
        >
          Select Voice
        </label>
        <select
          id="voice-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={
            params.voice ??
            nodeConnectionType.nodeConnectionType[selectedNode.id]?.voice
          }
          onChange={(event) => {
            setParams((prevParams: any) => ({
              ...prevParams,
              voice: event.target.value,
            }));
            if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
              nodeConnectionType.nodeConnectionType[selectedNode.id].voice =
                event.target.value;
            }
            onContentChange(
              state,
              nodeConnection,
              "text-to-voice",
              event as unknown as React.ChangeEvent<HTMLInputElement>,
              "voice"
            );
          }}
        >
          <option value="Rachel">Rachel</option>
          {voices.map((voice: any) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
        {(params.voice ||
          nodeConnectionType.nodeConnectionType[selectedNode.id]?.voice) && (
          <div className="mt-4">
            {voices.find(
              (v: any) => v.name === nodeConnectionType.nodeConnectionType[selectedNode.id]?.voice
            ) && (
              <audio src={voices.find((v: any) => v.name === nodeConnectionType.nodeConnectionType[selectedNode.id]?.voice)?.preview_url} controls />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-2">
        <p className="whitespace-nowrap">Additional Settings</p>
        <hr className=" w-full mx-1 border-gray-300" />
        <Button
          variant="outline"
          onClick={() => setShowOptions((prev) => !prev)}
          className=" whitespace-nowrap  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {showOptions ? (
            <p className="flex gap-1 justify-center items-center">
              Show less <ChevronUp />
            </p>
          ) : (
            <p className="flex gap-1 justify-center items-center">
              Show more <ChevronDown />
            </p>
          )}
        </Button>
      </div>

      {showOptions &&
        TextToVoiceNodeOption.map((optionObj) => {
          const optionKey = Object.keys(optionObj)[0];
          const optionValue = optionObj[optionKey];

          return (
            <div key={optionKey}>
              <p className="block text-sm font-medium text-gray-300">
                Enter Your{" "}
                {optionKey.charAt(0).toUpperCase() + optionKey.slice(1)} here
              </p>
              <Input
                type={optionValue.type}
                placeholder={
                  optionValue.placeholder
                    ? optionValue.placeholder.toString()
                    : ""
                }
                value={
                  params[optionKey] ??
                  nodeConnectionType.nodeConnectionType[selectedNode.id]?.[
                    optionKey
                  ]
                }
                onChange={(event) => {
                  setParams((prevParams: any) => ({
                    ...prevParams,
                    [optionKey]: event.target.value,
                  }));
                  if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                    nodeConnectionType.nodeConnectionType[selectedNode.id][
                      optionKey
                    ] = event.target.value;
                  }
                  onContentChange(
                    state,
                    nodeConnection,
                    "text-to-voice",
                    event,
                    optionKey
                  );
                }}
              />
            </div>
          );
        })}
    </div>
  );
};

export default TextToVoice;
