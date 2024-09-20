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

const AutoCaptionNodeOptions: Option[] = [
    { font: { placeholder: "Poppins/Poppins-ExtraBold.ttf", type: "text" } },
    { color: { placeholder: "white", type: "text" } },
    { kerning: { placeholder: -5, type: "number" } },
    { opacity: { placeholder: 0, type: "number" } },
    { MaxChars: { placeholder: 20, type: "number" } },
    { fontsize: { placeholder: 7, type: "number" } },
    { translate: { placeholder: false, type: "checkbox" } },
    { output_video: { placeholder: false, type: "checkbox" } },
    { stroke_color: { placeholder: "black", type: "text" } },
    { stroke_width: { placeholder: 2.6, type: "number" } },
    { right_to_left: { placeholder: false, type: "checkbox" } },
    { subs_position: { placeholder: "bottom75", type: "text" } },
    { highlight_color: { placeholder: "yellow", type: "text" } },
    { transcript_file_input: { placeholder: "", type: "text" } },
    { output_transcript: { placeholder: true, type: "checkbox" } },
];

const AutoCaption = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedurl, setSelectedurl] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [params, setParams] = React.useState<any>({
    video_file_input: null,
    motion_bucket_id: null,
    fps: null,
    cond_aug: null,
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
                ].video_file_input = getImage.data;
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
  console.log(loading);
  console.log(nodeConnectionType);
  console.log(nodeConnection);
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="block text-sm font-medium text-gray-300">
          Enter Your video Url Here
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            className="col-span-3"
            placeholder="Enter video Url"
            value={
              selectedurl ??
              nodeConnectionType.nodeConnectionType[selectedNode.id]?.video_file_input
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
                ].video_file_input = newValue;
              }
              onContentChange(
                state,
                nodeConnection,
                "autoCaption",
                event,
                "video_file_input"
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
                selectedurl == null ? `:video:` : `${selectedurl}:video:`;
              setSelectedurl(updatedOutput);
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
                      setSelectedurl(String(output));
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
      {showOptions && AutoCaptionNodeOptions.map((optionObj) => {
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
                  "autoCaption",
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

export default AutoCaption;
