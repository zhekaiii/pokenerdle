import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "tw:fixed tw:top-15 tw:z-100 tw:flex tw:max-h-screen tw:w-full tw:flex-col-reverse tw:p-4 tw:sm:bottom-0 tw:sm:right-0 tw:sm:top-auto tw:sm:flex-col tw:md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "tw:group tw:pointer-events-auto tw:relative tw:flex tw:w-full tw:items-center tw:justify-between tw:space-x-2 tw:overflow-hidden tw:rounded-md tw:border tw:p-4 tw:pr-6 tw:shadow-lg tw:transition-all tw:data-[swipe=cancel]:translate-x-0 tw:data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) tw:data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) tw:data-[swipe=move]:transition-none tw:data-[state=open]:animate-in tw:data-[state=closed]:animate-out tw:data-[swipe=end]:animate-out tw:data-[state=closed]:fade-out-80 tw:data-[state=closed]:slide-out-to-right-full tw:data-[state=open]:slide-in-from-top-full tw:sm:data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "tw:border tw:bg-background tw:text-foreground",
        destructive:
          "tw:destructive tw:group tw:border-destructive tw:bg-destructive tw:text-white",
        positive: "tw:border-positive tw:bg-positive tw:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "tw:inline-flex tw:h-8 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-md tw:border tw:bg-transparent tw:px-3 tw:text-sm tw:font-medium tw:transition-colors tw:hover:bg-secondary tw:focus:outline-hidden tw:focus:ring-1 tw:focus:ring-ring tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:group-[.destructive]:border-muted/40 tw:hover:group-[.destructive]:border-destructive/30 tw:hover:group-[.destructive]:bg-destructive tw:hover:group-[.destructive]:text-white tw:focus:group-[.destructive]:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "tw:absolute tw:right-1 tw:top-1 tw:rounded-md tw:p-1 tw:text-foreground/50 tw:opacity-0 tw:transition-opacity tw:hover:text-foreground tw:focus:opacity-100 tw:focus:outline-hidden tw:focus:ring-1 tw:group-hover:opacity-100 tw:group-[.destructive]:text-red-300 tw:hover:group-[.destructive]:text-red-50 tw:focus:group-[.destructive]:ring-red-400 tw:focus:group-[.destructive]:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="tw:h-4 tw:w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("tw:text-sm tw:font-semibold tw:[&+div]:text-xs", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("tw:text-sm tw:opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastActionElement,
  type ToastProps,
};
