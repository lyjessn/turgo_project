import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FiClock, FiMapPin, FiUsers, FiTool } from "react-icons/fi";
import { createBooking } from "../../api/apiBooking";
import { getDetailPaketWisata, getAvailablePaketWisata } from "../../api/apiPaketWisata";
import { useAuth } from "../../auth/useAuth";
import "./css/Detail.css";

const DetailPaketWisata = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);
    const [paket, setPaket] = useState(null);
    const [tanggal, setTanggal] = useState(location.state?.tanggal || "");
    const [jumlahOrang, setJumlahOrang] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(true);

    const images = paket
        ? [
            paket.url_thumbnail,
            ...(paket.fotos?.map(f => f.url_foto) || [])
        ]
        : [];

    useEffect(() => {
        fetchDetail();
    }, []);

    useEffect(() => {
        if (!images.length) return;

        const interval = setInterval(() => {
        setCurrentImage(prev =>
            prev === images.length - 1 ? 0 : prev + 1
        );
        }, 4000);

        return () => clearInterval(interval);

    }, [images]);

    useEffect(() => {
        if (!tanggal || !paket) return;
        checkAvailability(tanggal);
    }, [tanggal, paket]);

    const checkAvailability = async (tgl) => {
        try {
            const data = await getAvailablePaketWisata(tgl);

            const tersedia = data.some(p => p.id === paket.id);

            setIsAvailable(tersedia);
        } catch (err) {
            console.error(err);
            setIsAvailable(false);
        }
    };

    const fetchDetail = async () => {
        try {
            const res = await getDetailPaketWisata(id);
            setPaket(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!paket) return <div>Tidak ditemukan</div>;


    const handleBooking = async () => {
        if (!user) {
            navigate("/login", {
                state: {
                    redirectTo: `/paket-wisata/${paket.id}`,
                    tanggal,
                    jumlahOrang
                }
            });
            return;
        }

        try {
            const formData = new FormData();

            formData.append("paket_wisata_id", paket.id);
            formData.append("tanggal_mulai", tanggal);
            formData.append("tanggal_selesai", tanggal);
            formData.append("jumlah_orang", jumlahOrang);

            const res = await createBooking(formData);

            const booking = res.data || res;

            navigate(`/pembayaran/${booking.id}`);

        } catch (err) {
            alert(err.message || "Gagal membuat booking");
        }
    };

    const getTopReviews = () => {
        if (!paket?.ratings?.length)
            return [];

        const ratings = [...paket.ratings];

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

    return (
        <div className="detail-container">
            <div className="detail-header">

                <div>
                    <h1 className="detail-title">
                        {paket.nama}
                        <span className="detail-rating">
                        ⭐ {Number(paket.ratings_avg_bintang ?? 0).toFixed(1)} {""}
                            ({paket.ratings_count ?? 0})
                        </span>
                    </h1>
                    <div className="detail-price">
                        Rp {Number(paket.harga).toLocaleString("id-ID")}
                        <span className="detail-price-unit"> / orang</span>
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
                        className={
                            index === currentImage
                            ? "detail-dot active"
                            : "detail-dot"
                        }
                        onClick={() => setCurrentImage(index)}
                        />
                    ))}
                    </div>
                )}
            </div>

            <div className="detail-section">
                <h2 className="detail-section-title"> Informasi Paket </h2>

                <div className="detail-info-list">
                    <div className="detail-info-item">
                        <FiClock />
                        <div>
                            <b>Durasi Kegiatan</b>
                            <p>{paket.durasi}</p>
                            </div>
                        </div>

                    <div className="detail-info-item">
                        <FiMapPin />
                        <div>
                        <b>Lokasi Kegiatan</b>
                        <p>{paket.lokasi}</p>
                        </div>
                    </div>

                    <div className="detail-info-item">
                        <FiUsers />
                        <div>
                        <b>Kapasitas</b>
                        <p>
                            {paket.kapasitas_min} - {paket.kapasitas_max} orang
                        </p>
                        </div>
                    </div>

                    <div className="detail-info-item">
                        <FiTool />
                        <div>
                        <b>Perlengkapan</b>
                        <p>{paket.perlengkapan}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h2 className="detail-section-title"> Penjelasan Paket </h2>
                <p className="detail-description"> {paket.deskripsi} </p>
            </div>

            <div className="detail-section">
                <h2 className="detail-section-title"> Detail Pemesanan </h2>

                <div className="detail-booking-row">
                    <div className="detail-input-group">
                        <label>Tanggal</label>

                        <input
                            type="date"
                            min={minDateString}
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="detail-date-input uniform-input"
                        />

                        {!tanggal && (
                            <p className="detail-warning">
                            Pilih tanggal terlebih dahulu
                            </p>
                        )}

                        {!isAvailable && (
                        <p className="detail-warning">
                            Paket tidak tersedia pada tanggal ini
                        </p>
                        )}
                    </div>

                    <div className="detail-input-group">
                        <label>Jumlah Orang</label>

                        <div className="detail-stepper uniform-input">
                            <button
                                className="stepper-btn"
                                onClick={() =>
                                    setJumlahOrang(prev =>
                                    prev > 1 ? prev - 1 : 1
                                    )
                                }
                            >
                            −
                            </button>

                            <div className="stepper-value">
                            {jumlahOrang}
                            </div>

                            <button
                                className="stepper-btn"
                                onClick={() =>
                                    setJumlahOrang(prev =>
                                        prev + 1
                                    )
                                }
                            >
                            +
                            </button>
                        </div>

                        {jumlahOrang > paket.kapasitas_max && (
                            <p className="detail-warning">
                            Maksimal {paket.kapasitas_max} orang
                            </p>
                        )}

                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h2 className="detail-section-title center" style={{border:"none"}}> Penilaian & Ulasan </h2>
                <div className="review-subtitle"
                    style={{borderBottom: "2px solid #ddd"}}
                    onClick={() => navigate(`/paket-wisata/${paket.id}/reviews`)}
                >
                    lihat semua ulasan
                </div>

                {paket.ratings?.length === 0 && (
                    <p className="review-empty">
                    Belum ada ulasan
                    </p>
                )}

                <div className="detail-review-list">

                    {reviews.length === 0 && (
                    <p className="detail-empty-review">
                        Belum ada ulasan
                    </p>
                    )}

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
                    <div className="detail-total-label"> Total Biaya </div>
                    <div className="detail-total-price"> Rp {(paket.harga * jumlahOrang).toLocaleString("id-ID")}</div>
                </div>

                <button
                    className="detail-book-btn"
                    disabled={!tanggal || jumlahOrang < 1 || jumlahOrang > paket.kapasitas_max || !isAvailable}
                    onClick={handleBooking}
                >
                    Pesan Sekarang
                </button>
            </div>
        </div>
    );
};

export default DetailPaketWisata;
