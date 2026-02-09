import axiosClient from './axiosClient';

export const createBooking = async (formData) => {
  const res = await axiosClient.post('/booking', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await axiosClient.post(`/booking/${id}/status`, {
    status_pemesanan: status,
  });
  return res.data;
};

export const getBookingDetail = async (id) => {
  const res = await axiosClient.get(`/booking/${id}`);
  return res.data;
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

export const assignTourGuide = async (id, tourGuideId) => {
  const res = await axiosClient.post(`/booking/${id}/assign-tour-guide`, {
    tour_guide_id: tourGuideId,
  });
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axiosClient.delete(`/booking/${id}`);
  return res.data;
};

export const getTourGuideBookings = async () => {
  const res = await axiosClient.get('/booking/provider/tour-guide');
  return res.data;
};

export const getHomestayBookings = async () => {
  const res = await axiosClient.get('/booking/provider/homestay');
  return res.data;
};

export const getPelakuWisataBookings = async () => {
  const res = await axiosClient.get('/booking/provider/pelaku-wisata');
  return res.data;
};
