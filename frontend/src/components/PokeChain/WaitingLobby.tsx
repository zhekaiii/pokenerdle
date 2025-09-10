import { Button } from "@/components/ui/Button";
import { debounce } from "es-toolkit";
import { X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import classes from "./WaitingLobby.module.scss";

interface Props {
  roomCode: string;
  exitRoom: () => void;
}

const WaitingLobby: React.FC<Props> = ({ roomCode, exitRoom }) => {
  const [buttonLabel, setButtonLabel] = useState("Copy invite link");
  const shareLink = useMemo(() => {
    if (import.meta.env.SSR) return "";
    const url = new URL(location.href);
    url.searchParams.set("roomCode", roomCode);
    return url.toString();
  }, [roomCode]);

  const resetButtonLabel = useCallback(
    debounce(() => {
      setButtonLabel("Copy invite link");
    }, 4000),
    []
  );

  const onClickButton = () => {
    navigator.clipboard.writeText(shareLink);
    setButtonLabel("Copied!");
    resetButtonLabel();
  };

  return (
    <div className={classes["WaitingLobby__Card"]}>
      <Button
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        onClick={exitRoom}
        variant="transparent"
      >
        <X />
      </Button>
      <span className={classes["WaitingLobby__CardTitle"]}>
        Waiting for opponent to join room {"\n"}
        {roomCode}
      </span>
      <Button onClick={onClickButton} variant="secondary">
        {buttonLabel}
      </Button>
    </div>
  );
};

export default WaitingLobby;
