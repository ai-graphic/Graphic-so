import type React from "react";
import { ReactFlowProvider } from "@xyflow/react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <>
      <div>
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </div>
    </>
  );
}
