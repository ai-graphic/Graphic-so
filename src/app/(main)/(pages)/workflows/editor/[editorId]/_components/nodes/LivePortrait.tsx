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


const liveDevNodeOption: Option[] = [
  { blink: { placeholder: 0, type: "number" } },
  { eyebrow: { placeholder: 0, type: "number" } },
  { wink: { placeholder: 0, type: "number" } },
  { pupil_x: { placeholder: 0, type: "number" } },
  { pupil_y: { placeholder: 0, type: "number" } },
  { aaa: { placeholder: 0, type: "number" } },
  { eee: { placeholder: 0, type: "number" } },
  { woo: { placeholder: 0, type: "number" } },
  { smile: { placeholder: 0, type: "number" } },
  { flag_lip_zero: { placeholder: false, type: "checkbox" } },
  { flag_stitching: { placeholder: false, type: "checkbox" } },
  { flag_relative: { placeholder: false, type: "checkbox" } },
  { flag_pasteback: { placeholder: false, type: "checkbox" } },
  { flag_do_crop: { placeholder: false, type: "checkbox" } },
  { flag_do_rot: { placeholder: false, type: "checkbox" } },
  { dsize: { placeholder: 0, type: "number" } },
  { scale: { placeholder: 1, type: "number" } },
  { vx_ratio: { placeholder: 1, type: "number" } },
  { vy_ratio: { placeholder: 1, type: "number" } },
  { batch_size: { placeholder: 1, type: "number" } },
  { enable_safety_checker: { placeholder: true, type: "checkbox" } },
];

const LivePortrait = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [params, setParams] = React.useState<any>({
    image_url:null,
    video_url:null,
  });
  const [showOptions, setShowOptions] = React.useState<boolean>(false);


  return (
    <div className="flex flex-col gap-2">

      <ImageUrl
        nodeConnectionType={nodeConnectionType}
        title={nodeConnectionType.title}
        url="image_url"
        type="image"
      />

      <ImageUrl nodeConnectionType={nodeConnectionType} title={nodeConnectionType.title} url="video_url" type="video"/>

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
        liveDevNodeOption.map((optionObj) => {
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
                    // TODO: i made this change
                    "live-portrait",
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

export default LivePortrait;
