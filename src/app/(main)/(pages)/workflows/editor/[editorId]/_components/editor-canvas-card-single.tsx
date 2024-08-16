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

type Props = {};

const EditorCanvasCardSingle = ({ data }: { data: EditorCanvasCardType }) => {
  const { dispatch, state } = useEditor();
  const nodeId = useNodeId();
  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />;
  }, [data]);
  const { nodeConnection } = useNodeConnections();
  const [output, setOutput] = useState<any>("");
  type OutputType = {
    [key: string]: any; // Replace 'any' with a more specific type if possible
  };

  useEffect(() => {
    // Cast nodeConnection.aodeConnection.aiNode.output to the defined type with an index signature
  const outputsObject = nodeConnection.aiNode.output as OutputType;
  if (nodeId != null && outputsObject && outputsObject[nodeId]) {
    const outputsArray = outputsObject[nodeId];
    // Assuming outputsArray is an array, check if it has elements
    if (outputsArray.length > 0) {
      // ... rest of your code to handle outputsArray ...
      setOutput(outputsArray[0]); // Example of setting the first output to state
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
          {nodeConnection.aiNode[nodeId ?? ""]?.model &&
            nodeConnection.aiNode[nodeId ?? ""]?.model === "FLUX-image" &&
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
