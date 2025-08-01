import { Content } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LoaderCircle } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "../ui/Dialog";

type Props = {
  open: boolean;
};

const LoadingDialog: React.FC<Props> = ({ open }) => {
  return (
    <Dialog open={open}>
      <VisuallyHidden>
        <DialogTitle>Loading...</DialogTitle>
        <DialogDescription>
          Please wait while we load the content.
        </DialogDescription>
      </VisuallyHidden>
      <DialogPortal>
        <DialogOverlay />
        <Content className="tw:fixed tw:left-[50%] tw:top-[50%] tw:z-50 tw:translate-x-[-50%] tw:translate-y-[-50%]">
          <LoaderCircle size="40" className="tw:animate-spin" />
        </Content>
      </DialogPortal>
    </Dialog>
  );
};

export default LoadingDialog;
