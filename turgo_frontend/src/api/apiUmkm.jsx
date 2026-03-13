import axiosClient from './axiosClient';

export const getAllUmkm = async () => {
  try {
    const res = await axiosClient.get(`/umkm`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
  
};

export const getAllUmkmAdmin = async () => {
  try {
    const res = await axiosClient.get(`/admin/umkm`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllUsersUmkm = async () => {
  try {
    const res = await axiosClient.get(`/admin/users-umkm`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export const getDetailUmkm = async (id) => {
  try {
    const res = await axiosClient.get(`/umkm/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const createUmkm = async (formData) => {
   try {
    const res = await axiosClient.post(`/umkm`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateUmkm = async (id, formData) => {
   try {
    const res = await axiosClient.post(`/umkm/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteUmkm = async (id) => {
   try {
    const res = await axiosClient.delete(`/umkm/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getMyUmkm = async () => {
  try {
    const res = await axiosClient.get("/my-umkm");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
