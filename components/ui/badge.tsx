import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-cyan-800/70 bg-cyan-950/50 px-2 py-1 text-xs font-medium text-cyan-200",
        className
      )}
      {...props}
    />
  );
}
