import { nanoid } from "@/lib/utils";
import type React from "react";
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings, Sparkles } from "lucide-react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const id = nanoid();

  return (
    <>
      <div className="flex flex-col h-screen justify-center items-center">
        <Sheet>
        <SheetTrigger className="absolute flex gap-2 z-50 w-fit text-black  hover:text-black dark:hover:bg-black dark:hover:text-white bg-white top-3 right-3 border border-gray-400 rounded-lg py-1 px-2 sm:z-100000">
        <span className="max-sm:hidden">Remix this workflow</span> <Sparkles size={24}/>
          </SheetTrigger>
         {children}
        </Sheet>
      </div>
    </>
  );
}
