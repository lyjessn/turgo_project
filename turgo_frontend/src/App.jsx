import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/auth/Unauthorized";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Homepage from "./pages/public/Homepage";
import Wisata from "./pages/public/Wisata";
import TourGuide from "./pages/public/TourGuide";
import Homestay from "./pages/public/Homestay";
import Budaya from "./pages/public/Budaya";
import Kuliner from "./pages/public/Kuliner";
import Custom from "./pages/public/Custom";

import DetailPaketWisata from "./pages/public/PaketWisataDetail";
import TourGuideDetail from "./pages/public/TourGuideDetail";
import HomestayDetail from "./pages/public/HomestayDetail";
import KamarDetail from "./pages/public/KamarDetail";

import Ulasan from "./pages/public/Ulasan";
import Pembayaran from "./pages/pengunjung/Pembayaran";
import Profile from "./pages/pengunjung/profile";
import DetailPesanan from "./pages/pengunjung/DetailPesanan";
import BeriUlasan from "./pages/pengunjung/BeriUlasan";

import ProtectedRoute from "./auth/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import DashboardRouter from "./pages/dashboard/DashboardRouter";

import AdminMitra from "./pages/adminDanOwner/AdminMitra";
import AdminKebudayaan from "./pages/adminDanOwner/AdminKebudayaan";
import AdminUmkm from "./pages/adminDanOwner/AdminUmkm";

import AdminPaketWisata from "./pages/adminDanOwner/paket wisata/AdminPaketWisata";
import AdminPaketWisataDetail from "./pages/adminDanOwner/paket wisata/AdminPaketWisataDetail";
import TambahPaketWisata from "./pages/adminDanOwner/paket wisata/TambahPaketWisata";
import EditPaketWisata from "./pages/adminDanOwner/paket wisata/EditPaketWisata";

import AdminHomestay from "./pages/adminDanOwner/homestay/AdminHomestay";
import AdminHomestayDetail from "./pages/adminDanOwner/homestay/AdminHomestayDetail";
import TambahHomestay from "./pages/adminDanOwner/homestay/TambahHomestay";
import EditHomestay from "./pages/adminDanOwner/homestay/EditHomestay";

import AdminTourGuide from "./pages/adminDanOwner/AdminTourGuide";
import AdminPelakuWisata from "./pages/adminDanOwner/AdminPelakuWisata";

import AdminBookingPaketWisata from "./pages/adminDanOwner/pemesanan/AdminBookingPaketWisata";
import AdminBookingHomestay from "./pages/adminDanOwner/pemesanan/AdminBookingHomestay";
import AdminBookingTourGuide from "./pages/adminDanOwner/pemesanan/AdminBookingTourGuide";
import AdminBookingCustom from "./pages/adminDanOwner/pemesanan/AdminBookingCustom";

import AdminReviews from "./pages/adminDanOwner/AdminReviews";

import OwnerPengunjung from "./pages/owner/OwnerPengunjung";
import OwnerAdmin from "./pages/owner/OwnerAdmin";

import Penjadwalan from "./pages/Penjadwalan";

import HomestayData from "./pages/user homestay/HomestayData";
import KamarSaya from "./pages/user homestay/KamarSaya";
import HomestayBooking from "./pages/user homestay/HomestayBooking";
import HomestayPenghasilan from "./pages/user homestay/HomestayPenghasilan";

import PaketSaya from "./pages/user pelaku wisata/PaketSaya";
import PelakuWisataBooking from "./pages/user pelaku wisata/PelakuWisataBooking";
import PelakuWisataPenghasilan from "./pages/user pelaku wisata/PelakuWisataPenghasilan";

import TourGuideSaya from "./pages/user tour guide/TourGuideSaya";
import TourGuideBooking from "./pages/user tour guide/TourGuideBooking";
import TourGuidePenghasilan from "./pages/user tour guide/TourGuidePenghasilan";

import Laporan from "./pages/adminDanOwner/Laporan";

function App() {
  
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      <Route element={<PublicLayout />}>

        <Route index element={<Homepage />} />

        <Route path="wisata" element={<Wisata />} />
        <Route path="tour-guide" element={<TourGuide />} />
        <Route path="homestay" element={<Homestay />} />
        <Route path="budaya" element={<Budaya />} />
        <Route path="kuliner" element={<Kuliner />} />
        
        <Route path="paket-wisata/custom" element={<Custom />} />

        <Route path="paket-wisata/:id" element={<DetailPaketWisata />} />
        <Route path="tour-guide/:id" element={<TourGuideDetail />} />
        <Route path="homestay/:id" element={<HomestayDetail />} />

        <Route path="tour-guide/:id/reviews" element={<Ulasan />} />
        <Route path="paket-wisata/:id/reviews" element={<Ulasan />} />
        <Route path="homestay/:id/reviews" element={<Ulasan />} />

        <Route path="homestay/:id/kamar/:kamarId" element={<KamarDetail />} />


        <Route element={<ProtectedRoute roles={["pengunjung"]} />}>

          <Route path="pembayaran/:id" element={<Pembayaran />} />
          <Route path="profile" element={<Profile />} />
          <Route path="booking/:id" element={<DetailPesanan />} />
          <Route path="beri-ulasan/:id" element={<BeriUlasan />} />

        </Route>

      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>

        <Route
            element={
              <ProtectedRoute roles={[
                "admin",
                "owner",
                "tour_guide",
                "homestay",
                "pelaku_wisata",
                "umkm"
              ]}/>
            }
          >
            <Route index element={<DashboardRouter />} />
          </Route>

        <Route
          element={
            <ProtectedRoute roles={[
              "admin",
              "owner",
              "tour_guide",
              "homestay",
              "pelaku_wisata",
            ]}/>
          }
        >
          <Route path="penjadwalan" element={<Penjadwalan />} />
          <Route path="reviews/:tipe/:id" element={<AdminReviews />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin","owner","pelaku_wisata"]}/>}>
          <Route path="paket-wisata/edit/:id" element={<EditPaketWisata />} />
          
          <Route path="paket-wisata/:id" element={<AdminPaketWisataDetail />} />

        </Route>

        <Route element={<ProtectedRoute roles={["admin","owner"]}/>}>
          
          <Route path="mitra" element={<AdminMitra />} />
          <Route path="kebudayaan" element={<AdminKebudayaan />} />
          <Route path="umkm" element={<AdminUmkm />} />

          <Route path="paket-wisata" element={<AdminPaketWisata />} />
          <Route path="paket-wisata/tambah" element={<TambahPaketWisata />} />
          
          <Route path="homestay" element={<AdminHomestay />} />
          <Route path="homestay/:id" element={<AdminHomestayDetail />} />
          <Route path="homestay/tambah" element={<TambahHomestay />} />
          <Route path="homestay/edit/:id" element={<EditHomestay />} />

          <Route path="tour-guide" element={<AdminTourGuide />} />

          <Route path="booking/paket-wisata" element={<AdminBookingPaketWisata />} />
          <Route path="booking/homestay" element={<AdminBookingHomestay />} />
          <Route path="booking/tour-guide" element={<AdminBookingTourGuide />} />
          <Route path="booking/custom" element={<AdminBookingCustom />} />

          <Route path="pelaku-wisata" element={<AdminPelakuWisata />} />

          <Route path="/dashboard/laporan" element={<Laporan />}/>

        </Route>

        <Route element={<ProtectedRoute roles={["owner"]}/>}>
          <Route path="users/pengunjung" element={<OwnerPengunjung />} />
          <Route path="users/admin" element={<OwnerAdmin />} />
        </Route>

        <Route element={<ProtectedRoute roles={["homestay"]}/>}>
          <Route path="homestay-saya" element={<HomestayData />} />
          <Route path="homestay-saya/kamar" element={<KamarSaya />} />
          <Route path="booking/homestay-saya" element={<HomestayBooking />} />
          <Route path="penghasilan/homestay-saya" element={<HomestayPenghasilan />} />

        </Route>

        <Route element={<ProtectedRoute roles={["pelaku_wisata"]}/>}>
          <Route path="paket-saya" element={<PaketSaya />}/>
          <Route path="booking/paket-saya" element={<PelakuWisataBooking />} />
          <Route path="penghasilan/paket-saya" element={<PelakuWisataPenghasilan />} />

        </Route>

        <Route element={<ProtectedRoute roles={["tour_guide"]}/>}>
          <Route path="tour-guide-saya" element={<TourGuideSaya />}/>
          <Route path="booking/tour-guide-saya" element={<TourGuideBooking />} />
          <Route path="penghasilan/tour-guide-saya" element={<TourGuidePenghasilan />} />

        </Route>

      </Route>

    </Routes>
  );
}

export default App;
