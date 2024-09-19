import { ConnectionProviderProps } from "@/hooks/connections-providers";
import { EditorState } from "@/hooks/editor-provider";
import { usegraphicStore } from "@/store";
import React from "react";
import SettingsContent from "./Settings-content";
import { EditorNodeType } from "@/lib/types";
import { set } from "zod";

type Props = {
  nodes: EditorNodeType[];
  edges: any;
  state: EditorState;
  nodeConnection: ConnectionProviderProps;
  setNodes: (nodes: EditorNodeType[]) => void;
  setEdges: (edges: any) => void;
};

const RenderOutputAccordion = ({
  nodes,
  edges,
  state,
  nodeConnection,
  setNodes,
  setEdges
}: Props) => {
  const {
    googleFile,
    setGoogleFile,
    selectedSlackChannels,
    setSelectedSlackChannels,

  } = usegraphicStore();
  return (
    <SettingsContent
      nodes={nodes}
      edges={edges}
      nodeConnection={nodeConnection}
      newState={state}
      file={googleFile}
      setFile={setGoogleFile}
      selectedSlackChannels={selectedSlackChannels}
      setSelectedSlackChannels={setSelectedSlackChannels}
      setNodes={setNodes}
      setEdges={setEdges}
    />
  );
};

export default RenderOutputAccordion;
