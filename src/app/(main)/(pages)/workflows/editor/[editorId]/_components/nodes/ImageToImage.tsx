import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Option, OutputType } from "@/lib/types";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

const imageToImageNodeOptions: Option[] = [
  { image_size: { placeholder: "Enter image size", type: "text" } },
  { num_inference_steps: { placeholder: 50, type: "number" } },
  { guidance_scale: { placeholder: 7.5, type: "number" } },
  { num_images: { placeholder: 1, type: "number" } },
  { seed: { placeholder: 42, type: "number" } },
  { enable_safety_checker: { placeholder: true, type: "checkbox" } },
  { sync_mode: { placeholder: true, type: "checkbox" } },
  { strength: { placeholder: 0.75, type: "number" } },
];

const ImageToImage = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>();
  const [selectedurl, setSelectedurl] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    image_size: null,
    num_inference_steps: null,
    guidance_scale: null,
    num_images: null,
    seed: null,
    enable_safety_checker: null,
    sync_mode: null,
    strength: null,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const funcImage = async () => {
            try {
              const getImage = await axios.post("/api/upload", {
                image: reader.result,
              });
              setSelectedurl(getImage.data);
              if (
                nodeConnectionType.nodeConnectionType[selectedNode.id] &&
                getImage.data
              ) {
                nodeConnectionType.nodeConnectionType[
                  selectedNode.id
                ].image_url = getImage.data;
              }
            } catch (error) {
              toast.error("Error uploading image");
            } finally {
              setLoading(false);
            }
          };
          funcImage();
        } catch (error) {
          toast.error("Error uploading image");
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setLoading(false);
    }
  };

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
              onContentChange(
                state,
                nodeConnection,
                "image-to-image",
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
        <p className="block text-sm font-medium text-gray-300">
          Enter Your image Url Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            className="col-span-3"
            placeholder="Enter your Image Url here"
            value={
              selectedurl ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]?.image_url
            }
            onClick={() => {
              setoptions(1);
            }}
            onChange={(event) => {
              const newValue = event.target.value;
              setSelectedurl(newValue);
              console.log(newValue);
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[
                  selectedNode.id
                ].image_url = newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "image-to-image",
                event,
                "image_url"
              );
            }}
          />

          <div>
            <label className="cursor-pointer inline-block">
              <Button asChild>
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                ) : (
                  <span>Upload</span>
                )}
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          </div>

          <Button
            onClick={() => {
              const updatedOutput =
                selectedurl == null ? `:image:` : `${selectedurl}:image:`;
              setSelectedurl(updatedOutput);
            }}
          >
            @tag
          </Button>
        </div>
        {showButtons[1] &&
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
                    className="border-2 z-20000 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      setSelectedurl(String(output));
                      setoptions(0);
                    }}
                  >
                    <img src={String(output)} width={200} alt="options" />
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
      {showOptions && imageToImageNodeOptions.map((optionObj) => {
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
                  "image-to-image",
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

export default ImageToImage;
