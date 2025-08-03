import { PathFinderResponse } from "@pokenerdle/shared";
import axios from "axios";

export default {
  getChallenge: async () => {
    const { data } = await axios.get<PathFinderResponse>(
      "/v1/pathfinder/challenge"
    );
    return data;
  },
};
