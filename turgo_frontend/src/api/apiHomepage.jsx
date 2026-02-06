import axiosClient from "./axiosClient";

export const getHomepage = async () => {
  const res = await axiosClient.get("/homepage");
  return res.data;
};
