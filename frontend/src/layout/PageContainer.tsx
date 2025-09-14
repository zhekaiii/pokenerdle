import { Toaster } from "@/components/ui/Sonner";
import useDetectKeyboardOpen from "@/hooks/useDetectKeyboardOpen";
import clsx from "clsx";
import React from "react";
import classes from "./PageContainer.module.scss";
interface Props {
  children: React.ReactNode;
}

const PageContainer: React.FC<Props> = ({ children }) => {
  const isKeyboardOpen = useDetectKeyboardOpen(undefined, false);

  return (
    <main
      className={clsx(
        classes.PageContainer,
        isKeyboardOpen && classes.KeyboardOpen
      )}
    >
      {children}
      <Toaster />
    </main>
  );
};

export default PageContainer;
