"use client";
import { useEditor } from "@/hooks/editor-provider";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import { BotIcon, HistoryIcon, SendIcon, UploadIcon } from "lucide-react";
import { useNodeConnections } from "@/hooks/connections-providers";
import { onContentChange } from "@/lib/editor-utils";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useBilling } from "@/hooks/billing-provider";
import { onPaymentDetails } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DublicateWorkflow from "@/components/forms/dublicate-forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserButton } from "@clerk/nextjs";

interface ChatHistoryItem {
  user?: string;
  bot?: string;
  history?: string[];
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
  const [loading, setLoading] = useState(false);
  const [selectedurl, setSelectedurl] = useState<string | null>();

  const { user } = useUser();
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
      if (workflow?.chatHistory) {
        if (workflow?.chatHistory) {
          const history = workflow.chatHistory.map((item: string) =>
            JSON.parse(item)
          );
          setHistory(history);
        }
      }
    };
    workflowfunction();
  }, [pathname]);
  const triggerElement = state.editor.elements.find(
    (element) => element.type === "Trigger"
  );
  const nodeId = triggerElement ? triggerElement.id : "";

  const onsubmit = async () => {
    try {
      setLoad(true);
      setMessage("");
      history.push({
        user: message,
      });
      const response = await axios.post("/api/workflow", {
        workflowId: workflow.id,
        prompt: message,
        userid: user?.id,
        image: selectedurl,
      });
      console.log("response", response);

      history.push({
        bot: response.data.bot,
        history: response.data.history,
      });

      nodeConnection.triggerNode.triggerValue = "";
      const Creditresponse = await onPaymentDetails();
      console.log("Creditresponse", Creditresponse);
      if (Creditresponse) {
        setCredits(Creditresponse.credits!);
        console.log("Credits", Creditresponse.credits);
      }
    } catch (error) {
      toast.error("Error sending message");
      toast.error("you have insufficient credits");
      console.log("error", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (isUpdated) {
      onsubmit();
      setIsUpdated(false);
    }
  }, [isUpdated]);
  const [requestUpdate, setRequestUpdate] = useState(false);
  useEffect(() => {
    if (requestUpdate) {
      nodeConnection.setOutput((prev: any) => {
        const newState = {
          ...prev,

          ...(prev.output || {}),
          [nodeId ?? ""]: [
            ...(prev.output?.[nodeId ?? ""] || []),
            nodeConnection.triggerNode.triggerValue,
          ],
        };
        return newState;
      });
      setIsUpdated(true);
      setRequestUpdate(false);
    }
  }, [requestUpdate, nodeConnection, nodeId]);

  return (
    <>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>REMIX this Workflow?</SheetTitle>
          <SheetDescription className="flex flex-col gap-2 w-full">
            You can export this workflow and use it by clicking the button below.
            <DublicateWorkflow id={pathname.split("/").slice(-2, -1)[0]} />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
      <div className="h-screen w-[95vh] pt-3 max-md:w-full relative">
        {workflow?.name ? (
          <div className="flex flex-col w-full h-full items-center justify-between">
            <CardHeader className="flex flex-col text-center">
              <CardTitle className="text-2xl px-8">
                {workflow?.name ? workflow.name : "Workflow"}
              </CardTitle>
              <p className="text-sm">{workflow.description}</p>
            </CardHeader>
            <CardContent
              ref={cardContentRef}
              className="flex flex-col w-full h-full p-4 gap-2 overflow-scroll"
            >
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <BotIcon size={30} />
                  <p className="text-lg">How can I help you today?</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    {item.user && (
                      <div className="flex justify-end">
                        <div className="p-2 rounded-l-lg rounded-t-lg border border-gray-700 bg-gray-700 max-w-xs">
                        {item.user.match(/https?:\/\/[^\s]+/g) ? (
                          item.user.split(' ').map((part, index) => {
                            if (/https?:\/\/.*\.(?:png|jpg|gif|webp)/.test(part)) {
                              return <img key={index} src={part} alt="user" className="rounded-lg mb-2" />;
                            } else if (/https?:\/\/.*\.(?:mp3)/.test(part)) {
                              return <audio key={index} src={part} controls className="w-full mb-2" />;
                            } else if (/https?:\/\/.*\.(?:mp4|webm|ogg)/.test(part)) {
                              return <video key={index} src={part} controls className="w-full mb-2" />;
                            } else {
                              return (
                                <div key={index} className="flex">
                                  <p>{part}</p>
                                </div>
                              );
                            }
                          })
                        ) : (
                          <p>{item.user}</p>
                        )}
                      </div>
                    </div>
                    )}

                    {item.bot && (
                      <div className="flex justify-start">
                        <div className="relative p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs">
                          {/https?:\/\/.*\.(?:png|jpg|gif|webp)/.test(
                            item.bot
                          ) ? (
                            <img src={item.bot} width={500} alt="bot" />
                          ) : /https?:\/\/.*\.(?:mp4|webm|ogg)/.test(
                              item.bot
                            ) ? (
                            <video
                              src={item.bot}
                              controls
                              width="320"
                              height="240"
                            />
                          ) : /https?:\/\/.*\.(?:mp3)/.test(item.bot) ? (
                            <audio src={item.bot} controls />
                          ) : (
                            <p>{item.bot}</p>
                          )}

                          <Dialog>
                            <DialogTrigger className="bg-[#0A0A0A] dark:text-gray-600 dark:hover:text-blue-400 p-2 m-1 rounded-l-xl rounded-b-none absolute bottom-0 right-0">
                              <HistoryIcon size={20} />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Workflow History</DialogTitle>
                                <DialogDescription>
                                  <div className="mt-2 p-2 h-[80vh] overflow-scroll border-t border-gray-300">
                                    <div className="flex gap-2">
                                      <strong>
                                        <BotIcon />
                                      </strong>
                                      <div>
                                        {item.history?.map(
                                          (historyItem, historyIndex) => (
                                            <div
                                              key={historyIndex}
                                              className="flex justify-start mb-2"
                                            >
                                              <div className="p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs">
                                                {/https?:\/\/.*\.(?:png|jpg|gif|webp)/.test(
                                                  historyItem
                                                ) ? (
                                                  <img
                                                    src={historyItem}
                                                    width={200}
                                                    alt="bot"
                                                    className="rounded-lg"
                                                  />
                                                ) : /https?:\/\/.*\.(?:mp4|webm|ogg)/.test(
                                                    historyItem
                                                  ) ? (
                                                  <video
                                                    src={historyItem}
                                                    controls
                                                    width="320"
                                                    height="240"
                                                    autoPlay
                                                    className="rounded-lg"
                                                  />
                                                ) : /https?:\/\/.*\.(?:mp3)/.test(
                                                    historyItem
                                                  ) ? (
                                                  <audio
                                                    src={historyItem}
                                                    controls
                                                    className="w-full"
                                                  />
                                                ) : (
                                                  <p>{historyItem}</p>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {load && (
                <div className="flex items-start justify-start">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                </div>
              )}
            </CardContent>
            <div className="flex w-full p-3">
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
                <label className="absolute right-14 top-1/2 transform -translate-y-1/2 flex justify-center items-center rounded-2xl p-3 ">
                  <Button
                    className="border-2 px-2 py-1 rounded-lg"
                    variant="outline"
                    asChild
                  >
                    {loading ? (
                      <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                      </div>
                    ) : (
                      <UploadIcon size={40} />
                    )}
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="*"
                  />
                </label>
                <Button
                  type="submit"
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 flex justify-center items-center rounded-2xl p-3 "
                  disabled={!message || load}
                >
                  <SendIcon size={15} />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
