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
        <SheetTrigger className="absolute flex gap-2 z-50 w-fit bg-gradient-to-b from-[#8D22E1] to-[#F043FF] text-white shadow-[0_-4px_6px_2px_#8D22E1_inset,0_0_0_2px_#AF3DFF_inset,0_5px_11px_0_rgba(114,22,123,0.5)] transition-[box-shadow,opacity,transform] duration-200 active:scale-[0.99] active:shadow-[0_-4px_6px_2px_#8D22E1_inset,0_0_0_2px_#AF3DFF_inset,0_5px_11px_0_rgba(114,22,123,0.2)] rounded-full top-3 right-3 border border-gray-400  py-1 px-2 sm:z-100000">
        <span className="max-sm:hidden">Remix this workflow</span> <Sparkles size={24}/>
          </SheetTrigger>
         {children}
        </Sheet>
      </div>
    </>
  );
}
