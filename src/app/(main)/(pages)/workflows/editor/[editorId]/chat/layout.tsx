import { nanoid } from "@/lib/utils";
import type React from "react";
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const id = nanoid();

  return (
    <>
      <div className="flex flex-col h-screen justify-center items-center">
        <Sheet>
        <SheetTrigger className="absolute z-50 w-10 text-gray-400 hover:text-black dark:hover:text-white top-2 right-3 border border-gray-400 rounded-lg py-1 px-2 sm:z-100000">
            <Settings />
          </SheetTrigger>
         {children}
        </Sheet>
      </div>
    </>
  );
}
