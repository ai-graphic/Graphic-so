import { useEditor } from "@/providers/editor-provider";
import { Input } from "@/components/ui/input";
import { AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import {
  BotIcon,
  ExpandIcon,
  History,
  HistoryIcon,
  SendIcon,
  UploadIcon,
  UserCircle,
} from "lucide-react";
import { useWorkflow } from "@/providers/workflow-providers";
import { useNodeConnections } from "@/providers/connections-providers";
import { useLoading } from "@/providers/loading-provider";
import { onContentChange } from "@/lib/editor-utils";
import { toast } from "sonner";
import { useBilling } from "@/providers/billing-provider";
import axios from "axios";
import { userAgent } from "next/server";
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
  user: string;
  bot: string;
  history: string[];
}

const Chat = () => {
  const { state } = useEditor();
  const pathname = usePathname();
  const [workflow, setWorkflow] = useState<any>();
  const { runWorkFlow } = useWorkflow();
  const { nodeConnection } = useNodeConnections();
  const { isLoading, setIsLoading } = useLoading();
  const [message, setMessage] = useState<string>("");
  const [isUpdated, setIsUpdated] = useState(false);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [load, setLoad] = useState(false);
  const { credits, setCredits } = useBilling();
  const [loading, setLoading] = useState(false);
  const [selectedurl, setSelectedurl] = useState<string | null>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const cardContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardContentRef.current) {
      const scrollHeight = cardContentRef.current.scrollHeight;
      cardContentRef.current.scrollTo(0, scrollHeight);
    }
  }, [history]);

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
    const workflowfunction = async () => {
      let workflow = await getworkflow(pathname.split("/").pop()!);
      setWorkflow(workflow);
      try {
        const history = workflow?.chatHistory.map((item: string) =>
          JSON.parse(item)
        );
        if (history) {
          setHistory(history);
        }
      } catch (error) {
        console.error("Error parsing chatHistory:", error);
        setHistory([]);
      }
    };

    workflowfunction();
  }, [pathname]);

  const triggerElement = state.editor.elements.find(
    (element) => element.type === "Trigger"
  );
  const nodeId = triggerElement ? triggerElement.id : "";

  const onsubmit = async () => {
    setLoad(true);
    await runWorkFlow(
      workflow.id,
      nodeConnection,
      setIsLoading,
      credits,
      setCredits,
      setHistory,
      selectedurl ? selectedurl : ""
    );
    setMessage("");
    nodeConnection.triggerNode.triggerValue = "";
    setLoad(false);
  };
  console.log(nodeConnection);
  useEffect(() => {
    if (isUpdated) {
      onsubmit();
      setIsUpdated(false);
    }
  }, [isUpdated]);

  const [requestUpdate, setRequestUpdate] = useState(false);

  useEffect(() => {
    if (requestUpdate) {
      nodeConnection.setOutput((prev: any) => ({
        ...prev,
        ...(prev.output || {}),
        [nodeId]: {
          image: [...(prev.output?.[nodeId]?.image || []), selectedurl],
          text: [
            ...(prev.output?.[nodeId]?.text || []),
            nodeConnection.triggerNode.triggerValue,
          ],
          video: [...(prev.output?.[nodeId]?.video || [])],
        },
      }));
      setIsUpdated(true);
      setRequestUpdate(false);
    }
  }, [requestUpdate, nodeConnection, nodeId]);

  return (
    <div className="h-[90vh] pb-3">
      {workflow?.name ? (
        <div className="flex flex-col w-full h-full items-center justify-between">
          <CardHeader className="flex flex-col">
            <CardTitle className="text-sm border-b-2">
              Chat with {workflow?.name ? workflow.name : "Workflow"}
            </CardTitle>
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
                  {item.user && (
                    <div className="flex justify-end">
                      <div className="p-2 rounded-l-lg rounded-t-lg border border-gray-700 bg-gray-700   max-w-xs">
                        <p>{item.user}</p>
                      </div>
                    </div>
                  )}

                  {item.bot && (
                    <div className="flex justify-start items-end">
                      <div className="relative p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs">
                        {/https?:\/\/.*\.(?:png|jpg|gif|webp)/.test(
                          item.bot
                        ) ? (
                          <img src={item.bot} width={200} alt="bot" />
                        ) : /https?:\/\/.*\.(?:mp4|webm|ogg)/.test(item.bot) ? (
                          <video
                            src={item.bot}
                            controls
                            width="320"
                            height="240"
                            autoPlay
                          />
                        ) : /https?:\/\/.*\.(?:mp3)/.test(item.bot) ? (
                          <audio src={item.bot} controls />
                        ) : (
                          <p>{item.bot}</p>
                        )}
                        {item.user && (
                          <Dialog>
                            <DialogTrigger className="bg-[#0A0A0A] dark:text-gray-600 dark:hover:text-blue-400 p-2 m-1 rounded-l-xl rounded-b-none absolute bottom-0 right-0">
                              <HistoryIcon size={20} />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Workflow History</DialogTitle>
                                <DialogDescription>
                                  <div className="mt-2 p-2 h-[80vh] overflow-scroll border-t border-gray-300">
                                    <div className="mb-4 flex gap-2 ">
                                      <strong>
                                        <UserButton />
                                      </strong>{" "}
                                      <div className="p-2 rounded-r-lg rounded-t-lg border border-gray-700 ">
                                        {item.user}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <strong>
                                        <BotIcon />
                                      </strong>
                                      <div>
                                        {item.history.map(
                                          (historyItem, historyIndex) => (
                                            <div
                                              key={historyIndex}
                                              className="flex justify-start mb-2"
                                            >
                                              <div className="p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs  ">
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
                        )}
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
                  accept="image/*"
                />
              </label>

              <Button
                type="submit"
                className="absolute z-1000 right-5 top-1/2 transform -translate-y-1/2 flex justify-center items-center rounded-2xl p-3 "
                disabled={!message || load}
              >
                <SendIcon size={15} />
              </Button>
            </form>
          </div>
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

// 'use client'

// import type { AI, UIState } from '../../../../../../../lib/actions'
// import { Thread, type AppendMessage } from '@assistant-ui/react'
// import {
//   useVercelRSCRuntime,
//   VercelRSCMessage
// } from '@assistant-ui/react-ai-sdk'
// import { useActions, useUIState } from 'ai/rsc'
// import { nanoid } from '@/lib/utils'
// import { useLoading } from '@/providers/loading-provider'
// import { useUser } from '@clerk/nextjs'
// import { usePathname } from 'next/navigation'
// import { getworkflow } from '../_actions/workflow-connections'
// import { useEffect, useState } from 'react'

// const convertMessage = (message: UIState[number]): VercelRSCMessage => {
//   return {
//     id: nanoid(),
//     role: message.role,
//     display: (
//       <div>
//         {message.spinner}
//         {message.display}
//         {message.attachments}
//       </div>
//     )
//   }
// }

// const Chat = () => {
//   const { isLoading, setIsLoading } = useLoading();
//   const { submitUserMessage } = useActions();
//   const [messages, setMessages] = useUIState<typeof AI>();
//   const { user } = useUser();
//   const pathname = usePathname();
//   const workflowId = pathname.split("/").pop()!;

//   const onNew = async (m: AppendMessage) => {
//     if (m.content[0].type !== 'text')
//       throw new Error('Only text messages are supported');
//     const input = m.content[0].text;

//     // Optimistically add user message UI
//     setMessages((currentConversation: UIState) => [
//       ...currentConversation,
//       { id: nanoid(), role: 'user', display: input }
//     ]);

//     // Submit and get response message
//     const message = await submitUserMessage(input, user?.id, workflowId);
//     setMessages((currentConversation: UIState) => [
//       ...currentConversation,
//       message
//     ]);
//   };

//   const runtime = useVercelRSCRuntime({ messages, convertMessage, onNew });

//   return (
//     <div className='flex justify-center min-w-[100%] items-center h-[80vh]'>
//       <Thread
//         runtime={runtime}
//         welcome={{
//           suggestions: [
//             {
//               text: 'image of a dilapidated house with boarded-up windows, overgrown with weeds, and a sign that reads "Beware: Mad Man Inside."',
//               prompt: '/image of a dilapidated house with boarded-up windows, overgrown with weeds, and a sign that reads "Beware: Mad Man Inside".'
//             },
//             {
//               text: 'Imagine a serene village nestled in the remote, rocky terrain of Mars. Picture quaint, dome-shaped dwellings surrounded by red dust and craggy mountains in the distance.',
//               prompt: '/Imagine a serene village nestled in the remote, rocky terrain of Mars. Picture quaint, dome-shaped dwellings surrounded by red dust and craggy mountains in the distance..'
//             }
//           ]
//         }}
//       />
//     </div>
//   );
// }

// export default Chat;
