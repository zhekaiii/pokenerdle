import {
  StatGuessFilter,
  StatGuessFormatsResponse,
  StatGuessRoundResponse,
  filterToQueryString,
} from "@pokenerdle/shared";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getFormats: async () => {
    const { data } = await axiosInstance.get<StatGuessFormatsResponse>(
      "/v1/stat-guesser/formats",
    );
    return data;
  },
  getRound: async (filter: StatGuessFilter, excludeIds: number[]) => {
    const params = new URLSearchParams(filterToQueryString(filter));
    if (excludeIds.length > 0) {
      params.set("excludeIds", excludeIds.join(","));
    }
    const qs = params.toString();
    const { data } = await axiosInstance.get<StatGuessRoundResponse>(
      `/v1/stat-guesser/round${qs ? `?${qs}` : ""}`,
    );
    return data;
  },
});
