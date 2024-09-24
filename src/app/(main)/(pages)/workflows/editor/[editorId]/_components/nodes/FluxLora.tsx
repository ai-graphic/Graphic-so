import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option, OutputType } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";


const fluxLoraNodeOptions : Option[]  = [
    { image_size: { placeholder: "Enter image size", type: "text" } },
    { num_inference_steps: { placeholder: 50, type: "number" } },
    { guidance_scale: { placeholder: 7.5, type: "number" } },
    { num_images: { placeholder: 1, type: "number" } },
    { seed: { placeholder: 42, type: "number" } },
    { enable_safety_checker: { placeholder: true, type: "checkbox" } },
    { loras: { placeholder: "Enter loras", type: "text" } },
    { sync_mode: { placeholder: true, type: "checkbox" } },
    { output_format: { placeholder: "Enter output format", type: "text" } },
  ];
  


const FluxLora =(nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const { nodeConnection } = useNodeConnections();
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    image_size: null,
    num_inference_steps: null,
    guidance_scale: null,
    num_images: null,
    seed: null,
    enable_safety_checker: null,
    loras: null,
    sync_mode: null,
    output_format: null,
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
                "flux-lora",
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
      {showOptions && fluxLoraNodeOptions.map((optionObj) => {
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
                  "flux-lora",
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

export default FluxLora;
