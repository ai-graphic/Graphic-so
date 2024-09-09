import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/providers/connections-providers";
import { useEditor } from "@/providers/editor-provider";
import React from "react";


const stableVideoNodeOptions : Option[]  = [
    { image_url: { placeholder: "Enter image URL", type: "text" } },
    { motion_bucket_id: { placeholder: "Enter motion bucket ID", type: "text" } },
    { fps: { placeholder: 30, type: "number" } },
    { cond_aug: { placeholder: true, type: "checkbox" } },
  ];

const StableVideo = (nodeConnectionType: any, title: string) => {
    const { selectedNode } = useEditor().state.editor;
    const { state } = useEditor();
    const { nodeConnection } = useNodeConnections();
  
    return (
      <div className="flex flex-col gap-2">
        {stableVideoNodeOptions.map((optionObj) => {
          const optionKey = Object.keys(optionObj)[0];
          const optionValue = optionObj[optionKey];
  
          return (
            <div  key={optionKey}>
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
                  "stable-video",
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

export default StableVideo;
