import { Button, OutlinedInput } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";

type Props = {
  socket?: Socket;
};

const MAX_ROOM_CODE_LENGTH = 8;

const Home: React.FC<Props> = ({ socket }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  useEffect(() => {
    if (!socket) return;
    socket.on("error", () => {
      setIsConnecting(false);
    });
  }, [socket]);

  const onClickCreate = async () => {
    if (isConnecting || !socket) return;
    setIsConnecting(true);
    api.battles.createBattleRoom(socket);
  };

  const onClickJoin = async () => {
    if (isConnecting || !socket) return;
    setIsConnecting(true);
    api.battles.joinRoom(socket, roomCodeInput);
  };

  return (
    <div className="tw-flex-col tw-flex tw-gap-2 tw-my-auto">
      <OutlinedInput
        placeholder="Room Code"
        disabled={isConnecting}
        value={roomCodeInput}
        onChange={(e) =>
          setRoomCodeInput(
            e.target.value.substring(0, MAX_ROOM_CODE_LENGTH).toUpperCase()
          )
        }
      />
      <Button variant="contained" disabled={isConnecting} onClick={onClickJoin}>
        Join Room
      </Button>
      <Button
        variant="contained"
        disabled={isConnecting}
        onClick={onClickCreate}
      >
        Create Room
      </Button>
    </div>
  );
};

export default Home;
