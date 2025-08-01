import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "@/lib/utils";

const COLOR_VARAINTS = {
  primary: {
    root: "tw-bg-primary/20",
    indicator: "tw-bg-primary",
  },
  positive: {
    root: "tw-bg-positive/20",
    indicator: "tw-bg-positive",
  },
  destructive: {
    root: "tw-bg-destructive/20",
    indicator: "tw-bg-destructive",
  },
};

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  // Tailwind color
  color?: keyof typeof COLOR_VARAINTS;
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color = "primary", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "tw-relative tw-h-2 tw-w-full tw-overflow-hidden tw-rounded-full",
      COLOR_VARAINTS[color].root,
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "tw-h-full tw-w-full tw-flex-1 tw-transition-all",
        COLOR_VARAINTS[color].indicator
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
