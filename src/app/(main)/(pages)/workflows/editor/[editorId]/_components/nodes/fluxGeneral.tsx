import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/providers/connections-providers";
import { useEditor } from "@/providers/editor-provider";
import React from "react";


const fluxGeneralOptions : Option[] = [
  { prompt: { placeholder: "Enter your prompt", type: "text" } },
  { image_size: { placeholder: "Enter image size", type: "text" } },
  { num_inference_steps: { placeholder: 50, type: "number" } },
  { guidance_scale: { placeholder: 7.5, type: "number" } },
  { num_images: { placeholder: 1, type: "number" } },
  { enable_safety_checker: { placeholder: true, type: "checkbox" } },
  { seed: { placeholder: 42, type: "number" } },
  { sync_mode: { placeholder: true, type: "checkbox" } },
];

const FluxGeneral =  (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  console.log("nodeConnectionType", nodeConnectionType);
  console.log(nodeConnection)
  return (
    <div className="flex flex-col gap-2">
      {fluxGeneralOptions.map((optionObj) => {
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
                  "fluxGeneral",
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

export default FluxGeneral;