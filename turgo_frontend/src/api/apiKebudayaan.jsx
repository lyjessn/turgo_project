import axiosClient from './axiosClient';

export const getAllKebudayaan = async () => {
  const res = await axiosClient.get('/kebudayaan');
  return res.data;
};

export const getDetailKebudayaan = async (id) => {
  const res = await axiosClient.get(`/kebudayaan/${id}`);
  return res.data;
};

export const createKebudayaan = async (formData) => {
  const res = await axiosClient.post('/kebudayaan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateKebudayaan = async (id, formData) => {
  const res = await axiosClient.post(
    `/kebudayaan/${id}?_method=PUT`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
};

export const deleteKebudayaan = async (id) => {
  const res = await axiosClient.delete(`/kebudayaan/${id}`);
  return res.data;
};
