import { NoticePlacement, NoticeResponse } from "@pokenerdle/shared/notices";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  get: async (placement: NoticePlacement) => {
    const { data } = await axiosInstance.get<NoticeResponse>(
      `/v1/notices/${placement}`,
    );
    return data;
  },
});
