import axiosClient from './axiosClient';

export const createBooking = async (formData) => {
  try {
    const res = await axiosClient.post(`/booking`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const confirmPayment = async (bookingId, formData) => {
  try {
    const res = await axiosClient.post(`/booking/${bookingId}/confirm-payment`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateBookingStatus = async (id, data) => {
  try {
    const res = await axiosClient.post(
      `/booking/${id}/status`,
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBookingDetail = async (id) => {
  try {
    const res = await axiosClient.get(`/booking/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }

};

export const getMyActiveBookings = async () => {
  const res = await axiosClient.get('/booking/my/active');
  return res.data;
};

export const getMyBookingHistory = async () => {
  const res = await axiosClient.get('/booking/my/history');
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await axiosClient.post(`/booking/${id}/cancel`);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await axiosClient.get('/booking');
  return res.data;
};

export const getAdminBookings = async () => {
  try {
    const res = await axiosClient.get("/admin/bookings");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const sendBookingEmail = async (id, title, message) => {
  try {
    const res = await axiosClient.post(`/booking/${id}/send-email`, {
      title,
      message
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
  
};

export const assignTourGuide = async (id, tourGuideId) => {
  try {
    const res = await axiosClient.post(`/booking/${id}/assign-tour-guide`, {
      tour_guide_id: tourGuideId,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteBooking = async (id) => {
  const res = await axiosClient.delete(`/booking/${id}`);
  return res.data;
};

export const getTourGuideBookings = async () => {
  try {
    const res = await axiosClient.get('/tour-guide/my-bookings');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getHomestayBookings = async () => {
  try {
    const res = await axiosClient.get('/homestay/my-bookings');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getPelakuWisataBookings = async () => {
  try {
    const res = await axiosClient.get('/pelaku-wisata/my-bookings');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

