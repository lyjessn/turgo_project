import axiosClient from './axiosClient';

export const getAllPelakuWisata = async () => {
  try{
    const res = await axiosClient.get(`/pelaku-wisata`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllUsersPelakuWisata = async () => {
  try {
    const res = await axiosClient.get(`/users-pelaku-wisata`);
    return res.data;
  } catch (err){
    throw err.response?.data || err;
  }
};

export const getDetailPelakuWisata = async (id) => {
  try {
    const res = await axiosClient.get(`/pelaku-wisata/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const createPelakuWisata = async (formData) => {
  const res = await axiosClient.post(`/pelaku-wisata`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

export const updatePelakuWisata = async (id, formData) => {
  const res = await axiosClient.post( `/pelaku-wisata/${id}?_method=PUT`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

export const deletePelakuWisata = async (id) => {
  const res = await axiosClient.delete(`/pelaku-wisata/${id}`);
  return res.data;
};

export const togglePelakuWisata = async (id) => {
  const res = await axiosClient.post(`/pelaku-wisata/${id}/toggle`);
  return res.data;
};
