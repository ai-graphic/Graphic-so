import { EditorCanvasCardType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { use, useEffect, useMemo, useState } from "react";
import { Position, SelectionMode, useNodeId } from "@xyflow/react";
import EditorCanvasIconHelper from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas-icon-helper";
import CustomHandle from "./custom-handle";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";
import { useNodeConnections } from "@/providers/connections-providers";
import { useLoading } from "@/providers/loading-provider";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import { Button } from "@/components/ui/button";
import { Icon, MousePointerClickIcon, TableRowsSplitIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkflow } from "@/providers/workflow-providers";
import { useBilling } from "@/providers/billing-provider";
import { set } from "zod";

type Props = {};
type LatestOutputsType = {
  [key: string]: string;
};

const EditorCanvasCardSingle = ({ data }: { data: EditorCanvasCardType }) => {
  const { dispatch, state } = useEditor();
  const nodeId = useNodeId();
  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />;
  }, [data]);
  const { isLoading, setIsLoading } = useLoading();
  const { nodeConnection } = useNodeConnections();
  const { credits, setCredits } = useBilling();
  const [isSelected, setIsSelected] = useState(false);
  const [triggerValue, setTriggerValue] = useState(
    nodeConnection.triggerNode.triggerValue
  );
  const pathname = usePathname();
  const [output, setOutput] = useState<any>("");
  type OutputType = {
    [key: string]: any;
  };

  useEffect(() => {
    setIsSelected(state.editor.selectedNode?.id === nodeId);
  }, [state.editor.selectedNode?.id]);

  useEffect(() => {
    const outputsObject = nodeConnection.output as OutputType;
    if (nodeId != null && outputsObject && outputsObject[nodeId]) {
      setOutput(outputsObject[nodeId]);
    }
  }, [nodeConnection.output, nodeId]);
  const { runWorkFlow } = useWorkflow();

  return (
    <>
      {data.type !== "Trigger" && data.type !== "Google Drive" && (
        <CustomHandle
          type="target"
          position={Position.Top}
          style={{ zIndex: 100 }}
        />
      )}
      <Card
        onClick={(e) => {
          e.stopPropagation();
          const val = state.editor.elements.find((n) => n.id === nodeId);
          if (val)
            dispatch({
              type: "SELECTED_ELEMENT",
              payload: {
                element: val,
              },
            });
        }}
        style={{
          position: "relative",
          maxWidth: "400px",
          borderRadius: "1rem",
          boxShadow: isLoading[nodeId ?? ""]
            ? "0 10px 15px rgba(234, 179, 8, 0.5)"
            : "",
        }}
        className={clsx(
          "react-flow__node-turbo border-2  dark:border-gray-700",
          {
            selected: isSelected && !isLoading[nodeId ?? ""], // Add this line
          }
        )}
      >
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <div>{logo}</div>
            <div>
              <CardTitle className="py-2">{data.title}</CardTitle>
              <CardDescription>
                <p className="text-xs text-muted-foreground/50">
                  <b className="text-muted-foreground/80">ID: </b>
                  {nodeId}
                </p>
                <p>{data.description}</p>
              </CardDescription>
            </div>
          </div>

          {data.title === "Trigger" ? (
            <div className="flex gap-2 bg-transparent">
              <Input
                type="text"
                className="bg-transparent border border-gray-600"
                value={nodeConnection.triggerNode.triggerValue ?? triggerValue}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setTriggerValue(newValue);
                  onContentChange(
                    state,
                    nodeConnection,
                    data.title,
                    event,
                    "triggerValue"
                  );
                  nodeConnection.triggerNode.triggerValue = newValue;
                }}
              />
              <Button
                onClick={() => {
                  nodeConnection.setOutput((prev: any) => ({
                    ...prev,
                    ...(prev.output || {}),
                    [nodeId ?? ""]: {
                      image: [...(prev.output?.[nodeId ?? ""]?.image || [])],
                      text: [
                        ...(prev.output?.[nodeId ?? ""]?.text || []),
                        nodeConnection.triggerNode.triggerValue,
                      ],
                      video: [...(prev.output?.[nodeId ?? ""]?.video || [])],
                    },
                  }));
                }}
                variant="outline"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  runWorkFlow(
                    pathname.split("/").pop()!,
                    nodeConnection,
                    setIsLoading,
                    credits,
                    setCredits
                  );
                }}
                variant="outline"
              >
                <MousePointerClickIcon className="flex-shrink-0 " size={20} />
              </Button>
            </div>
          ) : isLoading[nodeId ?? ""] &&
            (nodeConnection.aiNode[nodeId ?? ""] ||
              nodeConnection.fluxDevLoraNode[nodeId ?? ""] ||
              nodeConnection.fluxGeneralNode[nodeId ?? ""] ||
              nodeConnection.fluxDevNode[nodeId ?? ""] ||
              nodeConnection.consistentCharacterNode[nodeId ?? ""] ||
              nodeConnection.fluxLoraNode[nodeId ?? ""] ||
              nodeConnection.dreamShaperNode[nodeId ?? ""] ||
              nodeConnection.imageToImageNode[nodeId ?? ""] ||
              nodeConnection.stableVideoNode[nodeId ?? ""] ||
              nodeConnection.trainFluxNode[nodeId ?? ""]) ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          ) : (
            <div>
              {output && output.image && output.image.length > 0 && (
                <img
                  src={output.image[output.image.length - 1]}
                  alt="output"
                  className=" object-cover rounded-lg"
                />
              )}
              {output && output.text && output.text.length > 0 && (
                <p>{output.text[output.text.length - 1]}</p>
              )}
              {output &&
                output.video &&
                output.video.length > 0 &&
                (/https?:\/\/.*\.(?:mp4|webm|ogg)/.test(
                  output.video[output.video.length - 1]
                ) ? (
                  <video
                    src={output.video[output.video.length - 1]}
                    controls
                    width="320"
                    height="240"
                    autoPlay
                  />
                ) : /https?:\/\/.*\.(?:mp3)/.test(
                    output.video[output.video.length - 1]
                  ) ? (
                  <audio src={output.video[output.video.length - 1]} controls />
                ) : null)}
            </div>
          )}
        </CardHeader>
        <Badge variant="secondary" className="absolute right-2 top-2">
          {nodeConnection.aiNode[nodeId ?? ""]?.model ? (
            <span className="text-xs">
              {nodeConnection.aiNode[nodeId ?? ""]?.model}
            </span>
          ) : (
            <span className="text-xs">{data.type}</span>
          )}
        </Badge>
        <div
          className={clsx("absolute left-3 top-4 h-2 w-2 rounded-full", {
            "bg-yellow-500": isLoading[nodeId ?? ""],
            "bg-blue-500": isSelected,
            "bg-green-500": !isSelected && !isLoading[nodeId ?? ""],
          })}
        ></div>
      </Card>
      {data.type !== "Chat" && (
        <CustomHandle type="source" position={Position.Bottom} id="a" />
      )}
    </>
  );
};

export default EditorCanvasCardSingle;
