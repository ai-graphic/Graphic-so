import React from "react"
import Link from "next/link"
import { PlusIcon, Twitter, } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "./ui/button"
import { NextIcon, SupabaseIcon } from "@/components/ui/icons"

export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center md:items-start md:px-2 justify-center gap-2 md:ml-12">
      <div className="flex items-center space-x-2">
        <h1 className="text-5xl font-black text-left">Graphic.so</h1>
        <Badge
          variant="outline"
          className="border border-primary/10 hidden md:block"
        >
          <span className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse mr-1"></span>
         Try now
        </Badge>
      </div>
      <div className="flex flex-col items-center md:items-start md:mt-4">
        <Badge className="hidden md:block" variant="default">
           A No-code Automation Tool
        </Badge>
        <div className="flex w-full items-center mt-2 justify-center md:justify-start">
          <NextIcon className="hidden md:block size-4" />
          <span className="mx-2 text-xl font-bold text-left">
            Automate your workflows
          </span>
          <SupabaseIcon className="hidden md:block size-4" />
        </div>
        <p className="mt-2 text-center md:text-left text-muted-foreground text-sm md:text-base px-2">
          Streamline complex workflows in marketing, sales, operations, and IT with a powerful, no-code platform. 
          Leverage AI technologies to make automation more accessible and cost-effective.
        </p>
      </div>
      <div className="flex mt-4 mb-4 space-x-4">
        <Button variant="secondary" asChild>
          <Link href="https://discord.gg/WyMzrAAjvU" className="flex items-center text-black">
            <PlusIcon className="size-4 mr-1" />
            Join Discord
          </Link>
        </Button>
        <a
          href="https://x.com/seshubon"
          target="_blank"
          rel="noreferrer"
          className="flex items-center"
        >
          <Twitter className="size-4 mr-1" />
          updates
        </a>
      </div>
      {children}
    </div>
  )
}
