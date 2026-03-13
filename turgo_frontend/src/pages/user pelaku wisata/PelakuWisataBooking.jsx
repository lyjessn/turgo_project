import BookingMitra from "../mitra/BookingMitra";
import { getPelakuWisataBookings } from "../../api/apiBooking";

const PelakuWisataBooking = () => {

  return (
    <BookingMitra
      title="Pemesanan Paket Wisata"
      fetchFunction={getPelakuWisataBookings}
    />
  );

};

export default PelakuWisataBooking;