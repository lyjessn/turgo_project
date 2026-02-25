import axiosClient from './axiosClient';

export const getGlobalBlockouts = async () => {
  const res = await axiosClient.get(`/blockout/global`);
  return res.data;
};

export const createGlobalBlockout = async (payload) => {
  const res = await axiosClient.post(`/blockout/global`, payload);
  return res.data;
};

export const updateGlobalBlockout = async (id, payload) => {
  const res = await axiosClient.put(`/blockout/global/${id}`, payload);
  return res.data;
};

export const deleteGlobalBlockout = async (id) => {
  const res = await axiosClient.delete(`/blockout/global/${id}`);
  return res.data;
};

export const getSpesifikBlockouts = async () => {
  const res = await axiosClient.get(`/blockout/spesifik`);
  return res.data;
};

export const createSpesifikBlockout = async (payload) => {
  const res = await axiosClient.post(`/blockout/spesifik`, payload);
  return res.data;
};

export const updateSpesifikBlockout = async (id, payload) => {
  const res = await axiosClient.put(`/blockout/spesifik/${id}`, payload);
  return res.data;
};

export const deleteSpesifikBlockout = async (id) => {
  const res = await axiosClient.delete(`/blockout/spesifik/${id}`);
  return res.data;
};
