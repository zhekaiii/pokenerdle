import { Button, OutlinedInput } from "@mui/material";
import React from "react";
import api from "../../api";

type Props = {
  setRoomCode: (roomCode: string) => void;
};

const Home: React.FC<Props> = ({ setRoomCode }) => {
  const onClickCreate = async () => {
    const roomId = await api.battles.createBattleRoom();
    setRoomCode(roomId);
  };

  return (
    <div className="tw-flex-col tw-flex tw-gap-2">
      <OutlinedInput placeholder="Room Code" />
      <Button variant="contained">Join Room</Button>
      <Button variant="contained" onClick={onClickCreate}>
        Create Room
      </Button>
    </div>
  );
};

export default Home;
