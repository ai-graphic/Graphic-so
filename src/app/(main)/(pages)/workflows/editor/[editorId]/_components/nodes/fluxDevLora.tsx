import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/providers/connections-providers";
import { useEditor } from "@/providers/editor-provider";
import React from "react";

const FluxDevLoraOptions : Option[] = [
    { prompt: { placeholder: "Enter your prompt", type: "text" } },
    { hf_loras: { placeholder: "Enter HF Loras", type: "text" }},
    { num_outputs: { placeholder: 1, type: "number" } },
    { aspect_ratio: { placeholder: "Enter aspect ratio", type: "text" } },
    { output_format: { placeholder: "Enter output format", type: "text" } },
    { guidance_scale: { placeholder: 7.5, type: "number" } },
    { output_quality: { placeholder: "Enter output quality", type: "text" } },
    { num_inference_steps: { placeholder: 50, type: "number" } },
  ];


const FluxDevLora =  (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();

  return (
    <div className="flex flex-col gap-2">
      {FluxDevLoraOptions.map((optionObj) => {
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
              onChange={(event) => {
                if (nodeConnectionType[selectedNode.id]) {
                  nodeConnectionType[selectedNode.id][optionKey] =
                    event.target.value;
                }
                onContentChange(
                  state,
                  nodeConnection,
                  "fluxDevLora",
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

export default FluxDevLora;
