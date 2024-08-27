import { useEditor } from "@/providers/editor-provider";
import { Input } from "@/components/ui/input";
import { AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { useWorkflow } from "@/providers/workflow-providers";
import { useNodeConnections } from "@/providers/connections-providers";
import { useLoading } from "@/providers/loading-provider";
import { onContentChange } from "@/lib/editor-utils";
import { toast } from "sonner";

const Chat = () => {
  const { state } = useEditor();
  const pathname = usePathname();
  const [workflow, setWorkflow] = useState<any>();
  const { runWorkFlow } = useWorkflow();
  const { nodeConnection } = useNodeConnections();
  const { isLoading, setIsLoading } = useLoading();
  const [message, setMessage] = useState<string>("");
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    const workflowfunction = async () => {
      let workflow = await getworkflow(pathname.split("/").pop()!);
      setWorkflow(workflow);
    };
    workflowfunction();
  }, [pathname]);

  const triggerElement = state.editor.elements.find(
    (element) => element.type === "Trigger"
  );
  const nodeId = triggerElement ? triggerElement.id : "";

  const onsubmit = async () => {
    await runWorkFlow(workflow.id, nodeConnection, setIsLoading);
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
    <AccordionContent className="h-[65vh] overflow-scroll">
      {workflow?.name ? (
        <Card className="flex flex-col w-full h-full items-center justify-between">
          <CardHeader className="flex flex-col">
            <CardTitle className="text-sm">
              Chat with {workflow?.name ? workflow.name : "Workflow"}
            </CardTitle>
          </CardHeader>

          <div className="flex w-full gap-2 m-2">
            <div></div>
            <Input
              type="text"
              value={nodeConnection.triggerNode.triggerValue ?? message}
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
              variant="outline"
              className="flex justify-center items-center"
              onClick={() => {
                if (message) {
                  setRequestUpdate(true);
                } else {
                  toast.error("Please enter a message");
                }
              }}
            >
              <SendIcon size={20} />
            </Button>
            <div></div>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
        </div>
      )}
    </AccordionContent>
  );
};

export default Chat;
