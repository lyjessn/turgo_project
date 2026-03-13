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

    if(search){
      result = result.filter(d =>
        d.user?.nama_lengkap
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return result;

  },[data,filter,search]);

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
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {filteredData.map(item => (

              <tr key={item.id}>

                <td>{item.id}</td>

                <td>{item.user?.nama_lengkap}</td>

                <td>
                  {item.tanggal_mulai} - {item.tanggal_selesai}
                </td>

                <td>
                  Rp {Number(item.total_harga).toLocaleString("id-ID")}
                </td>

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

            {/* HOMESTAY */}
            {selectedBooking.tipe_booking === "homestay" && (
              <>
                <p>
                  <b>Homestay:</b> {selectedBooking.homestayDetails?.[0]?.homestay?.nama}
                </p>

                <p>
                  <b>Kamar:</b> {selectedBooking.homestayDetails?.[0]?.kamar?.nama}
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