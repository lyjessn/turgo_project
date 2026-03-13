import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createBooking } from "../../api/apiBooking";
import { getDetailTourGuide } from "../../api/apiTourGuide";
import { useAuth } from "../../auth/useAuth";
import { FiUsers, FiGlobe, FiStar } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import "./css/Detail.css";

const TourGuideDetail = () => {

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [guide, setGuide] = useState(null);
  const [tanggal, setTanggal] = useState(location.state?.tanggal || "");
  const [durasi, setDurasi] = useState("full day");
  const [sesi, setSesi] = useState("pagi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await getDetailTourGuide(id);
      setGuide(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!guide) return <div>Tidak ditemukan</div>;

  const hargaPerHari = Number(guide.harga_per_hari);

  const total =
    durasi === "half day"
      ? hargaPerHari / 2
      : hargaPerHari;

  const ratingAvg = Number(guide.ratings_avg_bintang ?? 0);
  const ratingCount = guide.ratings_count ?? 0;

  const getTopReviews = () => {
    if (!guide?.ratings?.length)
      return [];

    const ratings = [...guide.ratings];

    const withReview = ratings
      .filter(r => r.review && r.review.trim() !== "")
      .sort((a, b) => b.bintang - a.bintang);

    if (withReview.length >= 3)
      return withReview.slice(0, 3);

    const highest = ratings
      .sort((a, b) => b.bintang - a.bintang);

    if (highest.length >= 3)
      return highest.slice(0, 3);

    const newest = ratings
      .sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

    if (newest.length >= 3)
      return newest.slice(0, 3);

    return ratings.slice(0, 3);
  };

  const reviews = getTopReviews();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split("T")[0];

  const handleBooking = async () => {

    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: `/tour-guide/${guide.id}`,
          tanggal,
          durasi,
          sesi
        }
      });
      return;
    }

    try {

      const formData = new FormData();

      formData.append("tour_guide_id", guide.id);
      formData.append("tanggal_mulai", tanggal);
      formData.append("tanggal_selesai", tanggal);
      formData.append("durasi", durasi);

      if (durasi === "half day") {
        formData.append("sesi", sesi);
      }

      const res = await createBooking(formData);

      navigate("/pembayaran", {
        state: {
          booking: res.data,
          paket: {
            nama: guide.user?.nama_lengkap,
            url_thumbnail: guide.foto_profil,
            harga: total
          },
          tanggal,
          jumlahOrang: null,
          total
        }
      });

    } catch (err) {
      alert(err.message || "Gagal membuat booking");
    }
  };

  return (
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

      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">
          Perkenalan Singkat
        </h2>

        <p className="detail-description"> {guide.bio} </p>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title"> Informasi Tour Guide </h2>

        <div className="detail-info-list">

            <div className="detail-info-item">
              <BiMoney />
              <div>
                  <b>Harga Booking Pemandu</b>
                  <p>
                  Rp {hargaPerHari.toLocaleString("id-ID")} / hari
                  </p>
              </div>
            </div>

            <div className="detail-info-item">
              <FiUsers />
              <div>
                  <b>Kapasitas</b>
                  <p>
                  {guide.kapasitas_min}-{guide.kapasitas_max} org
                  </p>
              </div>
            </div>

            <div className="detail-info-item">
              <FiGlobe />
              <div>
                  <b>Bahasa Yang Dikuasai</b>
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

      <div className="detail-section">

        <h2 className="detail-section-title">
          Detail Pemesanan
        </h2>

        <div className="detail-booking-row">

          <div className="detail-input-group">
            <label>Tanggal</label>

            <input
              type="date"
              value={tanggal}
              min={minDateString}
              onChange={(e) => setTanggal(e.target.value)}
              className="detail-date-input uniform-input"
            />

            {!tanggal && (
              <p className="detail-warning">
                Pilih tanggal terlebih dahulu
              </p>
            )}
          </div>

          <div className="detail-input-group">
            <label>Durasi</label>

            <select
              value={durasi}
              onChange={(e) => setDurasi(e.target.value)}
              className="detail-date-input uniform-input"
            >
              <option value="full day">Full Day</option>
              <option value="half day">Half Day</option>
            </select>
          </div>

          {durasi === "half day" && (
            <div className="detail-input-group">
              <label>Sesi</label>
              <select
                value={sesi}
                onChange={(e) => setSesi(e.target.value)}
                className="detail-date-input uniform-input"
              >
                <option value="pagi">Pagi</option>
                <option value="siang">Siang</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title center" style={{ border: "none" }}>
          Penilaian & Ulasan
        </h2>

        <div
          className="review-subtitle"
          style={{ borderBottom: "2px solid #ddd" }}
          onClick={() => navigate(`/tour-guide/${guide.id}/reviews`)}
        >
          lihat semua ulasan
        </div>

        {reviews.length === 0 && (
          <p className="detail-empty-review">
            Belum ada ulasan
          </p>
        )}

        <div className="detail-review-list">

          {reviews.map((r) => (
            <div key={r.id} className="review-card">

              <div className="review-avatar">
                👤
              </div>

              <div className="review-content">

                <div className="review-header">
                  <div className="review-name">
                    @{r.user?.username}
                  </div>

                  <div className="review-date">
                    {new Date(r.created_at)
                      .toLocaleDateString("id-ID")}
                  </div>
                </div>

                <div className="review-rating">
                  ⭐ {r.bintang}/5
                </div>

                {r.review && (
                  <div className="review-text">
                    {r.review}
                  </div>
                )}

              </div>
            </div>
          ))}

        </div>
      </div>

      <div className="detail-bottom-bar">
        <div>
          <div className="detail-total-label">
            Total Biaya
          </div>

          <div className="detail-total-price">
            Rp {total.toLocaleString("id-ID")}
          </div>
        </div>

        <button
          className="detail-book-btn"
          disabled={!tanggal}
          onClick={handleBooking}
        >
          Pesan Sekarang
        </button>
      </div>

    </div>
  );
};

export default TourGuideDetail;