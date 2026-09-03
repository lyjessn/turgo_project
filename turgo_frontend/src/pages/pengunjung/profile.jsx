import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { useAuth } from "../../auth/useAuth";
import { getMyActiveBookings, getMyBookingHistory, cancelBooking } from "../../api/apiBooking";
import { updateProfile } from "../../api/apiUser";
import { useNavigate } from "react-router-dom";

import "./css/profile.css";

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("aktif");
    const [activeBookings, setActiveBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [modal, setModal] = useState({
        show: false,
        type: "success",
        message: ""
    });

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        bookingId: null,
        message: ""
    });

    const [editMode, setEditMode] = useState(false);

    const [editForm, setEditForm] = useState({
        nama_lengkap: "",
        username: "",
        email: "",
        nomor_telepon: "",
        foto_profil: null
    });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const active = await getMyActiveBookings();
            const history = await getMyBookingHistory();
            console.log(active);
            console.log(history);
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
        }
        return null;
    };

    const handleCancel = (id) => {
        setConfirmModal({
            show: true,
            bookingId: id,
            message: "Yakin ingin membatalkan pesanan ini?"
        });
    };

    const confirmCancelBooking = async () => {
        try {
            await cancelBooking(confirmModal.bookingId);
            setConfirmModal({ show:false, bookingId:null });

            setModal({
                show: true,
                type: "success",
                message: "Pesanan berhasil dibatalkan"
            });
            fetchAll();

        } catch (err) {
            setConfirmModal({ show:false, bookingId:null });

            setModal({
            show: true,
            type: "error",
            message: "Gagal membatalkan pesanan"
            });
        }
    };

    const handleDetail = (booking) => {

        if (booking.status_pemesanan === "menunggu pembayaran") {
            navigate(`/pembayaran/${booking.id}`, {
                state: { booking }
            });
            return;
        }

        navigate(`/booking/${booking.id}`);
    };

    const handleUpdateProfile = async () => {
        try {
            setSubmitting(true);

            const formData = new FormData();

            Object.keys(editForm).forEach(key => {
                if (editForm[key] !== null)
                    formData.append(key, editForm[key]);
            });

            const res = await updateProfile(formData);

            setUser(res.data);

            setModal({
                show: true,
                type: "success",
                message: "Profil berhasil diperbarui"
            });

            setEditMode(false);

        } catch (err) {

            console.error(err.response?.data);

            setModal({
                show: true,
                type: "error",
                message: "Gagal memperbarui profil"
            });

        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const BookingCard = ({ booking }) => {

        const buttonType = getButtonType(booking);
        const getBookingName = (booking) => {

            if (booking.custom_details?.length) {
                return booking.custom_details
                    .map(d => d.paket_wisata?.nama)
                    .filter(Boolean)
                    .join(", ");
            }

            if (booking.paket_wisata_details?.paket_wisata?.nama) {
                return booking.paket_wisata_details.paket_wisata.nama;
            }

            if (booking.homestay_details?.homestay?.nama) {
                return booking.homestay_details.homestay.nama;
            }

            if (booking.tour_guide_details?.tour_guide?.user) {
                return booking.tour_guide_details.tour_guide.user.nama_lengkap;
            }

            return booking.tipe_booking.replace("_"," ");
        };

        return (

            <div className="booking-card">

                <img
                    src={
                        booking.thumbnail
                        ? `${BASE_URL}/storage/${booking.thumbnail}`
                        : "/default.jpg"
                    }
                    className="booking-thumb"
                />

                <div className="booking-info">

                    <h4>{getBookingName(booking)}</h4>

                    <div className="booking-meta">
                        Tanggal Kegiatan: {formatDate(booking.tanggal_mulai)}
                    </div>

                    <div className={`status-text ${booking.status_pemesanan.replace(/\s+/g,"-")}`}>
                        {booking.status_pemesanan}
                    </div>

                </div>

                <div className="booking-side">

                    <div className="booking-meta-right">
                        ID Order #{booking.id}
                    </div>

                    <div className="booking-meta-right">
                        {formatDate(booking.tanggal_booking)}
                    </div>

                    <div className="booking-actions">

                        <button
                            className={
                                booking.status_pemesanan === "menunggu pembayaran"
                                ? "btn-pay"
                                : "btn-secondary"
                            }
                            onClick={() => handleDetail(booking)}
                            >
                            {booking.status_pemesanan === "menunggu pembayaran"
                                ? "Selesaikan Pembayaran"
                                : "Lihat Detail"}
                        </button>

                        {buttonType === "batalkan" && (
                            <button
                                className="btn-cancel"
                                onClick={() => handleCancel(booking.id)}
                            >
                                Batalkan
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
        <>
        <div className="profile-container">

            <div className="profile-header">
                <div className="profile-avatar">
                    {user?.foto_profil ? (
                        <img
                            src={`${BASE_URL}/storage/${user.foto_profil}`}
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
                    Pemesanan Aktif
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
                        ? <p>Tidak ada pemesanan aktif</p>
                        : activeBookings.map(b =>
                            <BookingCard key={b.id} booking={b}/>
                        )
                )}

                {tab === "riwayat" && (
                    historyBookings.length === 0
                        ? <p>Tidak ada riwayat pemesanan</p>

                        : historyBookings.map(b =>
                            <BookingCard key={b.id} booking={b}/>
                        )
                )}

                {tab === "profil" && (
                    <div className="profile-info">
                        <p>Nama Lengkap: {user?.nama_lengkap}</p>
                        <p>Username: {user?.username}</p>
                        <p>Email: {user?.email}</p>
                        <p>No HP: {user?.nomor_telepon}</p>

                        <button
                        className="btn-primary"
                        onClick={() => {
                            setEditForm({
                                nama_lengkap: user?.nama_lengkap || "",
                                username: user?.username || "",
                                email: user?.email || "",
                                nomor_telepon: user?.nomor_telepon || "",
                                foto_profil: null
                            });

                            setEditMode(true);
                        }}
                        >
                        Edit Profil
                        </button>

                    </div>

                    )}

            </div>

        </div>

        {editMode && (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Edit Profil</h3>
                        <span
                        className="modal-close"
                        onClick={() => setEditMode(false)}
                        >
                        ✕
                        </span>
                    </div>

                    <div className="modal-body">
                        <div className="column">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                value={editForm.nama_lengkap}
                                onChange={(e)=>
                                setEditForm({...editForm,nama_lengkap:e.target.value})
                                }
                            />
                        </div>

                        <div className="column">
                            <label>Username</label>
                            <input
                                type="text"
                                value={editForm.username}
                                onChange={(e)=>
                                    setEditForm({
                                        ...editForm,
                                        username:e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="column">
                            <label>Email</label>
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e)=>
                                setEditForm({...editForm,email:e.target.value})
                                }
                            />
                        </div>

                        <div className="column">
                            <label>Nomor Telepon</label>
                            <input
                                type="text"
                                value={editForm.nomor_telepon}
                                onChange={(e)=>
                                setEditForm({...editForm,nomor_telepon:e.target.value})
                                }
                            />
                        </div>

                        <div className="column">
                            <label>Foto Profil</label>
                            <input
                                type="file"
                                onChange={(e)=>
                                setEditForm({...editForm,foto_profil:e.target.files[0]})
                                }
                            />
                        </div>

                    </div>

                    <div className="modal-actions">

                        <button
                            className="btn-primary"
                            onClick={handleUpdateProfile}
                            disabled={submitting}
                        >
                            {submitting ? "Mengupdate..." : "Simpan"}
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={() => setEditMode(false)}
                        >
                        Batal
                        </button>

                    </div>
                </div>
            </div>
        )}

        {modal.show && (
            <div className="custom-modal-overlay">
                <div className="custom-modal modal-center">
                    <div className="modal-icon-wrapper">
                        {modal.type === "success" && (
                            <div className="modal-icon success">✓</div>
                        )}
                        {modal.type === "error" && (
                            <div className="modal-icon error">✕</div>
                        )}
                    </div>

                    <h3 className="modal-title">{modal.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}</h3>

                    <p className="modal-message">{modal.message}</p>

                    <button
                        className="modal-button"
                        onClick={() => setModal({ ...modal, show: false })}
                    >
                        OK
                    </button>
                </div>
            </div>
        )}

        {confirmModal.show && (
            <div className="custom-modal-overlay">
                <div className="custom-modal modal-center">
                    <div className="modal-icon-wrapper">
                        <div className="modal-icon expired">!</div>
                    </div>

                    <h3 className="modal-title">
                        Konfirmasi
                    </h3>

                    <p className="modal-message">
                        {confirmModal.message}
                    </p>

                    <div style={{display:"flex", gap:"12px", justifyContent:"center"}}>

                        <button className="btn-secondary"
                        onClick={() =>
                            setConfirmModal({ show:false, bookingId:null })
                        }
                        >
                        kembali
                        </button>

                        <button className="btn-danger"
                        onClick={confirmCancelBooking}
                        >
                        Batalkan
                        </button>

                    </div>

                </div>
            </div>
        )}

        </>
    );
};

export default Profile;