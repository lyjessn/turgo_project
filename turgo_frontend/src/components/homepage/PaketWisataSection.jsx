import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/baseUrl";
import { getHomepagePaketWisata } from "../../api/apiPaketWisata";
import { FiClock, FiMapPin, FiShoppingCart, FiTool, FiDollarSign } from "react-icons/fi";
import "./PaketWisataSection.css";

const PaketWisataSection = () => {
    const [featured, setFeatured] = useState([]);
    const [others, setOthers] = useState([]);
    const [tanggal, setTanggal] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        try {
            const data = await getHomepagePaketWisata();
            setFeatured(data.featured || []);
            setOthers(data.others || []);
        } catch (err) {
            console.error("Gagal ambil paket wisata homepage", err);
        }
        };

        fetchData();
    }, []);

    if (featured.length === 0) return null;

    return (
        <section className="paket-section">
            <div className="paket-header">
                <h2 className="paket-heading">Paket Wisata Turgo</h2>

                <div className="paket-subheader">
                    <p style={{fontSize: "22px", fontStyle:"italic"}}>Mau personalisasi paket wisatamu?</p>
                    <button className="paket-custom-btn"
                        onClick={() => navigate("/paket-wisata/custom")}
                    >custom aja</button>
                </div>
            </div>


            <div className="paket-featured">
                {featured.map((paket, idx) => (
                    <div
                        key={paket.id}
                        className={`paket-card-large ${idx === 0 ? "left" : "right"}`}
                        style={{
                        backgroundImage: `url(${BASE_URL}/storage/${paket.url_thumbnail})`,
                        }}
                    >
                        <div className="paket-besar-content">
                            <div className="paket-besar-pill-row">
                                <span className="paket-besar-pill">
                                    {paket.kategori_paket}
                                </span>
                                <span className="paket-besar-pill">
                                    <FiClock /> {paket.durasi}
                                </span>
                            </div>

                            <div className="paket-title-row">
                                <h1>{paket.nama}</h1>
                                <span className="paket-besar-rating">
                                    <span className="rating-text">
                                            ⭐ {Number(paket.ratings_avg_bintang ?? 0).toFixed(1)} {""}
                                                ({paket.ratings_count ?? 0})
                                    </span>
                                </span>
                            </div>

                            <div className="paket-besar-divider" />

                            <p className="paket-besar-preview">{paket.preview}</p>

                            <div className="paket-besar-meta">
                                <FiMapPin /> {paket.lokasi}
                            </div>
                            <div className="paket-besar-meta">
                                <FiTool /> {paket.perlengkapan}
                            </div>

                            <p className="paket-besar-note">
                                Perhatian: Setiap paket wisata sudah termasuk guide.
                                Guide akan disesuaikan dengan kebutuhan aktivitas.
                            </p>

                            <div className="paket-besar-footer">
                                <span className="paket-besar-price">
                                Rp{" "}
                                {Number(paket.harga || 0).toLocaleString("id-ID")}
                                </span>
                                <button className="paket-besar-order-btn"
                                    onClick={() =>
                                        navigate(`/paket-wisata/${paket.id}`, {
                                            state: { tanggal }
                                        })
                                    }
                                >
                                <FiShoppingCart /> Pesan Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {others.length > 0 && (
                <div className="paket-scroll">
                    {others.map((paket) => (
                        <div
                        key={paket.id}
                        className="paket-card-small"
                        style={{
                            backgroundImage: `url(${BASE_URL}/storage/${paket.url_thumbnail})`,
                        }}
                        >
                            <div className="paket-kecil-content">
                                <div className="paket-title-row">
                                    <h4>{paket.nama}</h4>
                                    <span className="paket-kecil-rating">
                                        <span className="rating-text">
                                            ⭐ {Number(paket.ratings_avg_bintang ?? 0).toFixed(1)} {""}
                                                ({paket.ratings_count ?? 0})
                                        </span>
                                    </span>
                                </div>

                                <div className="paket-kecil-meta">
                                <FiClock /> {paket.durasi}
                                </div>
                                <div className="paket-kecil-meta">
                                    <FiDollarSign /> Rp {Number(paket.harga || 0).toLocaleString("id-ID")}
                                </div>

                                <div className="paket-kecil-meta">
                                <FiMapPin /> {paket.lokasi}
                                </div>

                                <button className="paket-kecil-detail-btn"
                                    onClick={() =>
                                        navigate(`/paket-wisata/${paket.id}`, {
                                            state: { tanggal }
                                        })
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

export default PaketWisataSection;
