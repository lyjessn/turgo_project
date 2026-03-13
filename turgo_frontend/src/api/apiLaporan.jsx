import axiosClient from "./axiosClient";

export const downloadLaporan = async (endpoint, params, filename = "laporan.pdf") => {
  try {

    const res = await axiosClient.get(`/laporan/${endpoint}`, {
      params: params,
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    const url = window.URL.createObjectURL(res.data);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    throw error;
  }
};