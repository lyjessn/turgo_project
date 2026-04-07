import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiX } from "react-icons/fi";
import "../adminDanOwner/css/AdminShared.css";

const BookingMitra = ({ title, fetchFunction }) => {
  const navigate = useNavigate();

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("semua");
  const [showDetail,setShowDetail] = useState(false);
  const [selectedBooking,setSelectedBooking] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(()=>{
    fetchData();
  },[]);

  const fetchData = async () => {
    try {
      const res = await fetchFunction();

      console.log("API RESPONSE:", res);

      setData(res);

    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (item) => {
    if (item.tipe_booking === "paket_wisata") {
      return item.paket_wisata_details?.paket_wisata?.nama || "-";
    }

    if (item.tipe_booking === "homestay") {
      return item.homestay_details?.kamar?.nama || "-";
    }

    if (item.tipe_booking === "tour_guide") {
      return item.tour_guide_details?.tour_guide?.user?.nama_lengkap || "-";
    }

    if (item.tipe_booking === "custom") {
      const paketList = item.custom_details
        ?.map(d => d.paket_wisata?.nama)
        .filter(Boolean);

      if (!paketList || paketList.length === 0) return "-";

      if (paketList.length === 1) return paketList[0];

      return `${paketList[0]} +${paketList.length - 1} lainnya`;
    }

    return "-";
  };

  const filteredData = useMemo(()=>{

    let result = [...data];
    if(filter === "semua"){
      result = result.filter(d => d.status_pemesanan === "dikonfirmasi" || d.status_pemesanan === "selesai");
    }

    if(filter === "aktif"){
      result = result.filter(d => d.status_pemesanan === "dikonfirmasi");
    }

    if(filter === "selesai"){
      result = result.filter(d => d.status_pemesanan === "selesai");
    }

    if (search) {
      const keyword = search.toLowerCase();

      result = result.filter(d => {

        const namaUser = d.user?.nama_lengkap?.toLowerCase() || "";

        const namaProduk = getProductName(d)?.toLowerCase() || "";

        const customProduk = d.custom_details
          ?.map(cd => cd.paket_wisata?.nama?.toLowerCase())
          .join(" ") || "";

        return (
          namaUser.includes(keyword) ||
          namaProduk.includes(keyword) ||
          customProduk.includes(keyword)
        );
      });
    }

    return result;

  },[data,filter,search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if(loading) return <div>Loading...</div>;

  return (
    <>

    <div className="admin-page">

      <div className="admin-header">

        <h1>{title}</h1>

        <div className="admin-header-actions">

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

      <div className="admin-filter-group">

        <button
          className={filter==="semua" ? "active":""}
          onClick={()=>setFilter("semua")}
        >
          Semua
        </button>

        <button
          className={filter==="aktif" ? "active":""}
          onClick={()=>setFilter("aktif")}
        >
          Aktif
        </button>

        <button
          className={filter==="selesai" ? "active":""}
          onClick={()=>setFilter("selesai")}
        >
          Selesai
        </button>

      </div>

      <div className="admin-table-wrapper">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pemesan</th>
              <th>Produk</th>
              <th>Tanggal Kunjungan</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {paginatedData.map(item => (

              <tr key={item.id}>

                <td>{item.id}</td>
                <td>{item.user?.nama_lengkap}</td>
                <td>{getProductName(item)}</td>
                <td>{item.tanggal_mulai} - {item.tanggal_selesai}</td>
                <td>Rp {Number(item.total_harga).toLocaleString("id-ID")}</td>
                <td>{item.status_pemesanan}</td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={()=>{
                      setSelectedBooking(item);
                      setShowDetail(true);
                    }}
                  >
                    <FiEye/>
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {totalPages > 1 && (
          <div className="admin-pagination">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>

          </div>
        )}

      </div>

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
              <b>Total:</b> Rp {Number(selectedBooking.total_harga).toLocaleString("id-ID")}
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

export default BookingMitra;