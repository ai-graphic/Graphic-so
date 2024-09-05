import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
const InputButton = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="mt-2 flex w-full rounded-md ">
        <div
          className={cn(
            "relative w-full before:pointer-events-none before:absolute before:-inset-1 before:rounded-[9991px] before:border before:border-accent/20 before:opacity-0 before:ring-2 before:ring-neutral-100/40 before:transition dark:before:border-yellow-400/40 dark:before:ring-2 dark:before:ring-yellow-900/40",
            "input-shadow-glow after:pointer-events-none after:absolute after:inset-px after:rounded-[9987px] after:shadow-white/5 after:transition",
            "focus-within:before:opacity-100 focus-within:after:shadow-neutral-100/20 dark:after:shadow-white/5 dark:focus-within:after:shadow-yellow-500/30"
          )}
        >
          <input
            type="search"
            autoComplete="false"
            className={cn(
              "w-full  text-lg font-semibold",
              "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-stone-100 dark:focus:ring-neutral-900 ",
              "disabled:cursor-not-allowed disabled:opacity-50 sm:leading-6 ",
              "dark:border dark:border-black/40 ",
              "input-shadow rounded-[9988px] !outline-none",
              "relative border border-black/5 bg-white/90 py-4 pl-12 pr-7  shadow-black/5 placeholder:text-stone-400 focus:bg-white ",
              // " dark:bg-stone-950/50 dark:text-stone-200 dark:shadow-black/10 dark:placeholder:text-stone-500",
              " text-stone-800 dark:bg-neutral-800/70 dark:text-neutral-100 dark:shadow-black/10 dark:placeholder:text-stone-500",
              // "dark:focus:bg-neutral-900",
              className
            )}
            ref={ref}
            {...props}
          />
         
        </div>
        {children}
      </div>
    )
  }
)
InputButton.displayName = "InputButton"

export { Input, InputButton }
