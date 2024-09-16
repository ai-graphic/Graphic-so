import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option, OutputType } from "@/lib/types";
import { useNodeConnections } from "@/providers/connections-providers";
import { useEditor } from "@/providers/editor-provider";
import React from "react";

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
  console.log(nodeConnection);
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setselectedPrompt] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const setoptions = (id: number) => {
    setShowButtons((prev) =>
      prev.map((bool, index) => (index === id ? !bool : bool))
    );
  };
  console.log(loading);
  console.log(nodeConnectionType);
  console.log(nodeConnection);
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
            placeholder="a beautiful castle frstingln illustration"
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
              console.log(newValue);
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[
                  selectedNode.id
                ].prompt = newValue;
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

      {cogvideoOptions.map((optionObj) => {
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