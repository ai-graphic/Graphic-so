import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNodeConnections } from "@/hooks/connections-providers";
import { useEditor } from "@/hooks/editor-provider";
import { onContentChange } from "@/lib/editor-utils";
import React from "react";
import { Option, OutputType } from "@/lib/types";
import axios from "axios";
import { toast } from "sonner";
import ContentViewer from "../../ContentViewer";

type prop = {
  nodeConnectionType: any;
  title: string;
  url: string;
  type: string;
};

const ImageUrl = ({ nodeConnectionType, title, url, type }: prop) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [showButtons, setShowButtons] = React.useState<boolean[]>([
    false,
    false,
  ]);
  const [selectedurl, setSelectedurl] = React.useState<string | null>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const setoptions = (id: number) => {
    setShowButtons((prev) =>
      prev.map((bool, index) => (index === id ? !bool : bool))
    );
  };

  console.log(nodeConnectionType);
  console.log(url, "url", title, "title");

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
                nodeConnectionType.nodeConnectionType[selectedNode.id][url] =
                  getImage.data;
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

  return (
    <>
      <p className="block text-sm font-medium text-gray-300">
        Enter Your {url} Here
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          className="col-span-3"
          placeholder="Enter your Image Url here"
          value={
            selectedurl ??
            nodeConnectionType.nodeConnectionType[selectedNode.id]?.[url]
          }
          onClick={() => {
            setoptions(1);
          }}
          onChange={(event) => {
            const newValue = event.target.value;
            setSelectedurl(newValue);
            console.log(newValue);
            if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
              nodeConnectionType.nodeConnectionType[selectedNode.id][url] =
                newValue;
            }
            onContentChange(state, nodeConnection, title, event, url);
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
              accept={`${type}/*`}
            />
          </label>
        </div>

        <Button
          onClick={() => {
            const updatedOutput =
              selectedurl == null ? `:image:` : `${selectedurl}:image:`;
            setSelectedurl(updatedOutput);
            if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
              nodeConnectionType.nodeConnectionType[selectedNode.id][url] =
                updatedOutput;
            }
            const ArtificialEvent = { target: { value: updatedOutput } };
            onContentChange(
              state,
              nodeConnection,
              title,
              ArtificialEvent as unknown as React.ChangeEvent<HTMLInputElement>,
              url
            );
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
      {nodeConnectionType.nodeConnectionType[selectedNode.id][url] && (
        <div className="h-30 w-30">
          <ContentViewer
            url={nodeConnectionType.nodeConnectionType[selectedNode.id][url]}
          />
        </div>
      )}
    </>
  );
};

export default ImageUrl;
