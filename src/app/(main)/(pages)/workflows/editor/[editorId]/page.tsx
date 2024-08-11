import EditorProvider from "@/providers/editor-provider";
import {ConnectionsProvider} from "@/providers/connections-providers";
import EditorCanvas from "@/app/(main)/(pages)/workflows/editor/[editorId]/_components/editor-canvas";

type Props = {};
const Page = (props: Props) => {
    return (
        <div className="h-full">
            <EditorProvider>
                <ConnectionsProvider>
                    <EditorCanvas />
                </ConnectionsProvider>
            </EditorProvider>
        </div>
    );
};
export default Page;
