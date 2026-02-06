import axiosClient from "./axiosClient";

export const getAllTourGuide = async () => {
  const res = await axiosClient.get("/tour-guide");
  return res.data;
};

export const getDetailTourGuide = async (id) => {
  const res = await axiosClient.get(`/tour-guide/${id}`);
  return res.data;
};

export const createTourGuide = async (formData) => {
  const res = await axiosClient.post("/tour-guide", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const updateTourGuide = async (id, formData) => {
  const res = await axiosClient.post(
    `/tour-guide/${id}?_method=PUT`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const toggleTourGuide = async (id) => {
  const res = await axiosClient.post(`/tour-guide/${id}/toggle`);
  return res.data;
};

export const deleteTourGuide = async (id) => {
  const res = await axiosClient.delete(`/tour-guide/${id}`);
  return res.data;
};
