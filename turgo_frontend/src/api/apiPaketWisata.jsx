import axiosClient from "./axiosClient";

export const getHomepagePaketWisata = async () => {
  try {
    const res = await axiosClient.get(`/paket-wisata/homepage`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllPaketWisata = async () => {
  try {
    const res = await axiosClient.get(`/paket-wisata`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAllPaketWisataAdmin = async () => {
  try {
    const res = await axiosClient.get(`/admin/paket-wisata`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getDetailPaketWisata = async (id) => {
  try {
    const res = await axiosClient.get(`/paket-wisata/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const createPaketWisata = async (formData) => {
  try {
    const res = await axiosClient.post(`/paket-wisata`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updatePaketWisata = async (id, formData) => {
  try {
    const res = await axiosClient.post(`/paket-wisata/${id}?_method=PUT`, formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deletePaketWisata = async (id) => {
  try {
    const res = await axiosClient.delete(`/paket-wisata/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAvailablePaketWisata = async (date) => {
  try {
    const res = await axiosClient.get(`/paket-wisata/available?date=${date}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getMyCreatedPakets = async () => {
  const res = await axiosClient.get("/my-created");
  return res.data;
};

export const getMyJoinedPakets = async () => {
  const res = await axiosClient.get("/my-joined");
  return res.data;
};


