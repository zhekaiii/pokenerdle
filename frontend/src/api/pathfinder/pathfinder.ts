import { PathFinderResponse } from "@pokenerdle/shared";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getChallenge: async () => {
    const { data } = await axiosInstance.get<PathFinderResponse>(
      "/v1/pathfinder/challenge"
    );
    return data;
  },
});
