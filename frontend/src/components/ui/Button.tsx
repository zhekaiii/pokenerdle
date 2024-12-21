import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg]:tw-size-4 [&_svg]:tw-shrink-0",
  {
    variants: {
      variant: {
        default:
          "tw-bg-primary tw-text-primary-foreground tw-shadow hover:tw-bg-primary/90",
        destructive:
          "tw-bg-destructive tw-text-destructive-foreground tw-shadow-sm hover:tw-bg-destructive/90",
        outline:
          "tw-border tw-border-input tw-bg-background tw-shadow-sm hover:tw-bg-accent hover:tw-text-accent-foreground",
        secondary:
          "tw-bg-secondary tw-text-secondary-foreground tw-shadow-sm hover:tw-bg-secondary/80",
        ghost: "hover:tw-bg-accent hover:tw-text-accent-foreground",
        link: "tw-text-primary tw-underline-offset-4 hover:tw-underline",
        transparent: "tw-bg-transparent tw-text-primary",
      },
      size: {
        default: "tw-h-9 tw-px-4 tw-py-2",
        sm: "tw-h-8 tw-rounded-md tw-px-3 tw-text-xs",
        lg: "tw-h-10 tw-rounded-md tw-px-8",
        icon: "tw-h-9 tw-w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
};

export { Button, buttonVariants };
