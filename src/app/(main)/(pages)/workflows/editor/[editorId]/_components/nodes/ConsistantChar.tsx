import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/providers/connections-providers";
import { useEditor } from "@/providers/editor-provider";
import React from "react";

const consistentCharOptions : Option[] = [
    { prompt: { placeholder: "Enter your prompt", type: "text" } },
    { apiKey: { placeholder: "Enter API key", type: "text" } },
    { subject: { placeholder: "Enter subject", type: "text" } },
    { num_outputs: { placeholder: 1, type: "number" } },
    { negative_prompt: { placeholder: "Enter negative prompt", type: "text" } },
    { randomise_poses: { placeholder: false, type: "checkbox" } },
    { number_of_outputs: { placeholder: 1, type: "number" } },
    { disable_safety_checker: { placeholder: false, type: "checkbox" } },
    { number_of_images_per_pose: { placeholder: 1, type: "number" } },
    { output_format: { placeholder: "webp", type: "text" } },
    { output_quality: { placeholder: 80, type: "number" } },
  ];


const ConsistentChar =  (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  console.log("nodeConnectionType", nodeConnectionType);
  console.log(nodeConnection)
  return (
    <div className="flex flex-col gap-2">
      {consistentCharOptions.map((optionObj) => {
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
                  "consistent-character",
                  event,
                  optionKey
                );
              }}
            />
            {optionKey === "apiKey" && <div>dfgd</div>}
          </div>
        );
      })}
    </div>
  );
};

export default ConsistentChar;
