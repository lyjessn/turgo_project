import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getDetailHomestay } from "../../api/apiHomestay";
import { FiWifi } from "react-icons/fi";
import { FaBed, FaBath } from "react-icons/fa";
import "./css/Detail.css";
import "./css/HomestayDetail.css";

const HomestayDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [homestay, setHomestay] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const checkIn = location.state?.checkIn;
    const checkOut = location.state?.checkOut;

    useEffect(() => {
      const fetchDetail = async () => {
        try {
          const res = await getDetailHomestay(id);
          console.log(res.data);
          setHomestay(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }, [id]);

    const images = homestay
      ? [homestay.url_thumbnail, ...(homestay.fotos?.map(f => f.url_foto) || [])]
      : [];

    const activeKamars = homestay?.kamars?.filter(k => k.is_aktif === 1) || [];

    const getTopReviews = () => {
      if (!homestay?.ratings?.length) return [];

      const ratings = [...homestay.ratings];

      const withReview = ratings
        .filter(r => r.review && r.review.trim() !== "")
        .sort((a, b) => b.bintang - a.bintang);

      if (withReview.length >= 3) return withReview.slice(0, 3);

      const highest = ratings.sort((a, b) => b.bintang - a.bintang);
      if (highest.length >= 3) return highest.slice(0, 3);

      const newest = ratings.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      return newest.slice(0, 3);
    };

    const reviews = getTopReviews();

    useEffect(() => {
      if (!images.length) return;
      const interval = setInterval(() => {
        setCurrentImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
      }, 4000);
      return () => clearInterval(interval);
    }, [images]);

    const goToKamar = kamar => {
      navigate(`/homestay/${id}/kamar/${kamar.id}`, {
        state: { kamar, homestay, checkIn, checkOut }
      });
    };

    if (loading) return <div>Loading...</div>;
    if (!homestay) return <div>Tidak ditemukan</div>;

    return (
      <div className="detail-container">
        <div className="detail-header">
          <h1 className="detail-title">{homestay.nama}
            <span className="detail-rating">
            ⭐ {Number(homestay.ratings_avg_bintang ?? 0).toFixed(1)} {""}
                ({homestay.ratings_count ?? 0})
            </span>
          </h1>
          
        </div>

        <div className="detail-carousel">
          <img
            src={`http://127.0.0.1:8000/storage/${images[currentImage]}`}
            className="detail-image"
          />
          {images.length > 1 && (
            <div className="detail-dots">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={index === currentImage ? "detail-dot active" : "detail-dot"}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-section">
          <h2 className="detail-section-title">Kamar Yang Tersedia</h2>
          <div className="homestay-kamar-list">
              {activeKamars.length === 0 ? (
                <p>Tidak ada kamar tersedia</p>
              ) : (
                activeKamars.map(kamar => (
                  <div key={kamar.id} className="homestay-kamar-card">
                    <img
                      src={`http://127.0.0.1:8000/storage/${kamar.foto}`}
                      className="homestay-kamar-image"
                    />

                    <div className="homestay-kamar-info">
                      <div className="homestay-kamar-header">
                        <div className="homestay-kamar-nama">{kamar.nama}</div>
                        <div className="homestay-kamar-harga">
                          Rp {Number(kamar.harga_per_malam).toLocaleString("id-ID")}
                          <span>/ malam</span>
                        </div>
                      </div>

                      <button
                        className="detail-book-btn"
                        onClick={() => goToKamar(kamar)}
                      >
                        Pilih Kamar
                      </button>
                    </div>
                  </div>
                ))
              )}
              </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section-title center" style={{ border: "none" }}>
            Ulasan Pengunjung
          </h2>

          <div
            className="review-subtitle"
            style={{ borderBottom: "2px solid #ddd" }}
            onClick={() => navigate(`/homestay/${homestay.id}/reviews`)}
          >
            lihat semua ulasan
          </div>

          {reviews.length === 0 && (
            <p className="detail-empty-review">Belum ada ulasan</p>
          )}

          <div className="detail-review-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-avatar">
                  <img
                    src={`http://127.0.0.1:8000/storage/${r.user?.foto_profil}`}
                    alt="avatar"
                  />
                </div>

                <div className="review-content">
                  <div className="review-header">
                    <div className="review-name">
                      @{r.user?.username}
                    </div>

                    <div className="review-date">
                      {new Date(r.created_at).toLocaleDateString("id-ID")}
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
      </div>
    );
};

export default HomestayDetail;