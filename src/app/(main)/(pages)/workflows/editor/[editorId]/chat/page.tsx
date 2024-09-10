"use client";
import { useEditor } from "@/providers/editor-provider";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import { SendIcon, Settings, User } from "lucide-react";
import { useNodeConnections } from "@/providers/connections-providers";
import { onContentChange } from "@/lib/editor-utils";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useBilling } from "@/providers/billing-provider";
import { onPaymentDetails } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DublicateWorkflow from "@/components/forms/dublicate-forms";

interface ChatHistoryItem {
  user: string;
  bot: string;
}

const Chat = () => {
  const { state } = useEditor();
  const pathname = usePathname();
  const [workflow, setWorkflow] = useState<any>();
  const { nodeConnection } = useNodeConnections();
  const [message, setMessage] = useState<string>("");
  const [isUpdated, setIsUpdated] = useState(false);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [load, setLoad] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [flowPath, setflowPath] = useState<any>([]);
  const { credits, setCredits } = useBilling();
  const { user } = useUser();

  useEffect(() => {
    if (cardContentRef.current) {
      const scrollHeight = cardContentRef.current.scrollHeight;
      cardContentRef.current.scrollTo(0, scrollHeight);
    }
  }, [history]);

  useEffect(() => {
    const workflowfunction = async () => {
      let workflow = await getworkflow(pathname.split("/").slice(-2, -1)[0]);
      setWorkflow(workflow);
      const flowpathtemp = workflow?.flowPath
        ? JSON.parse(workflow.flowPath)
        : [];
      setflowPath(flowpathtemp);
    };
    workflowfunction();
  }, [pathname]);
  console.log("pathname", flowPath);
  const triggerElement = state.editor.elements.find(
    (element) => element.type === "Trigger"
  );
  const nodeId = triggerElement ? triggerElement.id : "";

  const onsubmit = async () => {
    try {
      setLoad(true);
      setMessage("");
      const response = await axios.post("/api/workflow", {
        workflowId: workflow.id,
        prompt: message,
        userid: user?.id,
      });
      const data = response.data;
      console.log("data", data);
      if (data) {
        history.push({
          user: message,
          bot: data,
        });
      }
      nodeConnection.triggerNode.triggerValue = "";
      const Creditresponse = await onPaymentDetails();
      if (Creditresponse) {
        setCredits(Creditresponse.credits!);
      }
    } catch (error) {
      toast.error("Error sending message, Check your Credits");
    } finally {
      setLoad(false);
    }
  };
  console.log("history", history);

  useEffect(() => {
    if (isUpdated) {
      onsubmit();
      setIsUpdated(false);
    }
  }, [isUpdated]);
  const [requestUpdate, setRequestUpdate] = useState(false);
  useEffect(() => {
    if (requestUpdate) {
      nodeConnection.setAINode((prev: any) => {
        const newState = {
          ...prev,
          output: {
            ...(prev.output || {}),
            [nodeId ?? ""]: [
              ...(prev.output?.[nodeId ?? ""] || []),
              nodeConnection.triggerNode.triggerValue,
            ],
          },
        };
        return newState;
      });
      setIsUpdated(true);
      setRequestUpdate(false);
    }
  }, [requestUpdate, nodeConnection, nodeId]);

  return (
    <div className="h-[95vh] relative">
      <Sheet>
        <SheetTrigger className="absolute text-gray-400 hover:text-black dark:hover:text-white top-0 right-0">
          <Settings />
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Duplicate this Workflow?</SheetTitle>
            <SheetDescription className="flex flex-col gap-2 w-full">
              You can duplicate this workflow by clicking the button below.
              <DublicateWorkflow id={pathname.split("/").slice(-2, -1)[0]} />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      {workflow?.name ? (
        <div className="flex flex-col w-full h-full items-center justify-between">
          <CardHeader className="flex flex-col justify-center items-center">
            <CardTitle className="text-md border-b-2">
              Chat with {workflow?.name ? workflow.name : "Workflow"}
            </CardTitle>
            <div className="flex gap-2 justify-center items-center text-sm">
              workflow path:
              <div className="flex flex-wrap gap-2 ">
                {flowPath?.map(
                  (node: string, index: number) =>
                    index % 2 !== 0 && (
                      <span key={index} className=" px-1 rounded">
                        {node}
                      </span>
                    )
                )}
              </div>
            </div>
            <p className="text-sm">{workflow.description}</p>
          </CardHeader>
          <CardContent
            ref={cardContentRef}
            className="flex flex-col w-full h-full p-4 gap-2 overflow-scroll"
          >
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <img src="/ai.png" alt="Logo" className="w-20 h-20 mb-4" />
                <p className="text-lg">How can I help you today?</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="p-2 rounded-l-lg rounded-t-lg border border-gray-700 bg-gray-700   max-w-xs">
                      <p>{item.user}</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs">
                      {/https?:\/\/.*\.(?:png|jpg|gif|webp)/.test(item.bot) ? (
                        <img src={item.bot} width={200} alt="bot" />
                      ) : /https?:\/\/.*\.(?:mp4|webm|ogg)/.test(item.bot) ? (
                        <video
                          src={item.bot}
                          controls
                          width="320"
                          height="240"
                        />
                      ) : (
                        <p>{item.bot}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {load && (
              <div className="flex items-start justify-start">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
              </div>
            )}
          </CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (message) {
                setRequestUpdate(true);
              } else {
                toast.error("Please enter a message");
              }
            }}
            className="flex-none w-full p-3 flex gap-2 relative"
          >
            <Input
              className="p-4 py-6 rounded-2xl w-full pr-12"
              type="text"
              disabled={load}
              value={nodeConnection.triggerNode.triggerValue ?? message}
              placeholder="Enter your message here ..."
              onChange={(event) => {
                const newValue = event.target.value;
                setMessage(newValue);
                onContentChange(
                  state,
                  nodeConnection,
                  "Trigger",
                  event,
                  "triggerValue"
                );
                nodeConnection.triggerNode.triggerValue = newValue;
              }}
            />
            <Button
              type="submit"
              className="absolute right-5 top-1/2 transform -translate-y-1/2 flex justify-center items-center rounded-2xl p-3 "
              disabled={!message || load}
            >
              <SendIcon size={15} />
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
        </div>
      )}
    </div>
  );
};

export default Chat;
