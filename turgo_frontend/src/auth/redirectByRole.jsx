export const redirectByRole = (role) => {

  const normalizedRole = role?.toLowerCase().replace(/\s+/g, "_");

  switch (normalizedRole) {
    case "admin":
    case "owner":
    case "tour_guide":
    case "homestay":
    case "pelaku_wisata":
    case "umkm":
      return "/dashboard";

    default:
      return "/";
  }
};