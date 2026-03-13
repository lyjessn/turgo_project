import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import ProfileCard from "../../components/dashboard/ProfileCard";
import "./Dashboard.css";

import { getTourGuideBookings } from "../../api/apiBooking";
import { getHomestayBookings } from "../../api/apiBooking";
import { getPelakuWisataBookings } from "../../api/apiBooking";

const DashboardMitra = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const role = user?.role?.name;

  useEffect(() => {

    if(!role) return;

    const fetchBookings = async () => {
        try {
        let res = [];
        const normalizedRole = role?.toLowerCase().replace(" ", "_");
        console.log(normalizedRole);

        if(normalizedRole === "tour_guide"){
          res = await getTourGuideBookings();
        }

        if(normalizedRole === "homestay"){
          res = await getHomestayBookings();
        }

        if(normalizedRole === "pelaku_wisata"){
          res = await getPelakuWisataBookings();
        }

        console.log("BOOKINGS FROM API:", res);
        setBookings(res);

        } catch (err) {
        console.error(err);
        }
    };

    fetchBookings();
  }, [role]);

  const validBookings = bookings.filter(
    b => b.status_pemesanan === "dikonfirmasi" ||
         b.status_pemesanan === "selesai"
  );

  const totalBooking = validBookings.length;

  const aktif = validBookings.filter(
    b => b.status_pemesanan === "dikonfirmasi"
  ).length;

  const selesai = validBookings.filter(
    b => b.status_pemesanan === "selesai"
  ).length;

  const totalPenghasilan = bookings
    .filter(b => b.status_pemesanan === "selesai")
    .reduce((sum,b)=> sum + Number(b.total_harga),0);

  const latestBookings = [...validBookings]
    .sort((a,b)=> new Date(b.tanggal_booking) - new Date(a.tanggal_booking))
    .slice(0,5);

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
            <h4>Booking Aktif</h4>
            <p>{aktif}</p>
          </div>

          <div className="stat-card">
            <h4>Booking Selesai</h4>
            <p>{selesai}</p>
          </div>

          <div className="stat-card">
            <h4>Total Penghasilan</h4>
            <p>
              Rp {totalPenghasilan.toLocaleString("id-ID")}
            </p>
          </div>

        </div>

      </div>


      <h2 className="dashboard-section-title">Booking Terbaru</h2>

      <div className="dashboard-table">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Wisatawan</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {latestBookings.map((b)=> (

              <tr key={b.id}>

                <td>#{b.id}</td>

                <td>{b.user?.nama_lengkap}</td>

                <td>
                  {new Date(b.tanggal_mulai).toLocaleDateString()}
                </td>

                <td>
                  Rp {Number(b.total_harga).toLocaleString("id-ID")}
                </td>

                <td>
                  <span className={`status ${
                    b.status_pemesanan === "dikonfirmasi"
                      ? "confirmed"
                      : b.status_pemesanan === "selesai"
                      ? "completed"
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

export default DashboardMitra;