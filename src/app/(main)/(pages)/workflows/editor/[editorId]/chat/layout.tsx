import { nanoid } from "@/lib/utils";
import type React from "react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const id = nanoid();

  return (
    <>
      <div className="flex flex-col h-screen w-full justify-center items-center">
        <main className="flex flex-col mt-10 min-w-[70vh] flex-1">{children}</main>
      </div>
    </>
  );
}
