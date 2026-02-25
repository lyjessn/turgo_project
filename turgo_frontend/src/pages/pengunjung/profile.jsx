import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { getMyActiveBookings, getMyBookingHistory, cancelBooking } from "../../api/apiBooking";
import { useNavigate } from "react-router-dom";

import "./css/profile.css";

const Profile = () => {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("aktif");

    const [activeBookings, setActiveBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {

            const active = await getMyActiveBookings();
            const history = await getMyBookingHistory();

            setActiveBookings(active);
            setHistoryBookings(history);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const normalizeDate = (date) => {
        const d = new Date(date);
        d.setHours(0,0,0,0);
        return d;
    };

    const getButtonType = (booking) => {

        const status = booking.status_pemesanan;

        if (status === "selesai" && !booking.sudah_rating_semua) {
            return "ulasan";
        }
        if (status === "dikonfirmasi") {

            const today = normalizeDate(new Date());
            const mulai = normalizeDate(booking.tanggal_mulai);

            const hMinus3 = new Date(mulai);
            hMinus3.setDate(hMinus3.getDate() - 3);

            if (today < hMinus3) {
                return "batalkan";
            }

            return "selesai";
        }

        return null;
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Batalkan pesanan ini?")) return;
        try {
            await cancelBooking(id);
            alert("Booking berhasil dibatalkan");
            fetchAll();
        } catch (err) {
            alert(err.message || "Gagal membatalkan");
        }

    };

    const handleDetail = (id) => {
        navigate(`/booking/${id}`);
    };

    const BookingCard = ({ booking }) => {

        const buttonType = getButtonType(booking);

        return (
            <div className="booking-card">
                <img
                    src={
                        booking.thumbnail
                        ? `http://127.0.0.1:8000/storage/${booking.thumbnail}`
                        : "/default.jpg"
                    }
                    className="booking-thumb"
                />

                <div className="booking-info">

                    <h4>{booking.tipe_booking.replace("_", " ")}</h4>

                    <p>ID Order: #{booking.id}</p>

                    <p>
                        Tanggal:
                        {" "}
                        {booking.tanggal_mulai}
                    </p>

                    <p className={`status ${booking.status_pemesanan}`}>
                        {booking.status_pemesanan}
                    </p>

                    <div className="booking-actions">

                        <button
                            className="btn-detail"
                            onClick={() => handleDetail(booking.id)}
                        >
                            Lihat Detail
                        </button>

                        {buttonType === "batalkan" && (
                            <button
                                className="btn-cancel"
                                onClick={() => handleCancel(booking.id)}
                            >
                                Batalkan Pesanan
                            </button>
                        )}

                        {buttonType === "selesai" && (
                            <button className="btn-finish">
                                Selesai
                            </button>
                        )}

                        {buttonType === "ulasan" && (
                            <button
                                className="btn-review"
                                onClick={()=>navigate(`/beri-ulasan/${booking.id}`)}
                            >
                                Beri Ulasan
                            </button>
                        )}

                    </div>
                </div>
            </div>
        );
    };

    if (loading) {

        return (
            <div className="profile-container">
                Loading...
            </div>
        );

    }

    return (
        <div className="profile-container">

            <div className="profile-header">
                <div className="profile-avatar">
                    {user?.foto_profil ? (
                        <img
                            src={`http://127.0.0.1:8000/storage/${user.foto_profil}`}
                            alt="Foto Profil"
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h3>@{user?.username}</h3>
                <p>{user?.email}</p>

            </div>

            <div className="profile-tabs">
                <button
                    className={tab === "aktif" ? "active" : ""}
                    onClick={() => setTab("aktif")}
                >
                    Pesanan Aktif
                </button>

                <button
                    className={tab === "riwayat" ? "active" : ""}
                    onClick={() => setTab("riwayat")}
                >
                    Riwayat Pemesanan
                </button>

                <button
                    className={tab === "profil" ? "active" : ""}
                    onClick={() => setTab("profil")}
                >
                    Profil Saya
                </button>
            </div>

            <div className="profile-content">
                {tab === "aktif" && (
                    activeBookings.length === 0
                        ? <p>Tidak ada pesanan aktif</p>
                        : activeBookings.map(b =>
                            <BookingCard key={b.id} booking={b}/>
                        )
                )}

                {tab === "riwayat" && (
                    historyBookings.length === 0
                        ? <p>Tidak ada riwayat</p>

                        : historyBookings.map(b =>
                            <BookingCard key={b.id} booking={b}/>
                        )
                )}

                {tab === "profil" && (

                    <div className="profile-info">
                        <p>Username: {user?.username}</p>
                        <p>Email: {user?.email}</p>
                        <p>No HP: {user?.no_hp}</p>
                    </div>

                )}

            </div>

        </div>
    );
};

export default Profile;