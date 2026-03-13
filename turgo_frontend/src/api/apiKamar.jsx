import axiosClient from './axiosClient';

export const createKamar = async (formData) => {
  try {
    const res = await axiosClient.post(`/kamar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateKamar = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/kamar/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteKamar = async (id) => {
   try {
    const res = await axiosClient.delete(`/kamar/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const toggleKamar = async (id) => {
   try {
    const res = await axiosClient.post(`/kamar/${id}/toggle`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getMyKamars = async () => {
  try {
    const res = await axiosClient.get("/homestay/my-kamars");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  } 
};