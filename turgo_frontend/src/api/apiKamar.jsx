import axiosClient from './axiosClient';

export const createKamar = async (formData) => {
  const res = await axiosClient.post(`/kamar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateKamar = async (id, formData) => {
  const res = await axiosClient.post(`/kamar/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
  });
  return res.data;
};

export const deleteKamar = async (id) => {
  const res = await axiosClient.delete(`/kamar/${id}`);
  return res.data;
};

export const toggleKamar = async (id) => {
  const res = await axiosClient.post(`/kamar/${id}/toggle`);
  return res.data;
};
