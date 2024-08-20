import { EditorCanvasCardType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { use, useEffect, useMemo, useState } from "react";
import { Position, useNodeId } from "reactflow";
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
import { set } from "zod";
import { useLoading } from "@/providers/loading-provider";

type Props = {};

const EditorCanvasCardSingle = ({ data }: { data: EditorCanvasCardType }) => {
  const { dispatch, state } = useEditor();
  const {isLoading} = useLoading()
  const nodeId = useNodeId();
  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />;
  }, [data]);
  const { nodeConnection } = useNodeConnections();
  const [output, setOutput] = useState<any>("");
  type OutputType = {
    [key: string]: any;
  };

  useEffect(() => {
    const outputsObject = nodeConnection.aiNode.output as OutputType;
    if (nodeId != null && outputsObject && outputsObject[nodeId]) {
      const outputsArray = outputsObject[nodeId];
      if (outputsArray.length > 0) {
        setOutput(outputsArray[outputsArray.length - 1]);
      }
    }
  }, [nodeConnection.aiNode.output, nodeId]);
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
        className="relative max-w-[400px] dark:border-muted-foreground/70"
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
          {isLoading[nodeId ?? ""] && nodeConnection.aiNode[nodeId ?? ""]?.model ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          ) : nodeConnection.aiNode[nodeId ?? ""]?.model === "FLUX-image" &&
            output ? (
            <img src={output} alt="Model Output" />
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
            "bg-green-500": Math.random() < 0.6,
            "bg-orange-500": Math.random() >= 0.6 && Math.random() < 0.8,
            "bg-red-500": Math.random() >= 0.8,
          })}
        ></div>
      </Card>
      <CustomHandle type="source" position={Position.Bottom} id="a" />
    </>
  );
};

export default EditorCanvasCardSingle;
