import axiosClient from './axiosClient';

export const getAllMitra = async () => {
  try {
    const res = await axiosClient.get("/mitra");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateUser = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/user/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return res.data;

  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateProfile = async (formData) => {
  try {
    const res = await axiosClient.post("/profile/update", formData);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllPengunjung = async () => {
  try {
    const res = await axiosClient.get("/pengunjung");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updatePengunjung = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/pengunjung/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await axiosClient.delete(`/user/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Gagal delete user" };
  }
};