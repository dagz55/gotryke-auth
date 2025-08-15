
"use client"

import { Resizable as ResizablePrimitive, ResizableProps, ResizeDirection } from "re-resizable"
import * as React from "react"

import { cn } from "@/lib/utils"

interface ResizablePanelGroupProps extends Omit<React.ComponentProps<"div">, "dir"> {
  direction?: "horizontal" | "vertical"
}

const ResizablePanelGroup = ({
  className,
  direction = "horizontal",
  ...props
}: ResizablePanelGroupProps) => (
  <div
    data-orientation={direction}
    className={cn(
      "flex h-full w-full data-[orientation=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = React.forwardRef<
    ResizablePrimitive,
    ResizableProps
>((props, ref) => (
    <ResizablePrimitive
        ref={ref}
        {...props}
    />
))
ResizablePanel.displayName = "ResizablePanel"


const ResizableHandle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        withHandle?: boolean
    }
>(({ withHandle, className, ...props }, ref) => (
    <div
      ref={ref}
      data-handle=""
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 [&[data-orientation=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <div className="h-2 w-px bg-muted-foreground" />
        </div>
      )}
    </div>
))
ResizableHandle.displayName = "ResizableHandle"


export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
