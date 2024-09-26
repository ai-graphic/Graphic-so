import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Prompt from "./_components/prompt";

const TextToVideoNodeOptions: Option[] = [
  { aspect_ratio: { placeholder: "16:9", type: "text" } },
  { loop: { placeholder: false, type: "checkbox" } },
];

const TextToVideo = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    aspect_ratio: null,
    loop: null,
  });

  return (
    <div className="flex flex-col gap-2">
      <Prompt
        nodeConnectionType={nodeConnectionType}
        title={nodeConnectionType.title}
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
        TextToVideoNodeOptions.map((optionObj) => {
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
                    "lumalabs-TextToVideo",
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

export default TextToVideo;
