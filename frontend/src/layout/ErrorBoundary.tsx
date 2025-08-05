import { Button } from "@/components/ui/Button";
import React from "react";
import { Link } from "react-router";
import PageContainer from "./PageContainer";

const ErrorBoundary: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="tw:text-3xl tw:font-bold">Oops! Something went wrong.</h1>
      <p className="tw:mb-8">
        We're sorry for the inconvenience. Please try refreshing the page or
        going back to the home page.
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
