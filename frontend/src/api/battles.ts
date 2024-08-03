import axios from "axios";

export default {
  createBattleRoom: async () => {
    const { data } = await axios.post<string>("/v1/battles/room");
    return data;
  },
};
