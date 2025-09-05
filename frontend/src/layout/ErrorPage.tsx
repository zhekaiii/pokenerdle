import { Button } from "@/components/ui/Button";
import { Link } from "@tanstack/react-router";
import React from "react";
import PageContainer from "./PageContainer";

const ErrorBoundary: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="tw:font-bold">Oops! Something went wrong.</h1>
      <p className="tw:mb-8">
        We&apos;re sorry for the inconvenience. Please try refreshing the page
        or going back to the home page.
      </p>
      <Button asChild>
        <Link to="/" reloadDocument>
          Home
        </Link>
      </Button>
    </PageContainer>
  );
};

export default ErrorBoundary;
