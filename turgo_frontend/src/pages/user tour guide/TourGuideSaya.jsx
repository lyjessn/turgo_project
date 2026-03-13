import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { getMyTourGuide, updateTourGuide } from "../../api/apiTourGuide";
import { useNavigate } from "react-router-dom";

import { FiUsers, FiGlobe, FiStar, FiX } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";

import "../public/css/Detail.css";

const TourGuideSaya = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal,setShowEditModal] = useState(false);

  const [form,setForm] = useState({
    bio:"",
    harga_per_hari:"",
    bahasa:"",
    spesialisasi:"",
    kapasitas_min:"",
    kapasitas_max:"",
    foto_profil:null
  });

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {

      const res = await getMyTourGuide();
      console.log(res);
      setGuide(res);

      setForm({
        bio: res.bio || "",
        harga_per_hari: res.harga_per_hari,
        bahasa: res.bahasa,
        spesialisasi: res.spesialisasi,
        kapasitas_min: res.kapasitas_min,
        kapasitas_max: res.kapasitas_max,
        foto_profil: null
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {

        const formData = new FormData();

        Object.keys(form).forEach(key=>{
        if(form[key] !== null)
            formData.append(key,form[key]);
        });

        await updateTourGuide(guide.id,formData);

        setShowEditModal(false);
        fetchDetail();

    } catch(err){
        console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!guide) return <div>Tidak ada profil guide</div>;

  const hargaPerHari = Number(guide.harga_per_hari);

  const ratingAvg = Number(guide.ratings_avg_bintang ?? 0);
  const ratingCount = guide.ratings_count ?? 0;

  return (
    <>
    <div className="detail-container">

      <div style={{ textAlign: "center" }}>

        <img
          src={`http://127.0.0.1:8000/storage/${guide.foto_profil}`}
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 16
          }}
        />

        <h1 className="detail-title">
          {guide.user?.nama_lengkap}

          <span className="detail-rating">
            ⭐ {ratingAvg.toFixed(1)} ({ratingCount})
          </span>
        </h1>

        <button
            className="btn-primary"
            onClick={() => {
                setShowEditModal(true);
            }}
        >
            Edit Data Guide
        </button>

      </div>


      <div className="detail-section">
        <h2 className="detail-section-title">
          Perkenalan Singkat
        </h2>

        <p className="detail-description">
          {guide.bio}
        </p>
      </div>

      <div className="detail-section">

        <h2 className="detail-section-title">
          Informasi Tour Guide
        </h2>

        <div className="detail-info-list">

          <div className="detail-info-item">
            <BiMoney />
            <div>
              <b>Harga Per Hari</b>
              <p>
                Rp {hargaPerHari.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="detail-info-item">
            <FiUsers />
            <div>
              <b>Kapasitas</b>
              <p>
                {guide.kapasitas_min}-{guide.kapasitas_max} orang
              </p>
            </div>
          </div>

          <div className="detail-info-item">
            <FiGlobe />
            <div>
              <b>Bahasa</b>
              <p>{guide.bahasa}</p>
            </div>
          </div>

          <div className="detail-info-item">
            <FiStar />
            <div>
              <b>Spesialisasi</b>
              <p>{guide.spesialisasi}</p>
            </div>
          </div>

        </div>

      </div>


      {/* REVIEW */}

      <div className="detail-section">

        <h2 className="detail-section-title center">
          Penilaian & Ulasan
        </h2>

        <div
          className="review-subtitle"
          onClick={() =>
            navigate(`/dashboard/reviews/tour_guide/${guide.id}`)
          }
        >
          lihat semua ulasan
        </div>

      </div>

    </div>

    {showEditModal && (
        <div className="modal-overlay" onClick={()=>setShowEditModal(false)}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>

            <div className="modal-header">
                <h2>Edit Profil Tour Guide</h2>
                <FiX className="modal-close" onClick={() => setShowEditModal(false)}/>
            </div>

            <div className="modal-body column">

                <div className="form-group">
                    <label>Bio</label>
                    <textarea
                        value={form.bio}
                        onChange={(e)=>setForm({...form,bio:e.target.value})}
                    />
                </div>

                <div className="form-group">
                    <label>Harga per hari</label>
                    <input
                        type="number"
                        value={form.harga_per_hari}
                        onChange={(e)=>setForm({...form,harga_per_hari:e.target.value})}
                    />
                </div>

                <div className="form-group">
                    <label>Bahasa</label>
                    <input
                        value={form.bahasa}
                        onChange={(e)=>setForm({...form,bahasa:e.target.value})}
                    />
                </div>

                <div className="form-group">
                <label>Spesialisasi</label>
                <input
                    value={form.spesialisasi}
                    onChange={(e)=>setForm({...form,spesialisasi:e.target.value})}
                />
                </div>

                <div className="form-group">
                <label>Kapasitas Minimum</label>
                <input
                    type="number"
                    value={form.kapasitas_min}
                    onChange={(e)=>setForm({...form,kapasitas_min:e.target.value})}
                />
                </div>

                <div className="form-group">
                <label>Kapasitas Maksimum</label>
                <input
                    type="number"
                    value={form.kapasitas_max}
                    onChange={(e)=>setForm({...form,kapasitas_max:e.target.value})}
                />
                </div>

                <div className="form-group">
                <label>Foto Profil</label>
                <input
                    type="file"
                    onChange={(e)=>
                    setForm({...form,foto_profil:e.target.files[0]})
                    }
                />
                </div>

                <button
                className="btn-primary"
                onClick={handleUpdate}
                >
                Update
                </button>

            </div>

            </div>
        </div>
        )}

    </>
  );
};

export default TourGuideSaya;