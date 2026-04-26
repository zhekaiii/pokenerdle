import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  fillColor?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      fillColor,
      rangeClassName,
      thumbClassName,
      trackClassName,
      ...props
    },
    ref,
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "tw:relative tw:flex tw:w-full tw:touch-none tw:select-none tw:items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "tw:relative tw:h-1.5 tw:w-full tw:grow tw:overflow-hidden tw:rounded-full tw:bg-primary/20",
          trackClassName,
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "tw:absolute tw:h-full tw:bg-primary tw:transition-colors",
            rangeClassName,
          )}
          style={fillColor ? { backgroundColor: fillColor } : undefined}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "tw:block tw:h-4 tw:w-4 tw:rounded-full tw:border tw:border-primary/50 tw:bg-background tw:shadow tw:transition-colors tw:focus-visible:outline-hidden tw:focus-visible:ring-1 tw:focus-visible:ring-ring tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:cursor-grab tw:active:cursor-grabbing",
          thumbClassName,
        )}
        style={fillColor ? { borderColor: fillColor } : undefined}
      />
    </SliderPrimitive.Root>
  ),
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
