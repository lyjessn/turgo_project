import PenghasilanMitra from "../mitra/PenghasilanMitra";
import { getMyIncome } from "../../api/apiRiwayatSaldo";

const PelakuWisataPenghasilan = () => {

  return (
    <PenghasilanMitra
      title="Penghasilan Saya"
      fetchFunction={getMyIncome}
    />
  );

};

export default PelakuWisataPenghasilan;