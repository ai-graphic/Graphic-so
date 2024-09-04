import { useEditor } from "@/providers/editor-provider";
import { Input } from "@/components/ui/input";
import { AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-providers";
import { useNodeConnections } from "@/providers/connections-providers";
import { useLoading } from "@/providers/loading-provider";
import { onContentChange } from "@/lib/editor-utils";
import { toast } from "sonner";

interface ChatHistoryItem {
  user: string;
  bot: string;
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

  const cardContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardContentRef.current) {
      const scrollHeight = cardContentRef.current.scrollHeight;
      cardContentRef.current.scrollTo(0, scrollHeight);
    }
  }, [history]);

  
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
    await runWorkFlow(workflow.id, nodeConnection, setIsLoading, setHistory);
    setMessage("");
    nodeConnection.triggerNode.triggerValue = "";
    setLoad(false);
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
                <img
                  src="/ai.png"
                  alt="Logo"
                  className="w-20 h-20 mb-4"
                />
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
