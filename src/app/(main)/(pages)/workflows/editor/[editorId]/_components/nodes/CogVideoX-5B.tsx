import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option, OutputType } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const cogvideoOptions: Option[] = [
  { num_inference_steps: { placeholder: 50, type: "number" } },
  { guidance_scale: { placeholder: 7, type: "number" } },
  { negative_prompt: { placeholder: "Enter negative prompt", type: "text" } },
  { use_rife: { placeholder: true, type: "checkbox" } },
  { export_fps: { placeholder: 30, type: "number" } },
];

const CogVideoX = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setselectedPrompt] = React.useState<string | null>();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    num_inference_steps: null,
    guidance_scale: null,
    negative_prompt: null,
    use_rife: null,
    export_fps: null,
  });

  const setoptions = (id: number) => {
    setShowButtons((prev) =>
      prev.map((bool, index) => (index === id ? !bool : bool))
    );
  };
  
  
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="block text-sm font-medium text-gray-300">
          Enter Your prompt Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            className="col-span-3"
            placeholder="A garden comes to life as a kaleidoscope of butterflies flutters amidst the blossoms, their delicate wings casting shadows on the petals below. In the background, a grand fountain cascades water with a gentle splendor, its rhythmic sound providing a soothing backdrop. Beneath the cool shade of a mature tree, a solitary wooden chair invites solitude and reflection, its smooth surface worn by the touch of countless visitors seeking a moment of tranquility in nature's embrace."
            value={
              selectedPrompt ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]?.prompt
            }
            onClick={() => {
              setoptions(1);
            }}
            onChange={(event) => {
              const newValue = event.target.value;
              setselectedPrompt(newValue);
              
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[selectedNode.id].prompt =
                  newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "CogvideoX-5B",
                event,
                "prompt"
              );
            }}
          />

          <Button
            onClick={() => {
              const updatedOutput =
                selectedPrompt == null ? `:image:` : `${selectedPrompt}:image:`;
              setselectedPrompt(updatedOutput);
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
              (["image"] as (keyof OutputType)[]).map((type) =>
                outputs[type]?.map((output, index) => (
                  <button
                    key={`${id}-${type}-${index}`}
                    className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      setselectedPrompt(String(output));
                      setoptions(0);
                    }}
                  >
                    <video
                      src={String(output)}
                      autoPlay
                      width={20}
                      height={20}
                    />
                  </button>
                ))
              )
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
      {showOptions && cogvideoOptions.map((optionObj) => {
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
                  "CogvideoX-5B",
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

export default CogVideoX;
