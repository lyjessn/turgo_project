export const redirectByRole = (role) => {
  switch (role) {
    case "admin":
        return "/admin/dashboard";
        
    case "owner":
      return "/owner/dashboard";

    case "tour_guide":
      return "/tour-guide/dashboard";

    case "homestay":
      return "/homestay/dashboard";

    case "pelaku_wisata":
      return "/pelaku-wisata/dashboard";

    default:
      return "/";
  }
};
