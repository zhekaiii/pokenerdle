import { Button } from "@/components/ui/Button";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import PageContainer from "./PageContainer";

export const ErrorPage: React.FC<{ error: unknown }> = ({ error }) => {
  const [isHidden, setIsHidden] = useState(true);
  return (
    <PageContainer>
      <h1 className="tw:font-bold">Oops! Something went wrong.</h1>
      <p className="tw:mb-8">
        We&apos;re sorry for the inconvenience. Please try refreshing the page
        or going back to the home page.
      </p>
      {!!error && (
        <p className="tw:my-8 tw:border-destructive tw:text-destructive tw:border-1 tw:rounded-md tw:p-2 tw:whitespace-pre-wrap">
          <button
            className="tw:block tw:text-foreground tw:flex tw:items-center tw:gap-2 tw:text-sm"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? "Show" : "Hide"} Error
            <ChevronDown
              className={clsx(
                "tw:size-4 tw:transition-transform",
                !isHidden && "tw:rotate-180"
              )}
            />
          </button>
          {!isHidden && (error instanceof Error ? error.stack : String(error))}
        </p>
      )}
      <Button asChild>
        <a href="/">Home</a>
      </Button>
    </PageContainer>
  );
};
