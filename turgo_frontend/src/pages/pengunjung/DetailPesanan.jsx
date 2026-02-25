import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import {getBookingDetail} from "../../api/apiBooking";
import "../public/css/Detail.css";

const DetailPesanan=()=>{
    const{id}=useParams();
    const navigate=useNavigate();
    const[booking,setBooking]=useState(null);
    const[loading,setLoading]=useState(true);

    useEffect(()=>{fetchDetail()},[id]);

    const fetchDetail=async()=>{
        try{
            const res=await getBookingDetail(id);
            setBooking(res);
        }catch{
            alert("Gagal load detail");
        }finally{
            setLoading(false);
        }
    };

    if(loading)return<div className="detail-container">Loading...</div>;
    if(!booking)return<div className="detail-container">Tidak ditemukan</div>;

    const isCustom=booking.tipe_booking==="custom";
    const isPaket=booking.tipe_booking==="paket_wisata";
    const isHomestay=booking.tipe_booking==="homestay";
    const isGuide=booking.tipe_booking==="tour_guide";

    return(
        <div className="detail-container">

            <h1 className="detail-title">Detail Pesanan</h1>

            <div className="detail-section">
                <h3 className="detail-section-title">Ringkasan Pesanan</h3>

                <div className="detail-info-list">

                    {isCustom&&booking.custom_details?.map(d=>(
                        <div key={d.id} className="detail-info-item">

                            <img
                                src={`http://127.0.0.1:8000/storage/${d.paket_wisata.url_thumbnail}`}
                                className="detail-thumb-small"
                            />

                            <div>

                                <div className="detail-summary-text">
                                    {d.paket_wisata.nama}
                                </div>

                                <div className="detail-description">
                                    Rp {Number(d.paket_wisata.harga).toLocaleString("id-ID")} /orang
                                </div>

                            </div>

                        </div>
                    ))}

                    {isCustom&&booking.custom_details?.[0]?.jenis_tour_guide!=="tanpa"&&(
                        <div className="detail-info-item">
                            <strong>Tour Guide</strong>
                            <span>
                                {booking.custom_details[0].jenis_tour_guide==="full day"?"Full Day":"Half Day"}
                            </span>
                        </div>
                    )}

                    {isPaket&&booking.paket_wisata_details&&(
                        <div className="detail-info-item">

                            <img
                                src={`http://127.0.0.1:8000/storage/${booking.paket_wisata_details.paket_wisata.url_thumbnail}`}
                                className="detail-thumb-small"
                            />

                            <div>

                                <div className="detail-summary-text">
                                    {booking.paket_wisata_details.paket_wisata.nama}
                                </div>

                                <div className="detail-description">
                                    {booking.paket_wisata_details.jumlah_orang} orang
                                </div>

                            </div>

                        </div>
                    )}

                    {isHomestay&&booking.homestay_details&&(
                        <div className="detail-info-item">

                            <img
                                src={`http://127.0.0.1:8000/storage/${booking.homestay_details.kamar.foto}`}
                                className="detail-thumb-small"
                            />

                            <div>

                                <div className="detail-summary-text">
                                    {booking.homestay_details.homestay.nama}
                                </div>

                                <div className="detail-description">
                                    Kamar: {booking.homestay_details.kamar.nama}
                                </div>

                                <div className="detail-description">
                                    Rp {Number(
                                        booking.homestay_details.kamar.harga_per_malam
                                    ).toLocaleString("id-ID")} /malam
                                </div>

                            </div>

                        </div>
                    )}

                    {isGuide&&booking.tour_guide_details&&(
                        <div className="detail-info-item">

                            <img
                                src={`http://127.0.0.1:8000/storage/${booking.tour_guide_details.tour_guide.foto_profil}`}
                                className="detail-thumb-avatar"
                            />

                            <div>

                                <div className="detail-summary-text">
                                    {booking.tour_guide_details.tour_guide.nama}
                                </div>

                                <div className="detail-description">
                                    {booking.tour_guide_details.durasi}
                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </div>

            <div className="detail-section">
                <h3 className="detail-section-title">Informasi Booking</h3>

                <div className="detail-info-list">

                    <div className="detail-info-item">
                        <strong>ID Order</strong>
                        <span>#{booking.id}</span>
                    </div>

                    <div className="detail-info-item">
                        <strong>Status</strong>
                        <span>{booking.status_pemesanan}</span>
                    </div>

                    <div className="detail-info-item">
                        <strong>Tanggal Mulai</strong>
                        <span>{booking.tanggal_mulai}</span>
                    </div>

                    <div className="detail-info-item">
                        <strong>Tanggal Selesai</strong>
                        <span>{booking.tanggal_selesai}</span>
                    </div>

                </div>
            </div>

            <div className="detail-section">

                <h3 className="detail-section-title">
                    Detail Pemesanan
                </h3>

                <div className="detail-info-list">
                    {(isCustom||isPaket)&&(
                        <div className="detail-info-item">
                            <strong>Jumlah Orang: </strong>
                            <span>
                                {isCustom
                                    ? booking.custom_details?.[0]?.jumlah_orang
                                    : booking.paket_wisata_details?.jumlah_orang
                                } orang
                            </span>
                        </div>
                    )}

                    {isHomestay&&(
                        <div className="detail-info-item">
                            <strong>Durasi Menginap: </strong>
                            <span>
                                {Math.max(
                                    1,
                                    Math.ceil(
                                        (new Date(booking.tanggal_selesai)-new Date(booking.tanggal_mulai))
                                        /(1000*60*60*24)
                                    )
                                )} malam
                            </span>
                        </div>
                    )}

                    {isGuide&&(
                        <div className="detail-info-item">
                            <strong>Durasi Guide: </strong>
                            <span>
                                {booking.tour_guide_details?.durasi}
                            </span>
                        </div>
                    )}

                    <div className="detail-info-item">
                        <strong>Tanggal Kegiatan: </strong>
                        <span>
                            {booking.tanggal_mulai}
                            {booking.tanggal_selesai!==booking.tanggal_mulai&&
                                ` s/d ${booking.tanggal_selesai}`
                            }
                        </span>
                    </div>

                </div>

            </div>

            <div className="detail-section">
                <h3 className="detail-section-title">Total Pembayaran</h3>

                <div className="detail-total-price">
                    Rp {Number(booking.total_harga).toLocaleString("id-ID")}
                </div>
            </div>

        </div>
    );
};

export default DetailPesanan;