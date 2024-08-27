import EditorProvider from "@/providers/editor-provider";
import { ConnectionsProvider } from "@/providers/connections-providers";
import EditorCanvas from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas";
import { LoadingProvider } from "@/providers/loading-provider";
import { WorkflowProvider } from "@/providers/workflow-providers";

type Props = {};
const Page = (props: Props) => {
  return (
    <div className="h-full">
      <WorkflowProvider>
      <LoadingProvider>
        <EditorProvider>
          <ConnectionsProvider>
            <EditorCanvas />
          </ConnectionsProvider>
        </EditorProvider>
      </LoadingProvider>
      </WorkflowProvider>
    </div>
  );
};
export default Page;
