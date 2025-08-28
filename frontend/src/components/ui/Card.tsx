import * as React from "react";

import { cn } from "@/lib/utils";
import styles from "./Card.module.scss";

interface CardProps {
  responsive?: boolean;
}

function Card({
  className,
  responsive,
  ...props
}: React.ComponentProps<"div"> & CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "tw:bg-card tw:text-card-foreground tw:flex tw:flex-col tw:gap-(--card-spacing) tw:rounded-xl tw:border tw:py-(--card-spacing) tw:shadow-sm",
        styles["Card"],
        responsive && styles["Card--responsive"],
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "tw:@container/card-header tw:grid tw:auto-rows-min tw:grid-rows-[auto_auto] tw:items-start tw:gap-1.5 tw:px-(--card-spacing) tw:has-data-[slot=card-action]:grid-cols-[1fr_auto] tw:[.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("tw:leading-none tw:font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("tw:text-muted-foreground tw:text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "tw:col-start-2 tw:row-span-2 tw:row-start-1 tw:self-start tw:justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("tw:px-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "tw:flex tw:items-center tw:px-(--card-spacing) tw:[.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
