import { AI } from "@/lib/actions";
import { nanoid } from "@/lib/utils";
import type React from "react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const id = nanoid();

  return (
    <>
      <AI>
        <div className="flex flex-col min-h-screen">
          <main className="flex flex-col flex-1">{children}</main>
        </div>
      </AI>
    </>
  );
}
