import axiosClient from "./axiosClient";

export const getAllHomestay = async () => {
  const res = await axiosClient.get("/homestay");
  return res.data;
};

export const getDetailHomestay = async (id) => {
  const res = await axiosClient.get(`/homestay/${id}`);
  return res.data;
};

export const createHomestay = async (formData) => {
  const res = await axiosClient.post("/homestay", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateHomestay = async (id, formData) => {
  const res = await axiosClient.post(`/homestay/${id}?_method=PUT`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const toggleHomestay = async (id) => {
  const res = await axiosClient.post(`/homestay/${id}/toggle`);
  return res.data;
};

export const deleteHomestay = async (id) => {
  const res = await axiosClient.delete(`/homestay/${id}`);
  return res.data;
};
