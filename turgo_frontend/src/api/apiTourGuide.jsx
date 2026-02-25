import axiosClient from "./axiosClient";

export const getHomepageTourGuide = async () => {
  try {
    const res = await axiosClient.get(`/tour-guide/homepage`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllTourGuide = async () => {
  try {
    const res = await axiosClient.get(`/tour-guide`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDetailTourGuide = async (id) => {
  try {
    const res = await axiosClient.get(`/tour-guide/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createTourGuide = async (formData) => {
  try {
    const res = await axiosClient.post(`/tour-guide`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTourGuide = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/tour-guide/${id}?_method=PUT`,formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleTourGuide = async (id) => {
  try {
    const res = await axiosClient.post(`/tour-guide/${id}/toggle`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTourGuide = async (id) => {
  try {
    const res = await axiosClient.delete(`/tour-guide/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
  
};

export const getAvailableTourGuide = async (date) => {
  try {
    const res = await axiosClient.get(`/tour-guide/available?date=${date}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

  