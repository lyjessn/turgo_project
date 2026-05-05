import { useEffect, useState, useMemo } from "react";
import { BASE_URL } from "../../../utils/baseUrl";
import { FiSearch, FiMoreVertical, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/AdminShared.css";
import "../css/AdminPaketWisata.css";
import "../css/Modal.css";

import { getAdminBookings, updateBookingStatus, sendBookingEmail, assignTourGuide } from "../../../api/apiBooking";
import { getAvailableTourGuide } from "../../../api/apiTourGuide";
import { GetUserData } from "../../../api/apiAuth";

const AdminBookingPage = ({ tipe, title }) => {
    const [data, setData] = useState([]);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("semua");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [showAssignGuideModal, setShowAssignGuideModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [tourGuides, setTourGuides] = useState([]);
    const [selectedGuide, setSelectedGuide] = useState("");

    const [notifyTitle, setNotifyTitle] = useState("");
    const [notifyMessage, setNotifyMessage] = useState("");

    const [modal, setModal] = useState({
        show: false,
        type: "",
        message: ""
    });

    useEffect(() => {
        fetchData();
        loadUser();
    }, []);

    useEffect(()=>{
        setPage(1);
    }, [search, filter]);

    const fetchData = async () => {
        try {

            const bookings = await getAdminBookings();
            console.log(bookings);

            if (!Array.isArray(bookings)) {
            console.error("Booking bukan array:", bookings);
            return;
            }

            const filtered = bookings.filter(
            b => b.tipe_booking === tipe
            );

            setData(filtered);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadUser = async () => {
        try {
            const res = await GetUserData();
            setRole(res.role);
        } catch (err) {
            console.error(err);
        }
    };

    const loadTourGuides = async (tanggal) => {
        try {
            const res = await getAvailableTourGuide(tanggal);
            setTourGuides(res);
        } catch (err) {
            console.error(err);
        }
    };
    
    const getProductName = (item) => {
        if(item.tipe_booking === "paket_wisata"){
            return item.paket_wisata_details?.paket_wisata?.nama;
        }

        if(item.tipe_booking === "homestay"){
            return item.homestay_details?.homestay?.nama;
        }

        if(item.tipe_booking === "tour_guide"){
            return item.tour_guide_details?.tour_guide?.user?.nama_lengkap;
        }
    };

    const filteredData = useMemo(() => {

        let result = [...data];

        if (filter === "belum_bayar") {
            result = result.filter(
                d => d.status_pemesanan === "menunggu pembayaran"
            );
        }

        if (filter === "menunggu") {
            result = result.filter(
                d => d.status_pemesanan === "menunggu verifikasi"
            );
        }

        if (filter === "dikonfirmasi") {
            result = result.filter(
                d => d.status_pemesanan === "dikonfirmasi"
            );
        }

        if (filter === "ditolak") {
            result = result.filter(
                d => d.status_pemesanan === "ditolak"
            );
        }

        if (filter === "batal") {
            result = result.filter(
                d => d.status_pemesanan === "batal"
            );
        }

        if (search) {
            const keyword = search.toLowerCase().trim();

            result = result.filter(d =>
                String(d.id).toLowerCase().includes(keyword) ||
                d.user?.nama_lengkap?.toLowerCase().includes(keyword) ||
                getProductName(d)?.toLowerCase().includes(keyword)
            );
        }

        return result;
    }, [data, filter, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = filteredData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const formatHarga = (harga) => {
        return Number(harga).toLocaleString("id-ID");
    };

    const handleConfirm = async () => {
        try {
            setSubmitting(true);
            await updateBookingStatus(selectedItem.id, {
                status_pemesanan: "dikonfirmasi"
            });
            toast.success("Booking berhasil dikonfirmasi");
            setShowConfirmModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason) {
            toast.error("Alasan penolakan wajib diisi");
            return;
        }

        try {
            setSubmitting(true);

            await updateBookingStatus(selectedItem.id, {
            status_pemesanan: "ditolak",
            alasan_penolakan: rejectReason
            });

            toast.success("Booking berhasil ditolak");
            setShowRejectModal(false);
            setRejectReason("");
            fetchData();

        } catch (err) {
            console.error(err);
            toast.error("Gagal menolak booking");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        try {
            setSubmitting(true);

            await updateBookingStatus(selectedItem.id, {
            status_pemesanan: "batal"
            });

            toast.success("Booking berhasil dibatalkan");
            setShowCancelModal(false);
            fetchData();

        } catch (err) {
            console.error(err);
            toast.error("Gagal membatalkan booking");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendNotify = async () => {
        try {
            setSending(true);

            await sendBookingEmail(
            selectedItem.id,
            notifyTitle,
            notifyMessage
            );

            setShowNotifyModal(false);
            setNotifyTitle("");
            setNotifyMessage("");

            setModal({
            show: true,
            type: "success",
            message: "Email berhasil dikirim ke pemesan."
            });

        } catch (err) {
            console.error(err);

            const message =
            err.response?.data?.error || "Gagal mengirim email.";

            setModal({
            show: true,
            type: "error",
            message
            });

        } finally {
            setSending(false);
        }
    };

    const handleAssignGuide = async () => {
        if (!selectedGuide) {
            toast.error("Pilih tour guide terlebih dahulu");
            return;
        }

        try {
            setSubmitting(true);

            await assignTourGuide(selectedItem.id, selectedGuide);

            toast.success("Tour guide berhasil ditetapkan");
            setShowAssignGuideModal(false);
            setSelectedGuide("");
            fetchData();

        } catch (err) {
            console.error(err);
            toast.error("Gagal assign tour guide");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <div className="admin-page">
                <div className="admin-header">
                    <h1>{title}</h1>
                    <div className="admin-header-actions">
                        <div className="admin-search-wrapper">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Cari data pesanan"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                        />
                        </div>
                    </div>
                </div>

                <div className="admin-filter-group">
                    <button
                        className={filter==="semua"?"active":""}
                        onClick={()=>setFilter("semua")}
                    >
                        Semua
                    </button>

                    <button
                        className={filter==="belum_bayar"?"active":""}
                        onClick={()=>setFilter("belum_bayar")}
                    >
                        Belum Bayar
                    </button>

                    <button
                        className={filter==="menunggu"?"active":""}
                        onClick={()=>setFilter("menunggu")}
                    >
                        Menunggu
                    </button>

                    <button
                        className={filter==="dikonfirmasi"?"active":""}
                        onClick={()=>setFilter("dikonfirmasi")}
                    >
                        Dikonfirmasi
                    </button>

                    <button
                        className={filter==="ditolak"?"active":""}
                        onClick={()=>setFilter("ditolak")}
                    >
                        Ditolak
                    </button>

                    <button
                        className={filter==="batal"?"active":""}
                        onClick={()=>setFilter("batal")}
                    >
                        Dibatalkan
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Pengunjung</th>
                            <th>
                                {tipe === "homestay" && "Homestay"}
                                {tipe === "paket_wisata" && "Paket Wisata"}
                                {tipe === "tour_guide" && "Tour Guide"}
                            </th>

                            {tipe === "homestay" && (
                                <>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                </>
                            )}

                            {tipe === "paket_wisata" && (
                                <>
                                    <th>Tanggal</th>
                                    <th>Jumlah Orang</th>
                                </>
                                
                            )}

                            {tipe === "tour_guide" && (
                                <>
                                    <th>Durasi</th>
                                    <th>Sesi</th>
                                </>
                            )}

                            {tipe === "custom" && (
                                <>
                                    <th>Jumlah Paket</th>
                                    <th>Jumlah Orang</th>
                                    <th>Jenis Tour Guide</th>
                                    <th>Tour Guide</th>
                                </>
                            )}

                            <th>Total</th>
                            <th>Status</th>
                            <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.user?.nama_lengkap}</td>
                                    <td>{getProductName(item)}</td>
                                    {tipe === "homestay" && (
                                        <>
                                            <td>{item.tanggal_mulai}</td>
                                            <td>{item.tanggal_selesai}</td>
                                        </>
                                    )}

                                    {tipe === "paket_wisata" && (
                                        <>
                                            <td>{item.tanggal_mulai}</td>
                                            <td>{item.paket_wisata_details?.jumlah_orang}</td>
                                        </>
                                        
                                    )}

                                    {tipe === "tour_guide" && (
                                        <>
                                            <td>{item.tour_guide_details?.durasi}</td>
                                            <td>{item.tour_guide_details?.sesi || "-"}</td>
                                        </>
                                    )}

                                    {tipe === "custom" && (
                                        <>
                                            <td>{item.custom_details?.length}</td>

                                            <td>{item.custom_details?.[0]?.jumlah_orang}</td>

                                            <td>{item.custom_details?.[0]?.jenis_tour_guide}</td>

                                            <td>
                                            {item.custom_details?.[0]?.tour_guide
                                                ? item.custom_details?.[0]?.tour_guide?.user?.nama_lengkap
                                                : "Belum ditetapkan"}
                                            </td>
                                        </>
                                    )}
                                    <td>Rp {formatHarga(item.total_harga)}</td>
                                    <td>
                                        <span className="status-badge">
                                        {item.status_pemesanan}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="kebab-wrapper">
                                            <button
                                                className="btn-icon"
                                                onClick={()=>setOpenMenuId(
                                                openMenuId===item.id?null:item.id
                                                )}
                                            >
                                                <FiMoreVertical/>
                                            </button>

                                            {openMenuId===item.id && (
                                                <div className="kebab-menu">
                                                    {item.status_pemesanan === "menunggu verifikasi" && (
                                                        <>
                                                        <button
                                                            onClick={()=>{
                                                            setSelectedItem(item);
                                                            setShowConfirmModal(true);
                                                            setOpenMenuId(null);
                                                            }}
                                                        >
                                                            Konfirmasi
                                                        </button>

                                                        <button
                                                            onClick={()=>{
                                                            setSelectedItem(item);
                                                            setShowRejectModal(true);
                                                            setOpenMenuId(null);
                                                            }}
                                                        >
                                                            Tolak
                                                        </button>
                                                        </>
                                                    )}

                                                    {item.status_pemesanan === "dikonfirmasi" && (
                                                        <>
                                                        <button
                                                            onClick={()=>{
                                                            setSelectedItem(item);
                                                            setShowNotifyModal(true);
                                                            setOpenMenuId(null);
                                                            }}
                                                        >
                                                            Notify
                                                        </button>

                                                        {item.tipe_booking === "custom" &&
                                                            item.custom_details?.[0]?.jenis_tour_guide !== "tanpa" &&
                                                            !item.custom_details?.[0]?.tour_guide && (
                                                            <button
                                                            onClick={()=>{
                                                                setSelectedItem(item);
                                                                loadTourGuides(item.tanggal_mulai);
                                                                setShowAssignGuideModal(true);
                                                                setOpenMenuId(null);
                                                            }}
                                                            >
                                                            Tetapkan Tour Guide
                                                            </button>
                                                        )}
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={()=>{
                                                        setSelectedItem(item);
                                                        setShowDetailModal(true);
                                                        setOpenMenuId(null);
                                                        }}
                                                    >
                                                        Detail
                                                    </button>

                                                    {role === "owner" && item.status_pemesanan === "dikonfirmasi" &&(
                                                        <button
                                                            className="text-danger"
                                                            onClick={()=>{
                                                                setSelectedItem(item);
                                                                setShowCancelModal(true);
                                                                setOpenMenuId(null);
                                                            }}
                                                        >
                                                            Batalkan
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="admin-pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </button>

                        <span>
                            Page {page} / {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>

                    </div>
                </div>
            </div>

            {showDetailModal && selectedItem && (
                <div className="modal-overlay" onClick={()=>setShowDetailModal(false)}>
                    <div className="modal" onClick={(e)=>e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detail Booking</h2>
                            <FiX className="modal-close" onClick={()=>setShowDetailModal(false)}/>
                        </div>

                        <div className="modal-body column">
                            <p><b>ID Booking:</b> {selectedItem.id}</p>
                            <p><b>Pengunjung:</b> {selectedItem.user?.nama_lengkap}</p>
                            <p><b>Tanggal Booking:</b> {selectedItem.tanggal_booking}</p>
                            <p><b>Tanggal Mulai:</b> {selectedItem.tanggal_mulai}</p>
                            <p><b>Tanggal Selesai:</b> {selectedItem.tanggal_selesai}</p>
                            <p><b>Total Harga:</b> Rp {formatHarga(selectedItem.total_harga)}</p>
                            <p><b>Status:</b> {selectedItem.status_pemesanan}</p>
                            {selectedItem.status_pemesanan === "ditolak" && (
                                <p>
                                    <b>Alasan Penolakan:</b> {selectedItem.alasan_penolakan}
                                </p>
                            )}

                            <hr/>

                            {selectedItem.tipe_booking === "paket_wisata" && (
                                <>
                                    <p><b>Paket Wisata:</b> {selectedItem.paket_wisata_details?.paket_wisata?.nama}</p>
                                    <p><b>Jumlah Orang:</b> {selectedItem.paket_wisata_details?.jumlah_orang}</p>
                                </>
                            )}

                            {selectedItem.tipe_booking === "homestay" && (
                                <>
                                    <p><b>Homestay:</b> {selectedItem.homestay_details?.homestay?.nama}</p>
                                    <p><b>Kamar:</b> {selectedItem.homestay_details?.kamar?.nama}</p>
                                </>
                            )}

                            {selectedItem.tipe_booking === "tour_guide" && (
                                <>
                                    <p><b>Tour Guide:</b> {selectedItem.tour_guide_details?.tour_guide?.user?.nama_lengkap}</p>
                                    <p><b>Durasi:</b> {selectedItem.tour_guide_details?.durasi}</p>
                                    <p><b>Sesi:</b> {selectedItem.tour_guide_details?.sesi || "-"}</p>
                                </>
                            )}

                            {selectedItem.tipe_booking === "custom" && (
                                <>
                                    <p><b>Jumlah Orang:</b> {selectedItem.custom_details?.[0]?.jumlah_orang}</p>

                                    <p><b>Jenis Tour Guide:</b> {selectedItem.custom_details?.[0]?.jenis_tour_guide}</p>

                                    <p><b>Paket Dipilih:</b></p>

                                    <ul>
                                    {selectedItem.custom_details?.map((detail, index) => (
                                        <li key={index}>
                                        {detail.paket_wisata?.nama}
                                        </li>
                                    ))}
                                    </ul>
                                </>
                            )}

                            <hr/>

                            {selectedItem.bukti_pembayaran && (
                            <>
                                <p><b>Bukti Pembayaran:</b></p>
                                <img
                                    className="payment-proof-img"
                                    src={`${BASE_URL}/storage/${selectedItem.bukti_pembayaran}`}
                                    alt="bukti"
                                />
                            </>
                            )}

                            {selectedItem.norek_refund && (
                            <>
                                <p><b>Bank Refund:</b> {selectedItem.bank_refund}</p>
                                <p><b>No Rekening:</b> {selectedItem.norek_refund}</p>
                                <p><b>Nama Rekening:</b> {selectedItem.nama_rekening_refund}</p>
                            </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showNotifyModal && (
                <div className="modal-overlay" onClick={()=>setShowNotifyModal(false)}>
                    <div className="modal" onClick={(e)=>e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Kirim Notifikasi</h2>
                            <FiX className="modal-close" onClick={()=>setShowNotifyModal(false)} />
                        </div>

                        <div className="modal-body column">

                            <input
                                type="text"
                                placeholder="Judul notifikasi (contoh: Perubahan Jadwal)"
                                value={notifyTitle}
                                onChange={(e)=>setNotifyTitle(e.target.value)}
                            />

                            <textarea
                                placeholder="Tulis pesan untuk pemesan"
                                value={notifyMessage}
                                onChange={(e)=>setNotifyMessage(e.target.value)}
                            />

                            <button
                                className="btn-primary"
                                onClick={handleSendNotify}
                                disabled={sending}
                            >
                                {sending ? "Mengirim..." : "Kirim Email"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal modal-center">

                        <div className="modal-icon-wrapper">
                            <div className="modal-icon success">?</div>
                        </div>

                        <h3 className="modal-title">
                            Konfirmasi Booking
                        </h3>

                        <p className="modal-message">
                            Apakah Anda yakin ingin mengonfirmasi booking ini?
                        </p>

                        <div className="modal-actions">
                            <button
                                className="btn-primary"
                                onClick={handleConfirm}
                                disabled={submitting}
                            >
                                {submitting ? "Memproses..." : "Konfirmasi"}
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={()=>setShowConfirmModal(false)}
                            >
                            Batal
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal modal-center">

                    <div className="modal-icon-wrapper">
                        <div className="modal-icon error">!</div>
                    </div>

                    <h3 className="modal-title">
                        Tolak Booking
                    </h3>

                    <p className="modal-message">
                        Masukkan alasan penolakan booking
                    </p>

                    <textarea
                        className="modal-textarea"
                        placeholder="Tulis alasan penolakan..."
                        value={rejectReason}
                        onChange={(e)=>setRejectReason(e.target.value)}
                    />

                    <div className="modal-actions">
                        <button
                            className="btn-danger"
                            onClick={handleReject}
                            disabled={submitting}
                        >
                            {submitting ? "Memproses..." : "Tolak Booking"}
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={()=>setShowRejectModal(false)}
                        >
                        Batal
                        </button>

                    </div>

                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal modal-center">

                        <div className="modal-icon-wrapper">
                            <div className="modal-icon error">!</div>
                        </div>

                        <h3 className="modal-title">
                            Batalkan Booking
                        </h3>

                        <p className="modal-message">
                            Apakah Anda yakin ingin membatalkan booking ini?
                            <br />
                        </p>

                        <div className="modal-actions">
                            <button
                                className="btn-danger"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                {submitting ? "Memproses..." : "Batalkan"}
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={()=>setShowCancelModal(false)}
                            >
                                Kembali
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {showAssignGuideModal && selectedItem && (
                <div className="modal-overlay" onClick={()=>setShowAssignGuideModal(false)}>
                    <div className="modal" onClick={(e)=>e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <h2>Tetapkan Tour Guide</h2>
                            <FiX 
                                className="modal-close" 
                                onClick={()=>setShowAssignGuideModal(false)}
                            />
                        </div>

                        <div className="modal-body column">

                            <p>
                                Booking ID: <b>{selectedItem.id}</b>
                            </p>

                            <select
                                className="input"
                                value={selectedGuide}
                                onChange={(e)=>setSelectedGuide(e.target.value)}
                            >
                                <option value="">-- Pilih Tour Guide --</option>

                                {tourGuides.map(guide => (
                                    <option key={guide.id} value={guide.id}>
                                        {guide.user?.nama_lengkap}
                                    </option>
                                ))}
                            </select>

                           <button
                                className="btn-primary"
                                onClick={handleAssignGuide}
                                disabled={submitting}
                            >
                                {submitting ? "Menyimpan..." : "Simpan"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar
            />

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

                        <h3 className="modal-title">
                            {modal.type === "success" && "Berhasil"}
                            {modal.type === "error" && "Terjadi Kesalahan"}
                        </h3>

                        <p className="modal-message">
                            {modal.message}
                        </p>

                        <button
                            className="modal-button"
                            onClick={() => setModal({ ...modal, show: false })}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>

    );

};

export default AdminBookingPage;