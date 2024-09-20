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

const SadTalkerOptions: Option[] = [
  { face_model_resolution: { placeholder: "512", type: "text" } },
  { expression_scale: { placeholder: 2, type: "number" } },
  { face_enhancer: { placeholder: "default", type: "text" } },
  { preprocess: { placeholder: "crop", type: "text" } },
];

const SadTalker = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedImage, setselectedImage] = React.useState<string | null>();
  const [selectedAudio, setselectedAudio] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    num_outputs: null,
    negative_source_image_url: null,
    randomise_poses: null,
    number_of_outputs: null,
    disable_safety_checker: null,
    number_of_images_per_pose: null,
    output_format: null,
    output_quality: null,
  });
  const [showOptions, setShowOptions] = React.useState<boolean>(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
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
              if (type === "image") {
                setselectedImage(getImage.data);
                if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                  nodeConnectionType.nodeConnectionType[
                    selectedNode.id
                  ].source_image_url = getImage.data;
                }
              } else if (type === "audio") {
                setselectedAudio(getImage.data);
                if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                  nodeConnectionType.nodeConnectionType[
                    selectedNode.id
                  ].driven_audio_url = getImage.data;
                }
              }
            } catch (error) {
              toast.error("Error uploading file");
            } finally {
              setLoading(false);
            }
          };
          funcImage();
        } catch (error) {
          toast.error("Error uploading file");
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
          Enter Your source_image_url Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="A closeup headshot photo of a young woman in a grey sweater"
            value={
              selectedImage ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]
                ?.source_image_url
            }
            onClick={() => {
              setoptions(0);
            }}
            onChange={(event) => {
              const newValue = event.target.value;
              setselectedImage(newValue);
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[
                  selectedNode.id
                ].source_image_url = newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "sadTalker",
                event,
                "source_image_url"
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
                onChange={(event) => handleFileChange(event, "image")}
                accept="image/*"
              />
            </label>
          </div>

          <Button
            onClick={() => {
              const updatedOutput =
                selectedImage == null ? `:input:` : `${selectedImage}:input:`;
              setselectedImage(updatedOutput);
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
                      setselectedImage(String(output));
                      setoptions(0);
                    }}
                  >
                    {String(output)}
                  </button>
                ))
              )
            )}
        <p className="block text-sm font-medium text-gray-300">
          Enter Your Audio Url Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            className="col-span-3"
            placeholder="Enter Your Audio Url Here"
            value={
              selectedAudio ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]
                ?.driven_audio_url
            }
            onClick={() => {
              setoptions(1);
            }}
            onChange={(event) => {
              const newValue = event.target.value;
              setselectedAudio(newValue);
              console.log(newValue);
              if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                nodeConnectionType.nodeConnectionType[
                  selectedNode.id
                ].driven_audio_url = newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "sadTalker",
                event,
                "driven_audio_url"
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
                onChange={(event) => handleFileChange(event, "audio")}
                accept="audio/*"
              />
            </label>
          </div>

          <Button
            onClick={() => {
              const updatedOutput =
                selectedAudio == null ? `:image:` : `${selectedAudio}:image:`;
              setselectedAudio(updatedOutput);
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
                    className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      setselectedAudio(String(output));
                      setoptions(0);
                    }}
                  >
                    <img src={String(output)} alt="options" />
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
      {showOptions &&
        SadTalkerOptions.map((optionObj) => {
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
                    "sadTalker",
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

export default SadTalker;
