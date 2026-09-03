import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/baseUrl";
import { useAuth } from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { confirmPayment, getBookingDetail } from "../../api/apiBooking";
import "./css/Pembayaran.css";
import "../adminDanOwner/css/Modal.css";
import { FaCalendar, FaUsers } from "react-icons/fa";

const Pembayaran = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [form, setForm] = useState({
    norek: "",
    bank: "",
    nama: ""
  });

  const [bukti, setBukti] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });

  const isValid = bukti && form.norek && form.bank && form.nama;

  useEffect(() => {

    if (!id) return;

    const fetchBooking = async () => {
      try {
        const data = await getBookingDetail(id);
        console.log("BOOKING DETAIL:", data);
        setBooking(data);

      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    fetchBooking();

  }, [id, navigate]);

  useEffect(() => {

    if (!user) {
      navigate("/login");
    }

  }, [user, navigate]);

  useEffect(() => {

    if (!booking?.expired_at) return;

    const expireTime = new Date(booking.expired_at).getTime();

    const interval = setInterval(() => {

      const now = new Date().getTime();
      const diff = Math.floor((expireTime - now) / 1000);

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);

        setModal({
          show: true,
          type: "expired",
          message: "Waktu pembayaran habis. Pesanan dibatalkan otomatis."
        });

        return;
      }

      setTimeLeft(diff);

    }, 1000);

    return () => clearInterval(interval);

  }, [booking]);

  const guideJenis = booking?.custom_details?.[0]?.jenis_tour_guide || "tanpa";

  const guideHarga =
    guideJenis === "full day"
      ? 300000
      : guideJenis === "half day"
      ? 150000
      : 0;

  const formatTime = () => {

    if (timeLeft === null) return "-- : -- : --";

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    return `${h.toString().padStart(2,"0")} : ${m
      .toString()
      .padStart(2,"0")} : ${s.toString().padStart(2,"0")}`;
  };

  const handleSubmit = async () => {
    try {

      setSubmitting(true);

      const formData = new FormData();

      formData.append("bukti_pembayaran", bukti);
      formData.append("norek_refund", form.norek);
      formData.append("bank_refund", form.bank);
      formData.append("nama_rekening_refund", form.nama);

      await confirmPayment(booking.id, formData);

      setModal({
        show: true,
        type: "success",
        message: "Pembayaran berhasil dikirim dan sedang diverifikasi admin."
      });

    } catch (err) {

      console.log("FULL ERROR:", err);

      let message = "Gagal mengirim pembayaran.";

      if (err.response) {

        const responseErrors = err.response.data?.errors;

        if (responseErrors) {
          message = Object.values(responseErrors)
            .flat()
            .join("\n");
        } else {
          message =
            err.response.data?.message ||
            "Terjadi kesalahan.";
        }

      } else if (err.message) {
        message = err.message;
      } else {
        message = "Tidak dapat terhubung ke server.";
      }

      setModal({
        show: true,
        type: "error",
        message
      });

    } finally {
      setSubmitting(false);
    }
  };

  const items = [];

  if (booking?.custom_details?.length) {
    booking.custom_details.forEach(d => {
      if (d.paket_wisata) items.push(d.paket_wisata);
    });
  }

  if (booking?.paket_wisata_details?.paket_wisata) {
    items.push(booking.paket_wisata_details.paket_wisata);
  }

  const homestayDetail = booking?.homestay_details;
  const kamar = homestayDetail?.kamar;
  const homestay = homestayDetail?.homestay;

  const tourGuideDetail = booking?.tour_guide_details;
  const guide = tourGuideDetail?.tour_guide;

  const total = booking?.total_harga || 0;

  if (!booking) {
    return <div className="payment-container">Loading...</div>;
  }

  return (
    <>
      <div className="payment-container">

        <h1>Pembayaran</h1>

        <p style={{marginBottom:"20px", color:"#666"}}>
          Booking ID #{booking.id}
        </p>

        <div className="payment-card">

          <h3>Rincian Pesanan</h3>

          <div className="payment-summary-list">

            {items.map(p => {

              let detail = null;

              if (booking?.paket_wisata_details) {
                detail = booking.paket_wisata_details;
              }

              if (!detail && booking?.custom_details?.length) {
                detail = booking.custom_details.find(
                  d => d.paket_wisata?.id === p.id
                );
              }

              const jumlah = detail?.jumlah_orang || 1;
              const subtotal = p.harga * jumlah;

              return (
                <div key={p.id} className="payment-summary">

                  <img src={`${BASE_URL}/storage/${p.url_thumbnail}`} />

                  <div>
                    <b>{p.nama}</b>

                    <p>
                      Rp {Number(p.harga).toLocaleString("id-ID")} / orang
                    </p>

                    <p>
                      <FaUsers style={{marginRight:6}}/>
                      {jumlah} orang
                    </p>

                    <p style={{fontWeight:"600"}}>
                      Subtotal: Rp {subtotal.toLocaleString("id-ID")}
                    </p>

                  </div>

                </div>
              );
            })}

            {guide && (
              <div className="payment-summary">

                <img src={`${BASE_URL}/storage/${guide.foto_profil}`} />

                <div>
                  <b>{guide.user?.nama_lengkap}</b>

                  <p>
                    Rp {Number(guide.harga_per_hari).toLocaleString("id-ID")} / hari
                  </p>

                  <p>
                    {tourGuideDetail?.durasi} 
                    {tourGuideDetail?.sesi && ` (${tourGuideDetail.sesi})`}
                  </p>

                </div>

              </div>
            )}

            {kamar && (
              <div className="payment-summary">

                <img src={`${BASE_URL}/storage/${kamar.foto}`} />

                <div>
                  <b>{kamar.nama}</b>

                  <p>{homestay?.nama}</p>

                  <p>
                    Rp {Number(kamar.harga_per_malam).toLocaleString("id-ID")} / malam
                  </p>

                  <p>
                    {booking.tanggal_mulai} - {booking.tanggal_selesai}
                  </p>

                </div>

              </div>
            )}

            {guideJenis !== "tanpa" && !guide && (
              <div className="payment-summary">
                <div>
                  <b>Tour Guide ({guideJenis})</b>
                  <p>
                    Rp {guideHarga.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            )}

            <div className="payment-divider"></div>

            <div className="payment-meta">

              <div className="meta-item">
                <FaCalendar className="meta-icon"/>
                <span>{booking.tanggal_mulai}</span>
              </div>

            </div>

            <div className="payment-total-wrapper">

              <div className="payment-total-card">

                <div className="payment-total-main">

                  <span className="total-label">
                    Total Pembayaran
                  </span>

                  <span className="total-value">
                    Rp {Number(total).toLocaleString("id-ID")}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="timer-card center">

          <h3>Sisa Waktu Pembayaran</h3>

          <div className="payment-timer">

            <div className="payment-timer-icon">
              ⏱
            </div>

            <div className="payment-timer-text">
              {formatTime()}
            </div>

            <p style={{
              fontSize:"13px",
              color:"#666",
              marginTop:"6px",
              textAlign:"center"
            }}>
              Pemesanan akan dibatalkan otomatis jika pembayaran tidak diselesaikan dalam waktu 30 menit.
            </p>

          </div>

        </div>

        <div className="payment-card">

          <h3>
            Upload Bukti Transfer <span style={{color:"red"}}>*</span>
          </h3>
          <p>Transfer ke BCA 12345678 a/n Desa Wisata Turgo (Max 4mb)</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e)=>setBukti(e.target.files[0])}
          />

        </div>

        <div className="payment-card">

          <h3>
            Informasi Pengembalian Dana <span style={{color:"red"}}>*</span>
          </h3>

          <p className="refund-note">
            Data rekening ini diperlukan apabila terjadi kendala pada pesanan 
            atau pesanan perlu dibatalkan sehingga proses pengembalian dana 
            dapat dilakukan lebih cepat.
          </p>

          <input
            placeholder="Nomor rekening minimal 8 digit"
            onChange={(e)=>setForm({...form,norek:e.target.value})}
          />

          <input
            placeholder="Nama bank tujuan"
            onChange={(e)=>setForm({...form,bank:e.target.value})}
          />

          <input
            placeholder="Nama pemilik rekening"
            onChange={(e)=>setForm({...form,nama:e.target.value})}
          />

        </div>

        <button
          className="payment-btn"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Mengirim..." : "Konfirmasi Pembayaran"}
        </button>

      </div>

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

              {modal.type === "expired" && (
                <div className="modal-icon expired">!</div>
              )}

            </div>

            <h3 className="modal-title">

              {modal.type === "success" && "Pembayaran Berhasil"}
              {modal.type === "error" && "Terjadi Kesalahan"}
              {modal.type === "expired" && "Waktu Pembayaran Habis"}

            </h3>

            <p className="modal-message">
              {modal.message}
            </p>

            <button
              className="modal-button"
              onClick={() => {
                setModal({ ...modal, show: false });

                if (modal.type === "success") {
                  navigate("/profile?tab=booking");
                }

                if (modal.type === "expired") {
                  navigate("/profile?tab=booking");
                }
              }}
            >
              OK
            </button>

          </div>

        </div>

      )}

    </>
  );
};

export default Pembayaran;