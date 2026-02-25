import axiosClient from './axiosClient';

export const getAllUmkm = async () => {
  const res = await axiosClient.get(`/umkm`);
  return res.data;
};

export const getDetailUmkm = async (id) => {
  const res = await axiosClient.get(`/umkm/${id}`);
  return res.data;
};

export const createUmkm = async (formData) => {
  const res = await axiosClient.post(`/umkm`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

export const updateUmkm = async (id, formData) => {
  const res = await axiosClient.post(`/umkm/${id}?_method=PUT`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

export const toggleUmkm = async (id) => {
  const res = await axiosClient.post(`/umkm/${id}/toggle`);
  return res.data;
};

export const deleteUmkm = async (id) => {
  const res = await axiosClient.delete(`/umkm/${id}`);
  return res.data;
};
