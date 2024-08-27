import { useEditor } from "@/providers/editor-provider";
import { Input } from "@/components/ui/input";
import { AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getworkflow } from "../_actions/workflow-connections";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

const Chat = () => {
  const { state } = useEditor();
  const pathname = usePathname();
  const [workflow, setWorkflow] = useState<any>();
  useEffect(() => {
    const workflowfunction = async () => {
      let workflow = await getworkflow(pathname.split("/").pop()!);
      setWorkflow(workflow);
    };
    workflowfunction();
  }, [pathname]);
  console.log(workflow);

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
            placeholder="Type your message..."
          />
          <Button variant="outline" className="flex justify-center items-center">
           <SendIcon size={20}/>
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
