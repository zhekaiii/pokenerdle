import { createRandomString } from "../utils/random.js";

const ongoingBattles = new Set();

export const generateRoomId = () => {
  while (true) {
    const roomId = createRandomString(8);
    if (ongoingBattles.has(roomId)) {
      continue;
    }
    ongoingBattles.add(roomId);
    return roomId;
  }
};
