import React from "react";

import { cn } from "@/lib/utils";

const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      "tw-rounded-xl tw-border tw-bg-card tw-text-card-foreground tw-shadow",
      className
    )}
    {...props}
  />
);

const CardHeader: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn("tw-flex tw-flex-col tw-space-y-1.5 tw-p-6", className)}
    {...props}
  />
);

const CardTitle: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      "tw-font-semibold tw-leading-none tw-tracking-tight",
      className
    )}
    {...props}
  />
);

const CardDescription: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn("tw-text-sm tw-text-muted-foreground", className)}
    {...props}
  />
);

const CardContent: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }
> = ({ className, ref, ...props }) => (
  <div ref={ref} className={cn("tw-p-6 tw-pt-0", className)} {...props} />
);

const CardFooter: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn("tw-flex tw-items-center tw-p-6 tw-pt-0", className)}
    {...props}
  />
);

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
