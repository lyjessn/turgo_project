import { useEffect, useState } from "react";
import "./css/Kuliner.css";
import { FiMapPin, FiClock, FiPhone, FiMenu } from "react-icons/fi";
import { getAllUmkm } from "../../api/apiUmkm";

const Kuliner = () => {
  const [kuliners, setKuliners] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [previewFotos, setPreviewFotos] = useState([]);

  useEffect(() => {
    fetchKuliner();
  }, []);

  const fetchKuliner = async () => {
    try {
      const res = await getAllUmkm();
      console.log(res.data);
      setKuliners(res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kuliner");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  if (error) {
    return (
      <div className="empty-state">
         <p>🍜 Belum ada UMKM kuliner tersedia</p>
      </div>
    );
  }

  if (kuliners.length === 0) {
    return (
      <div className="empty-state">
        Belum ada data kuliner tersedia
      </div>
    );
  }

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
                <div className="kuliner-header">
                  <h2 className="kuliner-title">
                    {kuliner.nama_usaha}
                  </h2>

                  <div className={`status-pill ${kuliner.is_buka ? "open" : "closed"}`}>
                    {kuliner.is_buka ? "Buka" : "Tutup"}
                  </div>
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

                {kuliner.fotos?.length > 0 && (
                  <div className="kuliner-gallery">

                    {kuliner.fotos.slice(0, 3).map((foto, i) => {
                      const isLast = i === 2;
                      const remaining = kuliner.fotos.length - 3;

                      return (
                        <div
                          key={foto.id}
                          className="kuliner-thumb"
                          style={{
                            backgroundImage: `url(http://127.0.0.1:8000/storage/${foto.url_foto})`,
                          }}
                          onClick={() => {
                            setPreviewFotos(kuliner.fotos);
                            setPreviewIndex(i);
                          }}
                        >
                          {isLast && remaining > 0 && (
                            <div className="thumb-overlay">
                              +{remaining}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

            </div>

          </div>
        );

      })}

      {previewIndex !== null && (
          <div className="gallery-preview">

            <div
              className="preview-overlay"
              onClick={() => setPreviewIndex(null)}
            />

            <img
              src={`http://127.0.0.1:8000/storage/${previewFotos[previewIndex].url_foto}`}
              className="preview-image"
            />
            
            {previewIndex > 0 && (
              <button
                className="preview-nav left"
                onClick={() => setPreviewIndex(prev => prev - 1)}
              >
                ‹
              </button>
            )}

            {previewIndex < previewFotos.length - 1 && (
              <button
                className="preview-nav right"
                onClick={() => setPreviewIndex(prev => prev + 1)}
              >
                ›
              </button>
            )}

            <button
              className="preview-close"
              onClick={() => setPreviewIndex(null)}
            >
              ✕
            </button>

          </div>
        )}

    </div>
  );

};

export default Kuliner;