import { useEffect, useState, useMemo } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiClock } from "react-icons/fi";
import { useAuth } from "../../auth/useAuth";
import "../adminDanOwner/css/AdminShared.css";
import "../adminDanOwner/css/BudayaDanUmkm.css";
import "./PaketSaya.css";

import { getMyCreatedPakets, getMyJoinedPakets, updatePaketWisata  } from "../../api/apiPaketWisata";

const PaketSaya = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = user?.role?.name;
    const userId = user?.id;
    const [data,setData] = useState([]);
    const [loading,setLoading] = useState(true);

    const [search,setSearch] = useState("");
    const [filter,setFilter] = useState("semua");

    const [createdPakets,setCreatedPakets] = useState([]);
    const [joinedPakets,setJoinedPakets] = useState([]);

  useEffect(()=>{
    fetchData();
  },[]);

  const fetchData = async () => {
    try{
        const created = await getMyCreatedPakets();
        const joined = await getMyJoinedPakets();

        setCreatedPakets(created.data);
        setJoinedPakets(joined.data);

        const combined = [
        ...created.data.map(p => ({...p, type:"dibuat"})),
        ...joined.data.map(p => ({...p, type:"ikut"}))
        ];

        setData(combined);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }

  };

  const filteredData = useMemo(()=>{

    let result = [...data];

    if(filter === "dibuat"){
        result = result.filter(d => d.type === "dibuat");
    }

    if(filter === "ikut"){
        result = result.filter(d => d.type === "ikut");
    }

    if(search){
        result = result.filter(d =>
        d.nama.toLowerCase().includes(search.toLowerCase())
        );
    }

    return result;

  },[data,filter,search]);

  const toggleStatus = async (item) => {

    const formData = new FormData();

    formData.append(
        "is_aktif",
        item.is_aktif == 1 ? 0 : 1
    );

    await updatePaketWisata(item.id, formData);

    setData(prev =>
        prev.map(p =>
        p.id == item.id
            ? {...p, is_aktif: p.is_aktif == 1 ? 0 : 1}
            : p
        )
    );
  };

  if(loading) return <div>Loading...</div>;

  return (

    <div className="admin-page">

      <div className="admin-header">

        <h1>Paket Saya</h1>

        <div className="admin-header-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard/paket-wisata/tambah")}
            >
              + Tambah
            </button>

          <div className="admin-search-wrapper">
            <FiSearch/>
            <input
              placeholder="Cari paket wisata..."
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
          className={filter==="dibuat" ? "active":""}
          onClick={()=>setFilter("dibuat")}
        >
          Saya Buat
        </button>

        <button
          className={filter==="ikut" ? "active":""}
          onClick={()=>setFilter("ikut")}
        >
          Saya Ikut
        </button>

      </div>

      <div className="paket-list">

        {filteredData.map(item => (

        <div key={item.id} className="paket-card">

            <div className="paket-image">

            <img
                src={`${BASE_URL}/storage/${item.url_thumbnail}`}
            />

            {(role === "admin" ||
                role === "owner" ||
                item.id_pembuat == userId) && (
                <label className="switch">
                  <input
                      type="checkbox"
                      checked={item.is_aktif == 1}
                      onChange={() => toggleStatus(item)}
                  />
                  <span className="slider"></span>
                </label>
            )}
            </div>

            <div className="paket-content">

            <h3>{item.nama}</h3>

            <div className="paket-desc">

                <div className="paket-info">
                <FiMapPin/> {item.lokasi}
                </div>

                <div className="paket-info">
                <FiClock/> {item.durasi}
                </div>

                <div className="paket-info">
                ⭐ {Number(item.ratings_avg_bintang || 0).toFixed(1)} | {item.booking_details_count} booking
                </div>

            </div>

            <div className="paket-actions">

                <button
                  className="btn-detail"
                  onClick={() => navigate(`/dashboard/paket-wisata/${item.id}`)}
                >
                  Detail
                </button>

                {item.type === "dibuat" && (
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/dashboard/paket-wisata/edit/${item.id}`)}
                >
                  Edit
                </button>
              )}

            </div>

            </div>

        </div>

        ))}

        </div>

    </div>

  );

};

export default PaketSaya;