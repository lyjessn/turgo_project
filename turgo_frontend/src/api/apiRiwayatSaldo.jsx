import axiosClient from './axiosClient';

export const getMyIncome = async () => {
  try{
    const res = await axiosClient.get("/penghasilan");
    return res.data;
  }catch(err){
    throw err.response?.data || err;
  }
};

export const downloadRekapCsv = async (bulan, tahun) => {
  try {
    const res = await axiosClient.get(
      `/penghasilan/rekap-csv`,
      {
        params: { bulan, tahun },
        responseType: "blob"
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `rekap_penghasilan_${bulan}_${tahun}.csv`
    );

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    throw err.response?.data || err;
  }
};
