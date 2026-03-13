import { useEffect, useState } from "react";
import { FiSearch, FiDownload } from "react-icons/fi";
import { downloadRekapCsv } from "../../api/apiRiwayatSaldo";
import "../adminDanOwner/css/AdminShared.css";

const PenghasilanMitra = ({ title, fetchFunction }) => {

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [summary,setSummary] = useState(null);

  const [bulan,setBulan] = useState("all");
  const [tahun,setTahun] = useState(new Date().getFullYear());
  const bulanList = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

  useEffect(()=>{
    fetchData();
  },[]);

  const fetchData = async () => {
    try{
      const res = await fetchFunction();
      setData(res.data);
      setSummary(res.summary);

    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const getMonth = (date) => {
    return new Date(date).getMonth() + 1;
  };

  const handleDownload = () => {
    downloadRekapCsv(bulan,tahun);
  };

  const filteredData = data.filter(d => {
    const nama = d.booking?.user?.nama_lengkap?.toLowerCase() || "";
    const cocokSearch = nama.includes(search.toLowerCase());
    if(bulan === "all") return cocokSearch;
    const bulanSaldo = new Date(d.tanggal).getMonth() + 1

    return cocokSearch && bulanSaldo === Number(bulan);
  });


  if(loading) return <div>Loading...</div>;

  return(

    <div className="admin-page">
      <div className="admin-header">
        <h1>{title}</h1>

        <div className="admin-header-actions">

          <select
            className="btn-secondary"
            value={bulan}
            onChange={(e)=>setBulan(e.target.value)}
          >

            <option value="all">Semua</option>

            {bulanList.map((b,i)=>(
                <option key={i+1} value={i+1}>
                {b}
                </option>
            ))}

          </select>

          <button
            className="btn-primary"
            onClick={handleDownload}
          >
            <FiDownload/> Download Rekap CSV
          </button>

          <div className="admin-search-wrapper">
            <FiSearch/>
            <input
              placeholder="Cari pemesan..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </div>

        </div>

      </div>

      {summary && (

        <div className="stats-grid">

          <div className="stat-card">
            <h4>Total Penghasilan</h4>
            <p>
              Rp {Number(summary.total).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="stat-card">
            <h4>Bulan Ini</h4>
            <p>
              Rp {Number(summary.bulan_ini).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="stat-card">
            <h4>Booking Selesai</h4>
            <p>{summary.jumlah_booking}</p>
          </div>

        </div>

      )}

      <div className="admin-table-wrapper">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Nama Pemesan</th>
              <th>Tanggal Cair</th>
              <th>Penghasilan</th>
            </tr>
          </thead>

          <tbody>

            {filteredData.map(item => (
              <tr key={item.id}>
                <td>{item.booking?.id}</td>
                <td>{item.booking?.user?.nama_lengkap}</td>
                <td>{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                <td>Rp {Number(item.jumlah).toLocaleString("id-ID")}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
};

export default PenghasilanMitra;