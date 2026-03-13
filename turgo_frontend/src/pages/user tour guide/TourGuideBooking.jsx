import BookingMitra from "../mitra/BookingMitra";
import { getTourGuideBookings } from "../../api/apiBooking";

const TourGuideBooking = () => {

  return (
    <BookingMitra
      title="Pemesanan Tour Guide"
      fetchFunction={getTourGuideBookings}
    />
  );

};

export default TourGuideBooking;