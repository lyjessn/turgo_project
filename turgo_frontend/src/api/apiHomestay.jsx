import axiosClient from "./axiosClient";

export const getHomepageHomestay = async () => {
  try {
    const res = await axiosClient.get(`/homestay/homepage`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllHomestay = async () => {
  try {
    const res = await axiosClient.get(`/homestay`);
    return res.data; 
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllUsersHomestay = async () => {
  try {
    const res = await axiosClient.get(`/users-homestay`);
    return res.data;
  } catch (err){
    throw err.response?.data || err;
  }
};

export const getDetailHomestay = async (id) => {
  try {
    const res = await axiosClient.get(`/homestay/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const createHomestay = async (formData) => {
  try {
    const res = await axiosClient.post(`/homestay`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateHomestay = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/homestay/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const toggleHomestay = async (id) => {
  try {
    const res = await axiosClient.post(`/homestay/${id}/toggle`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteHomestay = async (id) => {
  try {
    const res = await axiosClient.delete(`/homestay/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAvailableHomestay = async (checkIn, checkOut) => {
  try {
    const res = await axiosClient.get(`/homestay/available?check_in=${checkIn}&check_out=${checkOut}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getMyHomestay = async () => {
  try {
    const res = await axiosClient.get(`/my-homestay`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};