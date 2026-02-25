import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Unauthorized from "./pages/auth/Unauthorized";

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
import Pembayaran from "./pages/public/Pembayaran";
import Profile from "./pages/pengunjung/profile";
import DetailPesanan from "./pages/pengunjung/DetailPesanan";
import BeriUlasan from "./pages/pengunjung/BeriUlasan";

import ProtectedRoute from "./auth/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";


function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/wisata" element={<Wisata />} />
        <Route path="/tour-guide" element={<TourGuide />} />
        <Route path="/homestay" element={<Homestay />} />
        <Route path="/budaya" element={<Budaya />} />
        <Route path="/kuliner" element={<Kuliner />} />
        <Route path="/paket-wisata/custom" element={<Custom />} />

        <Route path="/paket-wisata/:id" element={<DetailPaketWisata />} />
        <Route path="/tour-guide/:id" element={<TourGuideDetail />} />
        <Route path="/homestay/:id" element={<HomestayDetail />} />

        <Route path="/tour-guide/:id/reviews" element={<Ulasan />} />
        <Route path="/paket-wisata/:id/reviews" element={<Ulasan />} />
        <Route path="/homestay/:id/reviews" element={<Ulasan />} />
        <Route path="/homestay/:id/kamar/:kamarId" element={<KamarDetail />} />

        <Route
          path="/pembayaran"
          element={
            <ProtectedRoute roles={["pengunjung"]}>
              <Pembayaran />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["pengunjung"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute roles={["pengunjung"]}>
              <DetailPesanan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/beri-ulasan/:id"
          element={
            <ProtectedRoute roles={["pengunjung"]}>
              <BeriUlasan />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

    </Routes>
  );
}

export default App;
