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
        <h1 className="detail-title">{homestay.nama}</h1>
        <div className="detail-title">
            <div className="detail-rating">
                ⭐ {Number(homestay.ratings_avg_bintang ?? 0).toFixed(1)}
                {" "}
                ({homestay.ratings_count ?? 0} ulasan)
                {" "}
                <span
                className="review-subtitle"
                onClick={() => navigate(`/homestay/${homestay.id}/reviews`)}
                >
                lihat ulasan
                </span>
            </div>
         </div>
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
            {homestay.kamars?.map(kamar => (
                <div key={kamar.id} className="homestay-kamar-card">
                <img src={`http://127.0.0.1:8000/storage/${kamar.foto}`} className="homestay-kamar-image" />

                <div className="homestay-kamar-info">
                    <div className="homestay-kamar-header">
                        <div className="homestay-kamar-nama">{kamar.nama}</div>
                        <div className="homestay-kamar-harga">
                            Rp {Number(kamar.harga_per_malam).toLocaleString("id-ID")}
                            <span>/ malam</span>
                        </div>
                    </div>

                    <div className="detail-info-list">
                        <div className="detail-info-item">
                            <FaBed />
                            <div>
                                <p>{kamar.jumlah_kasur} kasur</p>
                            </div>
                        </div>

                    <div className="detail-info-item">
                        <FaBath />
                        <div>
                            <p>{kamar.jumlah_toilet} kamar mandi</p>
                        </div>
                    </div>

                    <div className="detail-info-item">
                        <FiWifi />
                        <div>
                            <p>{kamar.wifi ? kamar.wifi : "tidak tersedia wifi"}</p>
                        </div>
                    </div>
                    </div>

                    <button className="detail-book-btn" onClick={() => goToKamar(kamar)}>
                    Pilih Kamar
                    </button>
                </div>
                </div>
            ))}
            </div>
      </div>
    </div>
  );
};

export default HomestayDetail;