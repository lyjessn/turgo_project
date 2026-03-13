import axiosClient from './axiosClient';

export const getAllAdmin = async () => {
  try {
    const res = await axiosClient.get("/admin");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAdmin = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/admin/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return res.data;

  } catch (error) {
    throw error.response?.data || error;
  }
};