import { CircularProgress, Dialog } from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
};

const LoadingDialog: React.FC<Props> = ({ open }) => {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      PaperComponent={({ children }) => children}
    >
      <CircularProgress color="inherit" size={60} thickness={5} />
    </Dialog>
  );
};

export default LoadingDialog;
