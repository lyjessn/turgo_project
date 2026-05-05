import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../utils/baseUrl";
import { getDetailHomestay } from "../../../api/apiHomestay";
import { updateKamar } from "../../../api/apiKamar";
import { FiWifi, FiX } from "react-icons/fi";
import { FaBed, FaBath } from "react-icons/fa";

import "../css/AdminShared.css";
import "../css/AdminHomestay.css";

const AdminHomestayDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedKamar,setSelectedKamar] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await getDetailHomestay(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleKamarStatus = async (kamar) => {
    try {

      const formData = new FormData();

      formData.append(
        "is_aktif",
        kamar.is_aktif === 1 ? 0 : 1
      );

      await updateKamar(kamar.id, formData);

      setData(prev => ({
        ...prev,
        kamars: prev.kamars.map(k =>
          k.id === kamar.id
            ? { ...k, is_aktif: k.is_aktif === 1 ? 0 : 1 }
            : k
        )
      }));

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;
  if (!data) return <div className="admin-page">Data tidak ditemukan</div>;

  const images = [
    data.url_thumbnail,
    ...(data.fotos?.map(f => f.url_foto) || [])
  ];

  return (
    <>
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-header">

        <h1>Detail Homestay</h1>

        <div className="admin-header-actions">

          <button
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate(`/dashboard/homestay/edit/${id}`)}
          >
            Edit
          </button>

        </div>

      </div>

      <div className="admin-detail-card">
        <div className="admin-homestay-gallery">

          <img
            src={`${BASE_URL}/storage/${images[currentImage]}`}
            className="admin-homestay-image"
            onClick={() =>
              setPreviewImage(
                `${BASE_URL}/storage/${images[currentImage]}`
              )
            }
          />

          {images.length > 1 && (
            <div className="admin-gallery-dots">

              {images.map((_, i) => (

                <span
                  key={i}
                  className={
                    i === currentImage
                      ? "admin-dot active"
                      : "admin-dot"
                  }
                  onClick={() => setCurrentImage(i)}
                />

              ))}

            </div>
          )}

        </div>
      </div>

      <div className="admin-detail-card">

        <h2 className="admin-section-title"> Informasi Homestay </h2>

        <div className="admin-info-grid">

          <div>
            <b>Nama</b>
            <p>{data.nama}</p>
          </div>

          <div>
            <b>Lokasi</b>
            <p>{data.lokasi}</p>
          </div>

          <div>
            <b>Check-in</b>
            <p>{data.check_in}</p>
          </div>

          <div>
            <b>Check-out</b>
            <p>{data.check_out}</p>
          </div>

          <div>
            <b>Aturan Rokok</b>
            <p>{data.rokok}</p>
          </div>

          <div>
            <b>Hewan Peliharaan</b>
            <p>{data.peliharaan}</p>
          </div>

          <div>
            <b>Status</b>
            <p>
              {data.is_aktif === 1 ? "Aktif" : "Nonaktif"}
            </p>
          </div>
           

        </div>

      </div>

      <div className="admin-detail-card">
        

        <h2 className="admin-section-title">
            Penilaian
        </h2>

        <div className="admin-info-grid">

            <div>
              <b>Rating Rata-rata</b>
              <p>
                  ⭐ {Number(data.ratings_avg_bintang ?? 0).toFixed(2)}
              </p>
            </div>

            <div>
              <b>Total Ulasan</b>
              <p>
                  {data.ratings_count ?? 0} ulasan
              </p>

              {(data.ratings_count ?? 0) > 0 && (
                  <button
                  className="btn-secondary"
                  onClick={() =>
                      navigate(`/dashboard/reviews/homestay/${id}`)
                  }
                  >
                  Lihat Ulasan
                  </button>
              )}
            </div>
        </div>

        <h2 className="admin-section-title">Daftar Kamar</h2>

        <div className="admin-kamar-list">

          {data.kamars?.map(kamar => (

            <div
              key={kamar.id}
              className="admin-kamar-card"
            >

              <img
                src={`${BASE_URL}/storage/${kamar.foto}`}
                className="admin-kamar-image"
                onClick={() =>
                  setPreviewImage(
                    `${BASE_URL}/storage/${kamar.foto}`
                  )
                }
              />

              <div className="admin-kamar-info">

                <div className="admin-kamar-header">

                  <div className="admin-kamar-nama">
                    {kamar.nama}
                  </div>

                  <div className="admin-kamar-harga">
                    Rp {Number(kamar.harga_per_malam)
                      .toLocaleString("id-ID")}
                    <span> / malam</span>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={kamar.is_aktif === 1}
                      onChange={() => toggleKamarStatus(kamar)}
                    />
                    <span className="slider"></span>
                  </label>

                </div>

                <div className="admin-kamar-fasilitas">

                  <div className="admin-kamar-item">
                    <FaBed />
                    <span>
                      {kamar.jumlah_kasur} kasur
                    </span>
                  </div>

                  <div className="admin-kamar-item">
                    <FaBath />
                    <span>
                      {kamar.jumlah_toilet} kamar mandi
                    </span>
                  </div>

                  <div className="admin-kamar-item">
                    <FiWifi />
                    <span>
                      {kamar.wifi || "Tidak ada wifi"}
                    </span>
                  </div>

                </div>

                {(kamar.deskripsi_kasur ||
                  kamar.deskripsi_toilet) && (

                  <div className="admin-kamar-deskripsi">

                    {kamar.deskripsi_kasur && (
                      <p>
                        <b>Kasur:</b> {kamar.deskripsi_kasur}
                      </p>
                    )}

                    {kamar.deskripsi_toilet && (
                      <p>
                        <b>Toilet:</b> {kamar.deskripsi_toilet}
                      </p>
                    )}

                  </div>

                )}

                <div className="admin-kamar-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedKamar(kamar)}
                  >
                    Detail
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

    {selectedKamar && (
      <div className="modal-overlay">
        <div className="modal">

          <div className="modal-header">
            <h3>Detail Kamar</h3>
            <span className="modal-close" onClick={()=>setSelectedKamar(null)}>✕</span>
          </div>

          <div className="modal-body">

            <img
              src={`${BASE_URL}/storage/${selectedKamar.foto}`}
              className="modal-image"
            />

            <h3>
              {selectedKamar.nama}
              <span>
                {" "}
                (Rp {Number(selectedKamar.harga_per_malam)
                .toLocaleString("id-ID")} / malam)
              </span>
            </h3>

            <p>
              <b>Jumlah Kasur:</b> {selectedKamar.jumlah_kasur} kasur 
            </p>
            {selectedKamar.deskripsi_kasur && (
              <p>
                <b>Deskripsi Kasur:</b> {selectedKamar.deskripsi_kasur}
              </p>
            )}

            <p>
              <b>Jumlah Kamar Mandi:</b> {selectedKamar.jumlah_toilet} kamar mandi
            </p>
            {selectedKamar.deskripsi_toilet && (
              <p>
                <b>Toilet:</b> {selectedKamar.deskripsi_toilet}
              </p>
            )}

            <p>
              <b>Wifi:</b> {selectedKamar.wifi || "Tidak ada wifi"}
            </p>
          </div>

        </div>

      </div>

    )}
    
    </>
  );
};

export default AdminHomestayDetail;