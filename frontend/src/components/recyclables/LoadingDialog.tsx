import { Content } from "@radix-ui/react-dialog";
import { LoaderCircle } from "lucide-react";
import React from "react";
import { Dialog, DialogOverlay, DialogPortal } from "../ui/Dialog";

type Props = {
  open: boolean;
};

const LoadingDialog: React.FC<Props> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay />
        <Content className="tw-fixed tw-left-[50%] tw-top-[50%] tw-z-50 tw-translate-x-[-50%] tw-translate-y-[-50%]">
          <LoaderCircle size="40" className="tw-animate-spin" />
        </Content>
      </DialogPortal>
    </Dialog>
  );
};

export default LoadingDialog;
