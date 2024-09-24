"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option, OutputType } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    stability: null,
    similarity_boost: null,
    style: null,
    voice: null,
  });
  const [voices, setVoices] = useState<Voice[]>([]);
  const [showOptions, setShowOptions] = React.useState<boolean>(false);

  const setoptions = (id: number) => {
    setShowButtons((prev) =>
      prev.map((bool, index) => (index === id ? !bool : bool))
    );
  };

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
      <div>
        <p className="block text-sm font-medium text-gray-300">
          Enter Your Prompt Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Extreme close-up of a single tiger eye, direct frontal view. Detailed iris and pupil. Sharp focus on eye texture and color. Natural lighting to capture authentic eye shine and depth. The word 'FLUX' is painted over it in big, white brush strokes with visible texture."
            value={
              selectedPrompt ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]?.prompt
            }
            onClick={() => {
              setoptions(0);
            }}
            onChange={(event) => {
              const newValue = event.target.value;
              setSelectedPrompt(newValue);
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[selectedNode.id].prompt =
                  newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "text-to-voice",
                event,
                "prompt"
              );
            }}
          />
          <Button
            onClick={() => {
              const updatedOutput =
                selectedPrompt == null ? `:input:` : `${selectedPrompt}:input:`;
              setSelectedPrompt(updatedOutput);
            }}
          >
            @tag
          </Button>
        </div>
        {showButtons[0] &&
          Object.entries(nodeConnection.output)
            .filter(([id]) =>
              state.editor.edges.some(
                (edge) => edge.target === selectedNode.id && edge.source === id
              )
            )
            .map(([id, outputs]) =>
              (["text"] as (keyof OutputType)[]).map((type) =>
                outputs[type]?.map((output, index) => (
                  <button
                    key={`${id}-${type}-${index}`}
                    className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      setSelectedPrompt(String(output));
                      setoptions(0);
                    }}
                  >
                    {String(output)}
                  </button>
                ))
              )
            )}
      </div>
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