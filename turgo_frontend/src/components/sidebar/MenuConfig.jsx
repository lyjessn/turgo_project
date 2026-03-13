import { FaFileInvoiceDollar } from "react-icons/fa";
import {
  FiHome,
  FiFolder,
  FiUsers,
  FiMap,
  FiBox,
  FiClipboard,
  FiCalendar,
  FiFile,
  FiUserPlus,
  FiLayers,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";

const MenuConfig = {
  admin: [
    {
      label: "Beranda",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      label: "Kelola Data",
      icon: FiFolder,
      children: [
        {
          label: "Kebudayaan",
          path: "/dashboard/kebudayaan",
          icon: FiMap,
        },
        {
          label: "UMKM",
          path: "/dashboard/umkm",
          icon: FiBox,
        },
        {
          label: "Paket Wisata",
          path: "/dashboard/paket-wisata",
          icon: FiClipboard,
        },
        {
          label: "Homestay",
          path: "/dashboard/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/tour-guide",
          icon: FiUsers,
        },
        {
          label: "Pelaku Wisata",
          path: "/dashboard/pelaku-wisata",
          icon: FiUsers,
        },
      ],
    },
    {
      label: "Kelola Mitra",
      path: "/dashboard/mitra",
      icon: FiUserPlus,
    },
    {
      label: "Pemesanan",
      icon: FiClipboard,
      children: [
        {
          label: "Paket Wisata",
          path: "/dashboard/booking/paket-wisata",
          icon: FiClipboard,
        },
        {
          label: "Homestay",
          path: "/dashboard/booking/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/booking/tour-guide",
          icon: FiUsers,
        },
        {
          label: "Custom",
          path: "/dashboard/booking/custom",
          icon: FiLayers,
        },
      ],
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Laporan Admin",
      path: "/dashboard/laporan",
      icon: FiFile,
    }
      ],

  owner: [
    {
      label: "Beranda",
      path: "/dashboard",
      icon: FiHome,
    },

    {
      label: "Kelola Data",
      icon: FiFolder,
      children: [
        {
          label: "Kebudayaan",
          path: "/dashboard/kebudayaan",
          icon: FiMap,
        },
        {
          label: "UMKM",
          path: "/dashboard/umkm",
          icon: FiBox,
        },
        {
          label: "Paket Wisata",
          path: "/dashboard/paket-wisata",
          icon: FiClipboard,
        },
        {
          label: "Homestay",
          path: "/dashboard/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/tour-guide",
          icon: FiUsers,
        },
        {
          label: "Pelaku Wisata",
          path: "/dashboard/pelaku-wisata",
          icon: FiUsers,
        },
      ],
    },

    {
      label: "Kelola Pengguna",
      icon: FiUsers,
      children: [
        {
          label: "Pengunjung",
          path: "/dashboard/users/pengunjung",
          icon: FiUsers,
        },
        {
          label: "Admin",
          path: "/dashboard/users/admin",
          icon: FiUsers,
        },
        {
          label: "Mitra Wisata",
          path: "/dashboard/mitra",
          icon: FiUserPlus,
        },
      ],
    },

    {
      label: "Pemesanan",
      icon: FiClipboard,
      children: [
        {
          label: "Paket Wisata",
          path: "/dashboard/booking/paket-wisata",
          icon: FiClipboard,
        },
        {
          label: "Homestay",
          path: "/dashboard/booking/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/booking/tour-guide",
          icon: FiUsers,
        },
        {
          label: "Custom",
          path: "/dashboard/booking/custom",
          icon: FiLayers,
        },
      ],
    },

    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },

    {
      label: "Laporan",
      path: "/dashboard/laporan",
      icon: FiFile,
    },
  ],

  homestay: [
    {
      label: "Beranda",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      label: "Homestay Saya",
      icon: FiHome,
      children: [
        {
          label: "Data Homestay",
          path: "/dashboard/homestay-saya",
          icon: FiHome,
        },
        {
          label: "Kamar",
          path: "/dashboard/homestay-saya/kamar",
          icon: FiLayers,
        },
      ],
    },
    {
      label: "Pemesanan",
      path: "/dashboard/booking/homestay-saya",
      icon: FiClipboard,
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Penghasilan Saya",
      path: "/dashboard/penghasilan/homestay-saya",
      icon: FaFileInvoiceDollar,
    },
  ],

  umkm: [
    {
      label: "Beranda",
      path: "/dashboard",
      icon: FiHome,
    },
  ],

  pelaku_wisata: [
    {
      label: "Beranda",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      label: "Paket Saya",
      path: "/dashboard/paket-saya",
      icon: FiClipboard,
    },
    {
      label: "Pemesanan",
      path: "/dashboard/booking/paket-saya",
      icon: FiClipboard,
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Penghasilan Saya",
      path: "/dashboard/penghasilan/paket-saya",
      icon: FaFileInvoiceDollar,
    },
  ],

  tour_guide: [
    {
      label: "Beranda",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      label: "Data Saya",
      path: "/dashboard/tour-guide-saya",
      icon: FiUsers,
    },
    {
      label: "Pemesanan",
      path: "/dashboard/booking/tour-guide-saya",
      icon: FiClipboard,
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Penghasilan Saya",
      path: "/dashboard/penghasilan/tour-guide-saya",
      icon: FaFileInvoiceDollar,
    },
  ],

};

export default MenuConfig;
