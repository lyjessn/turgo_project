import PenghasilanMitra from "../mitra/PenghasilanMitra";
import { getMyIncome } from "../../api/apiRiwayatSaldo";

const HomestayPenghasilan = () => {

  return (
    <PenghasilanMitra
      title="Penghasilan Saya"
      fetchFunction={getMyIncome}
    />
  );

};

export default HomestayPenghasilan;