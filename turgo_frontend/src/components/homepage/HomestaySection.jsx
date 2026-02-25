import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiHeart, FiShoppingCart } from "react-icons/fi";
import { getHomepageHomestay } from "../../api/apiHomestay";
import "./HomestaySection.css";

const HomestaySection = () => {
    const [featured, setFeatured] = useState(null);
    const [others, setOthers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await getHomepageHomestay();
            setFeatured(res.featured);
            setOthers(res.others || []);
        } catch (err) {
            console.error(err);
        }
        };
        fetchData();
    }, []);

    if (!featured) return null;

    const gallery = featured.fotos?.slice(0, 2) || [];

    return (
        <section className="homestay-section">
            <div className="homestay-header">
                <h2>Homestay Pilihan</h2>
                <p style={{fontSize: "22px", fontStyle:"italic"}}>
                Nikmati sensasi menyatu dengan alam yang sesungguhnya, Turgo menyediakan
                berbagai akomodasi asri yang menawan.
                </p>
            </div>

            <div className="homestay-grid">
                <div className="homestay-card-main"
                    style={{
                        backgroundImage: `url(http://127.0.0.1:8000/storage/${featured.url_thumbnail})`,
                    }}
                >
                <div className="homestay-favorite-pill">
                    <FiHeart color="red" />
                    Favorit Wisatawan
                </div>
                <div className="homestay-content">
                    <div className="homestay-title-row">
                    <h3>{featured.nama}</h3>
                    <span className="homestay-rating">
                        ⭐ {Number(featured.ratings_avg_bintang ?? 0).toFixed(1)}
                        <span className="rating-count">
                        ({featured.ratings_count ?? 0})
                        </span>
                    </span>
                    </div>

                    <div className="homestay-divider" />

                    <div className="homestay-meta">
                    <FiMapPin />
                    {featured.lokasi}
                    </div>

                    <div className="homestay-footer">
                   

                    <button className="homestay-order-btn"
                        onClick={() =>
                            navigate(`/homestay/${featured.id}`)
                        }
                    >
                        <FiShoppingCart />
                        Pesan Sekarang
                    </button>
                    </div>
                </div>
                </div>

                <div className="homestay-gallery">
                    {gallery.map((foto) => (
                        <img
                        key={foto.id}
                        src={`http://127.0.0.1:8000/storage/${foto.url_foto}`}
                        alt="homestay"
                        />
                    ))}
                </div>
            </div>
            {others.length > 0 && (
            <div className="homestay-scroll">
                {others.map((item) => (
                <div
                    key={item.id}
                    className="homestay-card-small"
                    style={{
                    backgroundImage: `url(http://127.0.0.1:8000/storage/${item.url_thumbnail})`,
                    }}
                >
                    <div className="homestay-small-content">
                    <h4>{item.nama}</h4>

                    <div className="homestay-small-meta">
                        <FiMapPin /> {item.lokasi}
                    </div>

                    <div className="homestay-small-price">
                        Rp {Number(item.harga ?? 0).toLocaleString("id-ID")}
                    </div>

                    <button className="homestay-small-btn"
                        onClick={() =>
                            navigate(`/homestay/${item.id}`)
                        }
                    >
                        Lihat Detail
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </section>
    );
};

export default HomestaySection;
