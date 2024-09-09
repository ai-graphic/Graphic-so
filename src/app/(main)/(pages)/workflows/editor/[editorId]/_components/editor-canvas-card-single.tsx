import { EditorCanvasCardType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { use, useEffect, useMemo, useState } from "react";
import { Position, SelectionMode, useNodeId } from "reactflow";
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
import { MousePointerClickIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkflow } from "@/providers/workflow-providers";
import { useBilling } from "@/providers/billing-provider";

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
  const {credits, setCredits} = useBilling();
  const [triggerValue, setTriggerValue] = useState(
    nodeConnection.triggerNode.triggerValue
  );
  const pathname = usePathname();
  const [output, setOutput] = useState<any>("");
  type OutputType = {
    [key: string]: any;
  };
  const isSelected = useMemo(() => {
    return state.editor.selectedNode.id === nodeId;
  }, [state.editor.elements, nodeId]);

  useEffect(() => {
    const outputsObject = nodeConnection.aiNode.output as OutputType;
    if (nodeId != null && outputsObject && outputsObject[nodeId]) {
      const outputsArray = outputsObject[nodeId];
      if (outputsArray.length > 0) {
        setOutput(outputsArray[outputsArray.length - 1]);
      }
    }
  }, [nodeConnection.aiNode.output, nodeId]);
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
        className={clsx(
          "relative max-w-[400px] dark:border-muted-foreground/70",
          {
            "shadow-xl": isSelected || isLoading[nodeId ?? ""],
            "shadow-blue-500/50": isSelected && !isLoading[nodeId ?? ""],
            "shadow-yellow-500/50": isLoading[nodeId ?? ""],
          }
        )}
      >
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <div>{logo}</div>
            <div>
              <CardTitle className="text-md">{data.title}</CardTitle>
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
            <div className="flex gap-2">
              <Input
                type="text"
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
                  nodeConnection.setAINode((prev: any) => ({
                    ...prev,
                    output: {
                      ...(prev.output || {}),
                      [nodeId ?? ""]: [
                        ...(prev.output?.[nodeId ?? ""] || []),
                        nodeConnection.triggerNode.triggerValue,
                      ],
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
              nodeConnection.aiNode[nodeId ?? ""]?.model ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            ) : nodeConnection.aiNode[nodeId ?? ""]?.model === "FLUX-image" &&
              output ? (
              <img src={output} alt="Model Output" />
            ) : /https?:\/\/.*\.(?:png|jpg|gif|webp)/.test(output) ? (
              <img src={output} alt="Model Output" />
            ) : /https?:\/\/.*\.(?:mp4|webm)/.test(output) ? (
              <video src={output} controls width="320" height="240" />
            ) : (
              <p>{output}</p>
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
      <CustomHandle type="source" position={Position.Bottom} id="a" />
    </>
  );
};

export default EditorCanvasCardSingle;
