import {
  FiHome,
  FiFolder,
  FiUsers,
  FiMap,
  FiShoppingBag,
  FiPackage,
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiUserPlus,
  FiLayers,
  FiDollarSign,
  FiUser,
  FiUserCheck,
  FiKey,
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
          icon: FiShoppingBag,
        },
        {
          label: "Paket Wisata",
          path: "/dashboard/paket-wisata",
          icon: FiPackage,
        },
        {
          label: "Homestay",
          path: "/dashboard/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/tour-guide",
          icon: FiUser,
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
      icon: FiBookOpen,
      children: [
        {
          label: "Paket Wisata",
          path: "/dashboard/booking/paket-wisata",
          icon: FiPackage,
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
      icon: FiFileText,
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
          icon: FiShoppingBag,
        },
        {
          label: "Paket Wisata",
          path: "/dashboard/paket-wisata",
          icon: FiPackage,
        },
        {
          label: "Homestay",
          path: "/dashboard/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/tour-guide",
          icon: FiUser,
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
      icon: FiUserCheck,
      children: [
        {
          label: "Pengunjung",
          path: "/dashboard/users/pengunjung",
          icon: FiUsers,
        },
        {
          label: "Admin",
          path: "/dashboard/users/admin",
          icon: FiKey,
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
      icon: FiBookOpen,
      children: [
        {
          label: "Paket Wisata",
          path: "/dashboard/booking/paket-wisata",
          icon: FiPackage,
        },
        {
          label: "Homestay",
          path: "/dashboard/booking/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/dashboard/booking/tour-guide",
          icon: FiUser,
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
      icon: FiFileText,
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
          label: "Kamar Saya",
          path: "/dashboard/homestay-saya/kamar",
          icon: FiLayers,
        },
      ],
    },
    {
      label: "Pemesanan",
      path: "/dashboard/booking/homestay-saya",
      icon: FiBookOpen,
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Penghasilan Saya",
      path: "/dashboard/penghasilan/homestay-saya",
      icon: FiDollarSign,
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
      icon: FiPackage,
    },
    {
      label: "Pemesanan",
      path: "/dashboard/booking/paket-saya",
      icon: FiBookOpen,
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Penghasilan Saya",
      path: "/dashboard/penghasilan/paket-saya",
      icon: FiDollarSign,
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
      icon: FiBookOpen,
    },
    {
      label: "Penjadwalan",
      path: "/dashboard/penjadwalan",
      icon: FiCalendar,
    },
    {
      label: "Penghasilan Saya",
      path: "/dashboard/penghasilan/tour-guide-saya",
      icon: FiDollarSign,
    },
  ],

};

export default MenuConfig;
