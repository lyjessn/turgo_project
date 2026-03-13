import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDetailPaketWisata } from "../../../api/apiPaketWisata";
import { useAuth } from "../../../auth/useAuth";

import { FiClock, FiMapPin, FiUsers } from "react-icons/fi";

import "../css/AdminShared.css";
import "../css/AdminHomestay.css";
import "../css/AdminPaketWisata.css";

const AdminPaketWisataDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data,setData] = useState(null);
    const [loading,setLoading] = useState(true);
    const [currentImage,setCurrentImage] = useState(0);
  
    useEffect(()=>{
      fetchData();
    },[id]);
  
    const fetchData = async () => {
      try{
        const res = await getDetailPaketWisata(id);
        setData(res.data);
      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }
    };
  
    if(loading) return <div className="admin-page">Loading...</div>;
    if(!data) return <div className="admin-page">Data tidak ditemukan</div>;
  
    const images = [
      data.url_thumbnail,
      ...(data.fotos?.map(f=>f.url_foto).filter(f=>f !== data.url_thumbnail) || [])
    ];
  
    return (
  
      <div className="admin-page">
  
        <div className="admin-header">
  
          <div className="admin-paket-title">
            <h1>{data.nama}</h1>
          </div>
  
          <div className="admin-header-actions">
            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Kembali
            </button>

            
            <button
              className="btn-primary"
              onClick={() => navigate(`/dashboard/paket-wisata/edit/${id}`)}
            >
              Edit
            </button>
          </div>
  
        </div>
  
        <div className="admin-detail-card">
  
          <div className="admin-homestay-gallery">
  
            <img
              src={`http://127.0.0.1:8000/storage/${images[currentImage]}`}
              className="admin-homestay-image"
            />
  
            {images.length > 1 && (
  
              <div className="admin-gallery-dots">
  
                {images.map((_,i)=>(
                  <span
                    key={i}
                    className={i===currentImage ? "admin-dot active":"admin-dot"}
                    onClick={()=>setCurrentImage(i)}
                  />
                ))}
  
              </div>
  
            )}
  
          </div>
  
        </div>
  
  
        <div className="admin-detail-card">
  
          <h2 className="admin-section-title">
            Informasi Paket
          </h2>
  
          <div className="admin-info-grid">
  
            <div>
              <b>Harga</b>
              <p>
                Rp {Number(data.harga).toLocaleString("id-ID")} / orang
              </p>
            </div>
  
            <div>
              <b>Durasi</b>
              <p>{data.durasi}</p>
            </div>
  
            <div>
              <b>Lokasi</b>
              <p>{data.lokasi}</p>
            </div>
  
            <div>
              <b>Kapasitas</b>
              <p>
                {data.kapasitas_min} - {data.kapasitas_max} orang
              </p>
            </div>
  
          </div>
  
        </div>
  
        <div className="admin-detail-card">
  
          <h2 className="admin-section-title">
            Pelaku Paket Wisata
          </h2>
  
          <div className="admin-pelaku-list">
  
            {data.participants?.map((p)=>{
  
              let persentase = p.pivot?.persentase ?? 0;
  
              if(data.id_pembuat === user.id && p.id === user.id){
                persentase = 100;
              }
  
              return (
  
                <div
                  key={p.id}
                  className="admin-pelaku-card"
                >
  
                  <div className="pelaku-info">
  
                    <div className="pelaku-nama">
                      {p.nama_lengkap || p.username}
                    </div>
  
                    <div className="pelaku-username">
                      @{p.username}
                    </div>
  
                  </div>
  
                  <div className="pelaku-persentase">
                    {persentase}%
                  </div>
  
                </div>
  
              );
  
            })}
  
          </div>
  
        </div>
  
  
        <div className="admin-detail-card">
          <h2 className="admin-section-title">Deskripsi Paket</h2>
          <p>{data.deskripsi}</p>
        </div>
  
        <div className="admin-detail-card">
          <h2 className="admin-section-title">Penilaian</h2>
          <div className="admin-info-grid">
              <div>
                  <b>Rating Rata-rata</b>
                  <p>⭐ {Number(data.ratings_avg_bintang ?? 0).toFixed(2)}</p>
              </div>
  
              <div>
                  <b>Total Ulasan</b>
                  <p>{data.ratings_count ?? 0} ulasan</p>
                  {(data.ratings_count ?? 0) > 0 && (
                      <button
                      className="btn-secondary"
                      onClick={() =>
                          navigate(`/dashboard/reviews/paket_wisata/${id}`)
                      }
                      >
                      Lihat Ulasan
                      </button>
                  )}
              </div>
  
          </div>
  
        </div>
  
      </div>
  
    );
};

export default AdminPaketWisataDetail;