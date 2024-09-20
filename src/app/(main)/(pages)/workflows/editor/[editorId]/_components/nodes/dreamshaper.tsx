"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option, OutputType } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import axios from "axios";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { string } from "zod";

const DreamShaperOptions: Option[] = [
  { num_outputs: { placeholder: 1, type: "number" } },
  { negative_prompt: { placeholder: "Enter negative prompt", type: "text" } },
  { strength: { placeholder: 0.5, type: "number" } },
  { guidance_scale: { placeholder: 7.5, type: "number" } },
  { scheduler: { placeholder: "EulerAncestralDiscrete", type: "text" } },
  { num_inference_steps: { placeholder: 30, type: "number" } },
  { upscale: { placeholder: 2, type: "number" } },
];

const DreamShaper = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>();
  const [selectedurl, setSelectedurl] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    num_outputs: null,
    negative_prompt: null,
    strength: null,
    guidance_scale: null,
    scheduler: null,
    num_inference_steps: null,
    upscale: null,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const funcImage = async () => {
            try {
              const getImage = await axios.post("/api/upload", {
                image: reader.result,
              });
              setSelectedurl(getImage.data);
              if (
                nodeConnectionType.nodeConnectionType[selectedNode.id] &&
                getImage.data
              ) {
                nodeConnectionType.nodeConnectionType[selectedNode.id].image =
                  getImage.data;
              }
            } catch (error) {
              toast.error("Error uploading image");
            } finally {
              setLoading(false);
            }
          };
          funcImage();
        } catch (error) {
          toast.error("Error uploading image");
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setLoading(false);
    }
  };

  const setoptions = (id: number) => {
    setShowButtons((prev) =>
      prev.map((bool, index) => (index === id ? !bool : bool))
    );
  };
  console.log(loading);
  console.log(nodeConnectionType);
  console.log(nodeConnection)
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="block text-sm font-medium text-gray-300">
          Enter Your Prompt Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Photo of a lone astronaut standing on a barren planet, looking up at the stars, surrounded by remnants of a destroyed spaceship. Deep blue filter, harsh shadows, intense stare, gritty texture, captured by a Sony Alpha 7S III camera."
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
                "dreamShaper",
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
        <p className="block text-sm font-medium text-gray-300">
          Enter Your image Url Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            className="col-span-3"
            placeholder="Enter your link here"
            value={
              selectedurl ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]?.image
            }
            onClick={() => {
              setoptions(1);
            }}
            onChange={(event) => {
              const newValue = event.target.value;
              setSelectedurl(newValue);
              console.log(newValue)
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[selectedNode.id].image =
                  newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "dreamShaper",
                event,
                "image"
              );
            }}
          />

          <div>
            <label className="cursor-pointer inline-block">
              <Button asChild>
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                ) : (
                  <span>Upload</span>
                )}
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          </div>

          <Button
            onClick={() => {
              const updatedOutput =
                selectedurl == null ? `:image:` : `${selectedurl}:image:`;
              setSelectedurl(updatedOutput);
            }}
          >
            @tag
          </Button>
        </div>
        {showButtons[1] &&
          Object.entries(nodeConnection.output)
            .filter(([id]) =>
              state.editor.edges.some(
                (edge) => edge.target === selectedNode.id && edge.source === id
              )
            )
            .map(([id, outputs]) =>
              (["image"] as (keyof OutputType)[]).map((type) =>
                outputs[type]?.map((output, index) => (
                  <button
                    key={`${id}-${type}-${index}`}
                    className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      setSelectedurl(String(output));
                      setoptions(0);
                    }}
                  >
                    <img src={String(output)} alt="options" />
                  </button>
                ))
              )
            )}
      </div>

      {DreamShaperOptions.map((optionObj) => {
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
                  "dreamShaper",
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

export default DreamShaper;
