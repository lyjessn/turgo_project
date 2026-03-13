import {useEffect,useState} from "react";
import ProfileCard from "../../components/dashboard/ProfileCard";
import "./Dashboard.css";
import { getAdminBookings } from "../../api/apiBooking";

const DashboardAdminOwner = () => {
    const [bookings, setBookings] = useState([]);
    const totalBooking = bookings.length;
    const menunggu = bookings.filter((b) => b.status_pemesanan === "menunggu verifikasi").length;
    const dikonfirmasi = bookings.filter((b) => b.status_pemesanan === "dikonfirmasi").length;
    const ditolak = bookings.filter((b) => b.status_pemesanan === "ditolak").length;

    const latestBookings = [...bookings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);


    useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const bookingRes = await getAdminBookings();
            setBookings(bookingRes);
        } catch (err) {
            console.error(err);
        }
    };

    fetchDashboard();
    }, []);

  return (
    <div className="admin-page">

        <h1>Beranda</h1>

        <div className="dashboard-row">

            <ProfileCard />
            <div className="dashboard-grid-top">
                <div className="stat-card">
                    <h4>Total Booking</h4>
                    <p>{totalBooking}</p>
                </div>

                <div className="stat-card">
                    <h4>Menunggu Verifikasi</h4>
                    <p>{menunggu}</p>
                </div>

                <div className="stat-card">
                    <h4>Dikonfirmasi</h4>
                    <p>{dikonfirmasi}</p>
                </div>

                <div className="stat-card">
                    <h4>Ditolak</h4>
                    <p>{ditolak}</p>
                </div>
            </div>

        </div>

        <h2 className="dashboard-section-title">Booking Terbaru</h2>

        <div className="dashboard-table">

            <table>

                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Tipe</th>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {latestBookings.map((b) => (
                        <tr key={b.id}>
                            <td>#{b.id}</td>
                            <td>{b.tipe_booking}</td>
                            <td>{new Date(b.tanggal_booking).toLocaleDateString()}</td>
                            <td>Rp {Number(b.total_harga).toLocaleString("id-ID")}</td>
                            <td>
                                <span className={`status ${
                                    b.status_pemesanan === "dikonfirmasi"
                                    ? "confirmed"
                                    : b.status_pemesanan === "menunggu verifikasi"
                                    ? "pending"
                                    : b.status_pemesanan === "ditolak"
                                    ? "rejected"
                                    : b.status_pemesanan === "selesai"
                                    ? "completed"
                                    : b.status_pemesanan === "batal"
                                    ? "cancelled"
                                    : ""
                                }`}>
                                    {b.status_pemesanan}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>

        </div>

    </div>
  );
};

export default DashboardAdminOwner;