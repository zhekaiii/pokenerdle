import { cn } from "@/lib/utils";
import React from "react";

const Chip: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "tw:inline-flex tw:items-center tw:space-x-2 tw:bg-gray-800 tw:rounded-full tw:px-3 tw:py-1",
        className
      )}
      {...props}
    />
  );
};

export { Chip };
