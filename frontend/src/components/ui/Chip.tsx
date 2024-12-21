import { cn } from "@/lib/utils";
import React from "react";

const Chip = React.forwardRef<HTMLDivElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tw-inline-flex tw-items-center tw-space-x-2 tw-bg-gray-800 tw-rounded-full tw-px-3 tw-py-1",
          className
        )}
        {...props}
      />
    );
  }
);

export { Chip };
