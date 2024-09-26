import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import { onContentChange } from "@/lib/editor-utils";
import React from "react";
import { Option, OutputType } from "@/lib/types";

type prop = {
  nodeConnectionType: any;
  title: string;
};

const Prompt = ({ nodeConnectionType, title }: prop) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>();
  const setoptions = (id: number) => {
    setShowButtons((prev) =>
      prev.map((bool, index) => (index === id ? !bool : bool))
    );
  };

  console.log(nodeConnectionType);

  return (
    <>
      <p className="block text-sm font-medium text-gray-300">
        Enter Your Prompt Here
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="a cat dressed as a wizard with a background of a mystic forest."
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
            onContentChange(state, nodeConnection, title, event, "prompt");
          }}
        />
        <Button
          onClick={() => {
            const updatedOutput =
              selectedPrompt == null ? `:input:` : `${selectedPrompt}:input:`;
            setSelectedPrompt(updatedOutput);
            if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
              nodeConnectionType.nodeConnectionType[selectedNode.id].prompt =
                updatedOutput;
            }
            const ArtificialEvent = { target: { value: updatedOutput } };
            onContentChange(
              state,
              nodeConnection,
              title,
              ArtificialEvent as unknown as React.ChangeEvent<HTMLInputElement>,
              "prompt"
            );
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
            (["text", "image", "video"] as (keyof OutputType)[]).map((type) =>
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
    </>
  );
};

export default Prompt;
