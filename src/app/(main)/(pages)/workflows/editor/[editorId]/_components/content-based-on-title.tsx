"use client";

import { ConnectionProviderProps } from "@/providers/connections-providers";
import { EditorState, useEditor } from "@/providers/editor-provider";
import { nodeMapper } from "@/lib/types";
import { AccordionContent } from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import GoogleFileDetails from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/google-file-details";
import GoogleDriveFiles from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/google-drive-files";
import ActionButton from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/action-button";
import { use, useEffect, useState } from "react";
import { getFileMetaData } from "@/app/(main)/(pages)/connections/_actions/google-connections";
import axios from "axios";
import { toast } from "sonner";
// import {useEffect, useState} from "react";
// import {usePathname} from "next/navigation";
// import {onGetNodeTemplate} from "@/app/(main)/(pages)/workflows/editor/[editorId]/_actions/workflow-connections";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;

  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

interface GroupOption {
  [key: string]: Option[];
}

type Props = {
  nodeConnection: ConnectionProviderProps;
  newState: EditorState;
  file: any;
  setFile: (file: any) => void;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (value: Option[]) => void;
};
const ContentBasedOnTitle = ({
  nodeConnection,
  newState,
  file,
  setFile,
  selectedSlackChannels,
  setSelectedSlackChannels,
}: Props) => {
  // const [Template, setTemplate] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // const pathName = usePathname();
  const [showButtons, setShowButtons] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null); // New state for selected output

  console.log("btn", showButtons);
  const { state } = useEditor();

  const { selectedNode } = newState.editor;
  const title = selectedNode.data.title;

  useEffect(() => {
    const reqGoogle = async () => {
      const response: { data: { message: { files: any } } } = await axios.get(
        "/api/drive"
      );
      if (response) {
        // Take only the first three files, if they exist
        const firstThreeFiles = response.data.message.files.slice(0, 3);
        console.log(firstThreeFiles);
        toast.success("Files fetched successfully");
        setFile(firstThreeFiles); // Update state with the new files
      } else {
        toast.error("Something went wrong");
      }
    };
    reqGoogle();
  }, []);

  //@ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]];
  console.log("Node Connection Type:", nodeConnectionType);
  if (!nodeConnectionType) return <p>Not connected</p>;

  const isConnected =
    title === "Google Drive"
      ? !nodeConnection.isLoading
      : !!nodeConnectionType[
          `${
            title === "Slack"
              ? "slackAccessToken"
              : title === "Discord"
              ? "webhookURL"
              : title === "Notion"
              ? "accessToken"
              : ""
          }`
        ];
        useEffect(() => {
          if (selectedOutput) {
            onContentChange(state, nodeConnection, title, { target: { value: selectedOutput } }, "prompt");
          }
        }, [selectedOutput]);

  return (
    <AccordionContent>
      <Card>
        {title === "Discord" && (
          <CardHeader>
            <CardTitle>{nodeConnectionType.webhookName}</CardTitle>
            <CardDescription>{nodeConnectionType.guildName}</CardDescription>
          </CardHeader>
        )}
        <div className="flex flex-col gap-3 px-6 py-3 pb-20">
          <p>{title === "Notion" ? "Values to be stored" : "Message"}</p>
          {title === "AI" ? (
            <div className="gap-2 flex flex-col">
              <p>Enter Your Prompt Here</p>
              <Input
                type="text"
                value={selectedOutput ?? nodeConnectionType.prompt}
                onClick={() => {
                  setShowButtons((prev) => !prev);
                }}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setSelectedOutput(newValue);
                  onContentChange(
                    state,
                    nodeConnection,
                    title,
                    event,
                    "prompt"
                  );
                }}
              />
              {showButtons &&
                nodeConnection.aiNode.output &&
                Object.entries(nodeConnection.aiNode.output).map(
                  ([id, outputs]) =>
                    outputs.map((output, index) => (
                      <button
                        key={`${id}-${index}`}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => {
                          setSelectedOutput(String(output));
                          setShowButtons((prev) => !prev);
                        }}
                      >
                        {String(output)}
                      </button>
                    ))
                )}
              <p>Enter Your ApiKey Here</p>
              <Input
                type="text"
                value={nodeConnectionType.ApiKey}
                onChange={(event) =>
                  onContentChange(state, nodeConnection, title, event, "ApiKey")
                } // Pass the new value directly
              />
              <p>Enter Your endpoint Here</p>
              <Input
                type="text"
                value={nodeConnectionType.endpoint}
                onChange={(event) =>
                  onContentChange(
                    state,
                    nodeConnection,
                    title,
                    event,
                    "endpoint"
                  )
                } // Pass the new value directly
              />
              <p>Enter Your model Here</p>
              <Input
                type="text"
                value={nodeConnectionType.model}
                onChange={(event) =>
                  onContentChange(state, nodeConnection, title, event, "model")
                } // Pass the new value directly
              />
            </div>
          ) : (
            <Input
              type="text"
              value={nodeConnectionType.content}
              onChange={(event) =>
                onContentChange(state, nodeConnection, title, event, "content")
              } // Pass the new value directly
            />
          )}
          {JSON.stringify(file) !== "{}" && title !== "Google Drive" && (
            <Card className="w-full">
              <CardContent className="px-2 py-3">
                <div className="flex flex-col gap-4">
                  <CardDescription>Drive File</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    <GoogleFileDetails
                      nodeConnection={nodeConnection}
                      title={title}
                      gFile={file}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/*<p>{`Message`}</p>*/}
          {/*<Input*/}
          {/*    type="text"*/}
          {/*    value={nodeConnectionType.content}*/}
          {/*    onChange={(event) => onContentChange(nodeConnection, title, event)}*/}
          {/*/>*/}
          {title === "Google Drive" && <GoogleDriveFiles />}
          <ActionButton
            currentService={title}
            nodeConnection={nodeConnection}
            channels={selectedSlackChannels}
            setChannels={setSelectedSlackChannels}
          />
        </div>
      </Card>
    </AccordionContent>
  );
};
export default ContentBasedOnTitle;
