import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/baseUrl";
import { getHomepageTourGuide } from "../../api/apiTourGuide";
import { FiUser, FiUserCheck, FiGlobe, FiStar} from "react-icons/fi";
import "./TourGuideSection.css";

const TourGuideSection = () => {
    const [best, setBest] = useState(null);
    const [others, setOthers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getHomepageTourGuide();
                console.log(res.others);
                setBest(res.best || null);
                setOthers(res.others || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (!best && others.length === 0) return null;

    const renderCardContent = (g) => (
        <>
            <div className="tg-overlay" />
            <div className="tg-content">
                <div className="tg-title">
                    {g.user?.nama_lengkap}
                    <span className="tg-rating">
                        ⭐
                        {Number(g.ratings_avg_bintang ?? 0).toFixed(1)}
                        <span className="tg-rating-count">
                            ({g.ratings_count ?? 0})
                        </span>
                    </span>
                </div>

                <div className="tg-divider" />

                <div className="tg-meta">
                    <div><FiGlobe /> {g.bahasa}</div>
                    <div><FiStar /> {g.spesialisasi}</div>
                </div>

                <div className="tg-footer">
                    <span className="tg-price">
                    Rp {Number(g.harga_per_hari).toLocaleString("id-ID")}
                    </span>
                    <button className="tg-btn"
                        onClick={() =>
                            navigate(`/tour-guide/${g.id}`)
                        }
                    >
                        <FiUserCheck /> Pilih
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <section className="tg-section">
           <div className="tg-grid">
                <div className="tg-col">
                    <div className="tg-title-block">
                        <h2>Tour Guide</h2>
                        <p className="subtext-tg">terbaik untuk menemani perjalananmu</p>
                    </div>

                    {best && (
                    <div
                        className="tg-card tg-best"
                        style={{ backgroundImage: `url(${BASE_URL}/storage/${best.foto_profil})` }}
                    >
                        <div className="tg-overlay" />
                        <div className="tg-best-badge">🎖️ Top Guide</div>

                        <div className="tg-content">
                            <div className="tg-title">
                                {best.user?.nama_lengkap}
                                <span className="tg-rating">
                                    ⭐
                                    {Number(best.ratings_avg_bintang ?? 0).toFixed(1)}
                                    <span className="tg-rating-count">
                                        ({best.ratings_count ?? 0})
                                    </span>
                                </span>
                            </div>

                            <div className="tg-divider" />

                            <div className="tg-meta">
                                <div><FiGlobe /> {best.bahasa}</div>
                                <div><FiStar /> {best.spesialisasi}</div>
                            </div>

                            <div className="tg-footer">
                                <span className="tg-price">
                                Rp {Number(best.harga_per_hari).toLocaleString("id-ID")}
                                </span>
                                <button className="tg-btn"
                                    onClick={() =>
                                        navigate(`/tour-guide/${best.id}`)
                                    }
                                >
                                    <FiUserCheck /> Pilih
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                <div className="tg-col">
                    {others[0] && (
                    <div
                        className="tg-card tg-small"
                        style={{ backgroundImage: `url(${BASE_URL}/storage/${others[0].foto_profil})` }}
                    >
                        {renderCardContent(others[0])}
                    </div>
                    )}

                    {others[2] && (
                    <div
                        className="tg-card tg-small"
                        style={{ backgroundImage: `url(${BASE_URL}/storage/${others[2].foto_profil})` }}
                    >
                        {renderCardContent(others[2])}
                    </div>
                    )}
                </div>

                <div className="tg-col">
                    {others[1] && (
                    <div
                        className="tg-card tg-normal"
                        style={{ backgroundImage: `url(${BASE_URL}/storage/${others[1].foto_profil})` }}
                    >
                        {renderCardContent(others[1])}
                    </div>
                    )}

                    <div className="tg-cta">
                        <p>Masih belum menemukan tour guide?</p>
                        <button
                            onClick={() =>
                                navigate(`/tour-guide`)
                            }
                        >Lihat lebih banyak</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TourGuideSection;
