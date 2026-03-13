import CardLaporan from "../../components/laporan/CardLaporan";
import { useAuth } from "../../auth/useAuth";
import "./css/Laporan.css";
import { downloadLaporan } from "../../api/apiLaporan";

const Laporan = () => {
  const { user } = useAuth();
  const role = user?.role?.name;

    const laporanOwner = [
        {
            title: "Laporan Booking Paket Wisata",
            desc: "Laporan pemesanan paket wisata per bulan dan per tahun",
            endpoint: "paket-wisata",
            periode: "owner",
        },
        {
            title: "Laporan Booking Paket Custom",
            desc: "Laporan pemesanan paket custom",
            endpoint: "custom",
            periode: "owner",
        },
        {
            title: "Laporan Booking Homestay",
            desc: "Laporan pemesanan homestay",
            endpoint: "homestay",
            periode: "owner",
        },
        {
            title: "Laporan Booking Tour Guide",
            desc: "Laporan pemesanan tour guide",
            endpoint: "tourguide",
            periode: "owner",
        },
        {
            title: "Laporan Booking Paket Wisata Per Kategori",
            desc: "Laporan berdasarkan kategori",
            endpoint: "kategori-paket",
            periode: "owner",
        },
        {
            title: "Laporan Booking Keseluruhan",
            desc: "Semua booking bulanan",
            endpoint: "booking",
            periode: "owner",
        },
        {
            title: "Laporan Booking Batal",
            desc: "Booking yang dibatalkan",
            endpoint: "booking/batal",
            periode: "owner",
        },
        {
            title: "Laporan Blockout Date",
            desc: "Blockout per bulan dan per tahun",
            endpoint: "blockout",
            periode: "owner",
        },
    ];

    const laporanAdmin = [
        {
            title: "Laporan Booking Paket Wisata Mingguan",
            desc: "Booking paket wisata mingguan",
            endpoint: "paket-wisata",
            periode: "weekly",
        },
        {
            title: "Laporan Booking Custom Mingguan",
            desc: "Booking custom mingguan",
            endpoint: "custom",
            periode: "weekly",
        },
        {
            title: "Laporan Booking Homestay Mingguan",
            desc: "Booking homestay mingguan",
            endpoint: "homestay",
            periode: "weekly",
        },
        {
            title: "Laporan Booking Tour Guide Mingguan",
            desc: "Booking tour guide mingguan",
            endpoint: "tourguide",
            periode: "weekly",
        },
        {
            title: "Laporan Blockout Date",
            desc: "Laporan blockout per bulan dan per tahun",
            endpoint: "blockout",
            periode: "owner",
        }
    ];

    const handleDownload = (endpoint, params) => {

        let url = endpoint;
        let periode = params.periodeType || "";

        if(periode){
            url += `/${periode}`;
        }

        const filename = `laporan_${endpoint.replace("/", "_")}${periode ? "_" + periode : ""}.pdf`;

        downloadLaporan(url, params, filename);
    };

    let laporanList = [];

    if(role === "owner"){
        laporanList = laporanOwner;
    }
    else if(role === "admin"){
        laporanList = laporanAdmin;
    }

  return (
    <div className="laporan-page">

      <h2 className="laporan-heading">Laporan Turgo</h2>

      <p className="laporan-subtitle">
        Unduh laporan dalam format PDF berdasarkan periode dan jenis layanan
      </p>

      {laporanList.map((laporan, index) => (
       <CardLaporan
            key={laporan.endpoint}
            title={laporan.title}
            description={laporan.desc}
            periodeMode={laporan.periode}
            onDownload={(params)=>handleDownload(laporan.endpoint, params, laporan.title)}
        />
      ))}

    </div>
  );
};

export default Laporan;