"use client";
import EditorProvider from "@/providers/editor-provider";
import { ConnectionsProvider, useNodeConnections } from "@/providers/connections-providers";
import EditorCanvas from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas";
import { LoadingProvider } from "@/providers/loading-provider";
import { WorkflowProvider } from "@/providers/workflow-providers";
import { getworkflow } from "./_actions/workflow-connections";
import { usePathname, useRouter } from "next/navigation"; // Updated import
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";

type Props = {};
const Page = (props: Props) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [workflow, setWorkflow] = useState<any>();
  const {nodeConnection} = useNodeConnections()

  useEffect(() => {
    const checkWorkflow = async () => {
      if (!isLoaded) return;

      let workflow = await getworkflow(pathname.split("/").pop()!);
      setWorkflow(workflow);
      if (workflow?.userId !== user?.id) {
        setLoading(false);
        router.push("/workflows/error");
        return <div>Loading...</div>;
      } else {
        setWorkflow(workflow);
      const aiTemplate = workflow?.AiTemplate
        ? JSON.parse(workflow.AiTemplate)
        : {};
      Object.keys(aiTemplate).forEach((nodeId) => {
        const nodeData = aiTemplate[nodeId];
        console.log("hello", nodeData);

        if (!nodeConnection.aiNode[nodeId] && nodeData.model) {
          nodeConnection.aiNode[nodeId] = {
            id: "",
            system: "",
            prompt: "",
            model: "",
            localModel: "",
            output: "",
            temperature: 0,
            maxTokens: 0,
            endpoint: "",
            num_outputs: 0,
            aspect_ratio: "",
            output_format: "",
            guidance_scale: 0,
            output_quality: 0,
            num_inference_steps: 0,
            model_name: "",
            hf_token: "",
            steps: 0,
            learning_rate: 0,
            batch_size: 0,
            resolution: "",
            lora_linear: false,
            lora_linear_alpha: 0,
            repo_id: "",
            images: "",
            history: true,
          };
        }

        if (nodeData.model === "SuperAgent") {
          nodeConnection.aiNode[nodeId] = nodeData;
        } else {
          // Otherwise, update selectively
          nodeConnection.aiNode[nodeId] = {
            ...nodeConnection.aiNode[nodeId], // Preserve existing data
            model: nodeData.model,
            prompt: nodeData.prompt,
            system: nodeData.system,
            localModel: nodeData.localModel,
            temperature: nodeData.temperature,
            maxTokens: nodeData.maxTokens,
            endpoint: nodeData.endpoint,
            num_outputs: nodeData.num_outputs,
            aspect_ratio: nodeData.aspect_ratio,
            output_format: nodeData.output_format,
            guidance_scale: nodeData.guidance_scale,
            output_quality: nodeData.output_quality,
            num_inference_steps: nodeData.num_inference_steps,
            model_name: nodeData.model_name,
            hf_token: nodeData.hf_token,
            // Add other parameters as needed
          };
        }
      });
      console.log("Updated nodeConnection:", nodeConnection);
        setShow(true);
        setLoading(false);
      }
    };

    checkWorkflow();
  }, [isLoaded, pathname, user, router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-3">
        <p className="text-xl font-semibold">Setting Up your Workflow...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }
  return (
    <div className="h-full">
      {show ? (
        <WorkflowProvider>
          <LoadingProvider>
            <EditorProvider>
              <ConnectionsProvider>
                <EditorCanvas workflow={workflow} setworkflow= {setWorkflow} nodeConnection={nodeConnection}/>
              </ConnectionsProvider>
            </EditorProvider>
          </LoadingProvider>
        </WorkflowProvider>
      ) : null}
    </div>
  );
};
export default Page;
