import { cn } from "@/lib/utils"

export function TextContentDisplay({
    content,
    className
  }: {
    content: string
    className?: string
  }) {
    return (
      <div className={cn('group relative flex items-start', className)}>
        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="prose break-words dark:prose-invert prose-p:leading-relaxed  prose-pre:p-0 mb-2 last:mb-0">
            {content}
          </p>
        </div>
      </div>
    )
  }