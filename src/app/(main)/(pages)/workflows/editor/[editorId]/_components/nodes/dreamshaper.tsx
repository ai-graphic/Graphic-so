"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Prompt from "./_components/prompt";
import ImageUrl from "./_components/ImageUrl";
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
  const [params, setParams] = React.useState<any>({
    num_outputs: null,
    negative_prompt: null,
    strength: null,
    guidance_scale: null,
    scheduler: null,
    num_inference_steps: null,
    upscale: null,
  });
  const [showOptions, setShowOptions] = React.useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2">
      <Prompt
        nodeConnectionType={nodeConnectionType}
        title={nodeConnectionType.title}
      />
      <ImageUrl
        nodeConnectionType={nodeConnectionType}
        title={nodeConnectionType.title}
        url="image"
        type="image"
      />
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
        DreamShaperOptions.map((optionObj) => {
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
