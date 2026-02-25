import { useEffect, useState } from "react";
import "./css/Kuliner.css";

import {
  FiMapPin,
  FiClock,
  FiPhone,
  FiMenu,
} from "react-icons/fi";

import { getAllUmkm } from "../../api/apiUmkm";

const Kuliner = () => {

  const [kuliners, setKuliners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKuliner();
  }, []);

  const fetchKuliner = async () => {
    try {

      const res = await getAllUmkm();

      setKuliners(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="kuliner-page">

      {kuliners.map((kuliner, index) => {

        const isLeft = index % 2 === 0;

        return (
          <div key={kuliner.id} className="kuliner-section">

            <div className="kuliner-bg"
              style={{
                backgroundImage: `url(http://127.0.0.1:8000/storage/${kuliner.url_thumbnail})`,
              }}
            />

            <div className={`kuliner-overlay ${isLeft ? "left" : "right"}`}>

              <div className="kuliner-content">
                <h2 className="kuliner-title">
                  {kuliner.nama_usaha}
                </h2>

                <div className={`status-pill ${kuliner.is_buka ? "open" : "closed"}`}>
                  {kuliner.is_buka ? "Buka" : "Tutup"}
                </div>
                
                <div className="kuliner-info">

                  <div>
                    <FiMapPin /> {kuliner.lokasi}
                  </div>

                  <div>
                    <FiClock /> {kuliner.jam_operasional}
                  </div>

                  <div>
                    <FiPhone /> {kuliner.nomor_telepon}
                  </div>

                  <div>
                    <FiMenu /> {kuliner.menu_tersedia}
                  </div>

                </div>

                {/* FOTO TAMBAHAN */}
                {kuliner.fotos?.length > 0 && (
                  <div className="kuliner-gallery">

                    {kuliner.fotos.slice(0, 3).map((foto) => (
                      <div
                        key={foto.id}
                        className="kuliner-thumb"
                        style={{
                          backgroundImage: `url(http://127.0.0.1:8000/storage/${foto.path})`,
                        }}
                      />
                    ))}

                  </div>
                )}

              </div>

            </div>

          </div>
        );

      })}

    </div>
  );

};

export default Kuliner;