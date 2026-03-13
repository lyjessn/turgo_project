import BookingMitra from "../mitra/BookingMitra";
import { getHomestayBookings } from "../../api/apiBooking";

const HomestayBooking = () => {

  return (
    <BookingMitra
      title="Pemesanan Homestay"
      fetchFunction={getHomestayBookings}
    />
  );

};

export default HomestayBooking;