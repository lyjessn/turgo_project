import {
  FiHome,
  FiFolder,
  FiUsers,
  FiMap,
  FiBox,
  FiClipboard,
  FiCalendar,
} from "react-icons/fi";

const MenuConfig = {
  admin: [
    {
      label: "Beranda",
      path: "/admin/dashboard",
      icon: FiHome,
    },
    {
      label: "Kelola Data",
      icon: FiFolder,
      children: [
        {
          label: "Kebudayaan",
          path: "/admin/kebudayaan",
          icon: FiMap,
        },
        {
          label: "UMKM",
          path: "/admin/umkm",
          icon: FiBox,
        },
        {
          label: "Paket Wisata",
          path: "/admin/paket-wisata",
          icon: FiClipboard,
        },
        {
          label: "Homestay",
          path: "/admin/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/admin/tour-guide",
          icon: FiUsers,
        },
      ],
    },
    {
      label: "Pemesanan",
      icon: FiClipboard,
      children: [
        {
          label: "Paket Wisata",
          path: "/admin/booking/paket-wisata",
          icon: FiClipboard,
        },
        {
          label: "Homestay",
          path: "/admin/booking/homestay",
          icon: FiHome,
        },
        {
          label: "Tour Guide",
          path: "/admin/booking/tour-guide",
          icon: FiUsers,
        },
      ],
    },
    {
      label: "Penjadwalan",
      path: "/admin/penjadwalan",
      icon: FiCalendar,
    },
  ],
};

export default MenuConfig;
