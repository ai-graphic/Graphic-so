"use client"

import { useEffect, useOptimistic, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PersonStanding, Tag, View } from "lucide-react"

import { cn } from "@/lib/utils"
import MinimalCard, {
  MinimalCardContent,
  MinimalCardDescription,
  MinimalCardFooter,
  MinimalCardImage,
  MinimalCardTitle,
} from "@/components/Landing-page/cult/minimal-card"


interface Product {
  id: string
  created_at: string
  full_name: string
  email: string
  twitter_handle: string
  product_website: string
  codename: string
  punchline: string
  description: string
  logo_src: string
  user_id: string
  tags: string[]
  view_count: number
  approved: boolean
  labels: string[]
  categories: string
}

export const ResourceCard: React.FC<{
  trim?: boolean
  data: Product
  order: any
}> = ({ trim, data, order }) => {
const [view_count, setViewCount] = useState(data.view_count)

  const initialCountSet = useRef(false);

  useEffect(() => {
    if (!initialCountSet.current) {
      const randomInitialCount = Math.floor(Math.random() * 1000) + 1;
      setViewCount(randomInitialCount);
      initialCountSet.current = true;
    }
  }, []); 


  const handleClick = () => {
    const newClickCount = (view_count || 0) + 1;
    setViewCount(newClickCount);
  }
  return (
    <div className="flex flex-wrap">
    <motion.div
      key={`resource-card-${data.id}-${order}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative   break-inside-avoid w-full flex-1"
    >
      <Link
        href={`/workflows/editor/${data.id}/chat`}
        key={`/workflows/editor/${data.id}/chat`}
        className=""
        onClick={handleClick}
      >
        <div className="w-full h-full">
          <MinimalCard
            className={cn(
              
              "w-full h-full"
            )}
          >
            {data.logo_src ? (
              <MinimalCardImage alt={data.codename} src={data.logo_src} />
            ) : null}

            <MinimalCardTitle
              className={cn(
                " font-semibold mb-0.5",
              )}
            >
              {data.codename.substring(0, 30)}
            </MinimalCardTitle>
            <MinimalCardDescription
              className={cn(
                "text-sm",
               
              )}
            >
              {trim ? `${data.description.slice(0, 82)}...` : data.description}
            </MinimalCardDescription>

            <MinimalCardContent />

            <MinimalCardFooter>
            <div
                className={cn(
                  "p-1 py-1.5 px-1.5 rounded-md text-neutral-500 flex items-center gap-1 absolute bottom-2 right-2 rounded-br-[16px]",
                 
                )}
              >
                <p className="flex items-center gap-1 tracking-tight text-neutral pr-1 text-xs">
                  {view_count}
                </p>
              </div>
            </MinimalCardFooter>
          </MinimalCard>
        </div>
      </Link>
    </motion.div>
    </div>
  )
}
