"use client";
import { useEditor } from "@/hooks/editor-provider";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import { BotIcon, SendIcon, UploadIcon, ViewIcon } from "lucide-react";
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
import ContentViewer from "../_components/ContentViewer";
import ContentOptions from "../_components/ContentOptions";
import { creditsRequired } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [load, setLoad] = useState("");
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [requiredCredits, setrequiredCredits] = useState<any>(0);
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
    setTimeout(() => {
      if (cardContentRef.current) {
        const scrollHeight = cardContentRef.current.scrollHeight;
        cardContentRef.current.scrollTo(0, scrollHeight);
      }
    }, 100);
  }, [history.length]);

  useEffect(() => {
    const workflowfunction = async () => {
      let workflow = await getworkflow(pathname.split("/").slice(-2, -1)[0]);
      setWorkflow(workflow);
      const flowpathtemp = workflow?.flowPath
        ? JSON.parse(workflow.flowPath)
        : [];
      let requiredCredits = 1;
      flowpathtemp.forEach((nodeType: string) => {
        if (
          creditsRequired[nodeType as keyof typeof creditsRequired] !==
          undefined
        ) {
          requiredCredits +=
            creditsRequired[nodeType as keyof typeof creditsRequired];
        } else {
          // Handle the case where nodeType is not defined in creditsRequired
          console.warn(`Credits not defined for nodeType: ${nodeType}`);
        }
      });
      setrequiredCredits(requiredCredits);
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
      if (credits < requiredCredits) {
        toast.error("You have insufficient credits");
        return;
      }
      setLoad("Worflow ...");
      setMessage("");
      history.push({
        user: message,
      });
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowId: workflow.id,
          prompt: message,
          userid: user?.id,
          image: selectedurl,
        }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        let rawChunk = "";
        let allUpdates: ChatHistoryItem[] = []; // Use a separate array to store updates temporarily
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // When done, reset history to only include the last update
              if (allUpdates.length > 0) {
                setHistory((currentHistory) => {
                  // Remove the updates added in this session
                  const historyWithoutUpdates = currentHistory.slice(
                    0,
                    currentHistory.length - allUpdates.length
                  );
                  // Add the last update from this session
                  return [
                    ...historyWithoutUpdates,
                    allUpdates[allUpdates.length - 1],
                  ];
                });
              }
              break;
            }
            const chunkText = new TextDecoder().decode(value);
            rawChunk = chunkText; // Accumulate chunks
            try {
              const jsonStrings = rawChunk.split(/(?<=})\s*(?={)/); // Split using regex to handle multiple JSON objects
              jsonStrings.forEach((jsonStr) => {
                const data = JSON.parse(jsonStr);
                console.log("Parsed data:", data);
                allUpdates.push({
                  bot: data.bot,
                  history: data.history,
                });
                setHistory((currentHistory) => [
                  ...currentHistory,
                  {
                    bot: data.bot,
                    history: data.history,
                  },
                ]);
                setLoad(data.node);
              });
            } catch (parseError) {
              console.error("Error parsing JSON:", parseError);
            }
            console.log("Raw chunk:", rawChunk);
          }
        } catch (error) {
          console.error("Error reading from stream:", error);
        }
      }

      // history.push({
      //   bot: response.data.bot,
      //   history: response.data.history,
      // });

      nodeConnection.triggerNode.triggerValue = "";
      const Creditresponse = await onPaymentDetails();

      if (Creditresponse) {
        setCredits(Creditresponse.credits!);
      }
    } catch (error) {
      toast.error("Error sending message");
      toast.error("you have insufficient credits");
      console.log("error", error);
    } finally {
      setLoad("");
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
            You can export this workflow and use it by clicking the button
            below.
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
                        <div className="p-2 rounded-l-lg rounded-t-lg border border-gray-700 dark:bg-gray-700 bg-gray-200 max-w-xs">
                          {item.user.split("https:").map((part, index) => (
                            <React.Fragment key={index}>
                              {index > 0 ? (
                                <ContentViewer
                                  url={`https:${part.split(" ")[0]}`}
                                />
                              ) : (
                                part
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.bot && (
                      <div className="flex justify-start flex-col gap-2">
                        <div className="relative p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs">
                          <ContentViewer url={item.bot} />
                          <ContentOptions
                            bot={item.bot}
                            history={item.history ?? []}
                            pathname={pathname.split("/").slice(-2, -1)[0]}
                          />
                        </div>
                        <p className="text-gray-600 text-sm">
                          {requiredCredits} Credits used
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
              {load != "" && (
                <div className="flex items-center justify-start gap-2">
                  {load} is running{" "}
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
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
                  disabled={load !== ""}
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
                  {selectedurl ? (
                    <Dialog>
                      <DialogTrigger>
                        <Button
                          className="border-2 px-2 py-1 rounded-lg"
                          variant="outline"
                          asChild
                        >
                          <ViewIcon size={40} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Image Uploaded</DialogTitle>
                          <DialogDescription className="flex flex-col justify-start p-5">
                            <ContentViewer url={selectedurl} />
                            <label>
                              <Button
                                asChild
                                variant="outline"
                                className="mt-5"
                              >
                                {loading ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                                ) : (
                                  <span>Upload some Different Content</span> // Changed from <p> to <span>
                                )}
                              </Button>
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="*"
                              />
                            </label>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div>
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
                    </div>
                  )}
                </label>
                <Button
                  type="submit"
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 flex justify-center items-center rounded-2xl p-3 "
                  disabled={!message || load !== ""}
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
