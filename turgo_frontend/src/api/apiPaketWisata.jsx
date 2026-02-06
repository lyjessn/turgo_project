import axiosClient from "./axiosClient";

export const getAllPaketWisata = async () => {
  const res = await axiosClient.get("/paket-wisata");
  return res.data;
};

export const getDetailPaketWisata = async (id) => {
  const res = await axiosClient.get(`/paket-wisata/${id}`);
  return res.data;
};

export const createPaketWisata = async (formData) => {
  const res = await axiosClient.post("/paket-wisata", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const updatePaketWisata = async (id, formData) => {
  const res = await axiosClient.post(
    `/paket-wisata/${id}?_method=PUT`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const deletePaketWisata = async (id) => {
  const res = await axiosClient.delete(`/paket-wisata/${id}`);
  return res.data;
};
