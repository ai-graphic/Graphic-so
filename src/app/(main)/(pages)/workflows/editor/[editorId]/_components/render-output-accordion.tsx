import { ConnectionProviderProps } from "@/providers/connections-providers";
import { EditorState } from "@/providers/editor-provider";
import { usegraphicStore } from "@/store";
import React from "react";
import ContentBasedOnTitle from "./content-based-on-title";
import { EditorNodeType } from "@/lib/types";

type Props = {
  nodes: EditorNodeType[];
  edges: any;
  state: EditorState;
  nodeConnection: ConnectionProviderProps;
};

const RenderOutputAccordion = ({
  nodes,
  edges,
  state,
  nodeConnection,
}: Props) => {
  const {
    googleFile,
    setGoogleFile,
    selectedSlackChannels,
    setSelectedSlackChannels,
  } = usegraphicStore();
  return (
    <ContentBasedOnTitle
      nodes={nodes}
      edges={edges}
      nodeConnection={nodeConnection}
      newState={state}
      file={googleFile}
      setFile={setGoogleFile}
      selectedSlackChannels={selectedSlackChannels}
      setSelectedSlackChannels={setSelectedSlackChannels}
    />
  );
};

export default RenderOutputAccordion;
