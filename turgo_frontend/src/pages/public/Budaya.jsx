import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import "./css/Budaya.css";
import { getAllKebudayaan } from "../../api/apiKebudayaan";

const Budaya = () => {
  const [budayas, setBudayas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudaya();
  }, []);

  const fetchBudaya = async () => {
    try {
      const res = await getAllKebudayaan();
      setBudayas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="budaya-page">
      {budayas.map((budaya, index) => (
        <div key={budaya.id} className="budaya-section">
          <div className="budaya-image"
            style={{
              backgroundImage: `url(${BASE_URL}/storage/${budaya.foto})`,
            }}
          />

          <div
            className={`budaya-overlay ${
              index % 2 === 0 ? "left" : "right"
            }`}
          >
            <div className="budaya-content">
              <h2>{budaya.nama}</h2>
              <p>{budaya.deskripsi}</p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default Budaya;