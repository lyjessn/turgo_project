import axiosClient from "./axiosClient";

export const getHomepageHomestay = async () => {
  try {
    const res = await axiosClient.get(`/homestay/homepage`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllHomestay = async () => {
  try {
    const res = await axiosClient.get(`/homestay`);
    return res.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDetailHomestay = async (id) => {
  try {
    const res = await axiosClient.get(`/homestay/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
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
  } catch (error) {
    throw error.response?.data || error;
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
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleHomestay = async (id) => {
  try {
    const res = await axiosClient.post(`/homestay/${id}/toggle`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteHomestay = async (id) => {
  try {
    const res = await axiosClient.delete(`/homestay/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAvailableHomestay = async (checkIn, checkOut) => {
  try {
    const res = await axiosClient.get(`/homestay/available?check_in=${checkIn}&check_out=${checkOut}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }

};