import { useEffect, useState } from "react";
import { FiSearch, FiDownload, FiEye, FiX } from "react-icons/fi";
import { downloadRekapCsv } from "../../api/apiRiwayatSaldo";
import "../adminDanOwner/css/AdminShared.css";

const PenghasilanMitra = ({ title, fetchFunction }) => {

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");

  const [periode,setPeriode] = useState("bulan_ini");

  const [bulan,setBulan] = useState("all");
  const [tahun,setTahun] = useState(new Date().getFullYear());

  const [page,setPage] = useState(1);
  const itemsPerPage = 10;

  const [showDetail,setShowDetail] = useState(false);
  const [selectedBooking,setSelectedBooking] = useState(null);

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
      console.log(res.data);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    setPage(1);
  },[search,periode,bulan]);

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate()-7);

  const filteredData = data.filter(d => {

    const nama = d.booking?.user?.nama_lengkap?.toLowerCase() || "";
    const cocokSearch = nama.includes(search.toLowerCase());

    if(!cocokSearch) return false;

    const tanggal = new Date(d.tanggal);

    if(periode === "hari_ini"){
      return tanggal.toDateString() === today.toDateString();
    }

    if(periode === "7_hari"){
      return tanggal >= sevenDaysAgo && tanggal <= today;
    }

    if(periode === "bulan_ini"){
      return tanggal.getMonth() === today.getMonth()
      && tanggal.getFullYear() === today.getFullYear();
    }

    if(periode === "bulan"){
      return bulan === "all"
      || tanggal.getMonth()+1 === Number(bulan);
    }

    return true;

  });

  const totalPages = Math.ceil(filteredData.length/itemsPerPage);

  const paginatedData = filteredData.slice(
    (page-1)*itemsPerPage,
    page*itemsPerPage
  );

  const totalPeriode = filteredData.reduce(
    (sum,item)=>sum+Number(item.jumlah),0
  );

  const getPeriodeLabel = () => {
    if(periode==="hari_ini") return "Hari Ini";
    if(periode==="7_hari") return "7 Hari Terakhir";
    if(periode==="bulan_ini") return "Bulan Ini";
    if (periode === "bulan") {
    if (bulan === "all") return "Semua Bulan";
      return `Bulan ${bulanList[bulan - 1]}`;
    }
    return "Periode";
  };

  const handleDownload = () => {
    downloadRekapCsv(bulan,tahun);
  };

  if(loading) return <div>Loading...</div>;

  return(
    <>

    <div className="admin-page">

      <div className="admin-header">
        <h1>{title}</h1>

        <div className="admin-header-actions">

          <select
            className="btn-secondary"
            value={periode}
            onChange={(e)=>setPeriode(e.target.value)}
          >
            <option value="hari_ini">Hari Ini</option>
            <option value="7_hari">7 Hari Terakhir</option>
            <option value="bulan_ini">Bulan Ini</option>
            <option value="bulan">Pilih Bulan</option>
          </select>

          {periode==="bulan" && (
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
          )}

          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={filteredData.length === 0}
          >
            <FiDownload /> Download CSV
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

      <div className="stats-grid">

        <div className="stat-card">
          <h4>Total Penghasilan</h4>
          <p>
            Rp {data.reduce((sum,item)=>sum+Number(item.jumlah),0)
            .toLocaleString("id-ID")}
          </p>
        </div>

        <div className="stat-card">
          <h4>{getPeriodeLabel()}</h4>
          <p>
            Rp {totalPeriode.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="stat-card">
          <h4>Booking Selesai</h4>
          <p>{filteredData.length}</p>
        </div>

      </div>

      <div className="admin-table-wrapper">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Nama Pemesan</th>
              <th>Tanggal Cair</th>
              <th>Penghasilan</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">

                    <div className="empty-icon">📭</div>

                    <h3>
                      {data.length === 0
                        ? "Belum ada data penghasilan"
                        : "Tidak ada data ditemukan"}
                    </h3>

                    <p>
                      {data.length === 0
                        ? "Data penghasilan akan muncul setelah ada transaksi selesai."
                        : "Coba ubah filter atau kata kunci pencarian."}
                    </p>

                    {data.length !== 0 && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setSearch("");
                          setPeriode("bulan_ini");
                          setBulan("all");
                        }}
                      >
                        Reset Filter
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ) : (

              paginatedData.map(item => (
                <tr key={item.id}>
                  <td>{item.booking?.id}</td>
                  <td>{item.booking?.user?.nama_lengkap}</td>
                  <td>
                    {new Date(item.tanggal)
                      .toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    Rp {Number(item.jumlah)
                    .toLocaleString("id-ID")}
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={()=>{
                        setSelectedBooking(item.booking);
                        console.log(item.booking);
                        setShowDetail(true);
                      }}
                    >
                      <FiEye/>
                    </button>
                  </td>
                </tr>
              ))

            )}

          </tbody>

        </table>

      </div>

      {totalPages>1 && (

        <div className="admin-pagination">

          <button
            disabled={page===1}
            onClick={()=>setPage(page-1)}
          >
            Prev
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page===totalPages}
            onClick={()=>setPage(page+1)}
          >
            Next
          </button>

        </div>

      )}

    </div>

    {showDetail && selectedBooking && (
      <div className="modal-overlay">

        <div className="modal">
  
          <div className="modal-header">
            <h2>Detail Booking</h2>

            <button
              className="btn-icon"
              onClick={()=>setShowDetail(false)}
            >
              <FiX/>
            </button>
          </div>

          <div className="modal-body">

            <p><b>ID:</b> {selectedBooking.id}</p>
            <p><b>Nama Pemesan:</b> {selectedBooking.user?.nama_lengkap}</p>

            <p>
              <b>Tanggal:</b> {selectedBooking.tanggal_mulai} - {selectedBooking.tanggal_selesai}
            </p>

            <p>
              <b>Status:</b> {selectedBooking.status_pemesanan}
            </p>

            <p>
              <b>Total:</b> Rp {Number(selectedBooking.total_harga || 0).toLocaleString("id-ID")}
            </p>

            {selectedBooking.tipe_booking === "paket_wisata" && (
              <>
                <p>
                  <b>Paket Wisata:</b>{" "}
                  {selectedBooking.paket_wisata_details?.paket_wisata?.nama || "-"}
                </p>

                <p>
                  <b>Jumlah Orang:</b>{" "}
                  {selectedBooking.paket_wisata_details?.jumlah_orang || "-"}
                </p>
              </>
            )}

            {selectedBooking.tipe_booking === "homestay" && (
              <>
                <p>
                  <b>Kamar:</b> {selectedBooking.homestay_details?.kamar?.nama}
                </p>
              </>
            )}

            {selectedBooking.tipe_booking === "tour_guide" && (
              <>
                <p>
                  <b>Tour Guide:</b>{" "}
                  {selectedBooking.tour_guide_details?.tour_guide?.user?.nama_lengkap || "-"}
                </p>

                <p>
                  <b>Durasi:</b>{" "}
                  {selectedBooking.tour_guide_details?.durasi || "-"}
                </p>

                <p>
                  <b>Sesi:</b>{" "}
                  {selectedBooking.tour_guide_details?.sesi || "-"}
                </p>
              </>
            )}

            {selectedBooking.tipe_booking === "custom" && (
              <>
                <p><b>Paket Dipilih:</b></p>

                <ul>
                  {selectedBooking.custom_details?.map((detail, index) => (
                    <li key={index}>
                      {detail.paket_wisata?.nama}
                    </li>
                  ))}
                </ul>

                <p>
                  <b>Jumlah Orang:</b>{" "}
                  {selectedBooking.custom_details?.[0]?.jumlah_orang || "-"}
                </p>

                <p>
                  <b>Jenis Tour Guide:</b>{" "}
                  {selectedBooking.custom_details?.[0]?.jenis_tour_guide || "-"}
                </p>
              </>
            )}

          </div>
  
        </div>
  
      </div>
  
    )}

  </>
  );

};

export default PenghasilanMitra;