import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRatingsByTarget } from "../../api/apiRating";

import "./css/AdminShared.css";

const AdminReviews = () => {

  const { tipe, id } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBintang, setSelectedBintang] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const titleMap = {
    paket_wisata: "Ulasan Paket Wisata",
    tour_guide: "Ulasan Tour Guide",
    homestay: "Ulasan Homestay"
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedBintang, page]);

  const fetchReviews = async () => {
    setLoading(true);

    try {
        const res = await getRatingsByTarget(
        tipe,
        id,
        selectedBintang,
        page
        );

        setReviews(res.data || []);
        setLastPage(res.last_page || 1);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }

  };

  const renderStars = (count) => {
    return "⭐".repeat(count);
  };

  return (

    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-header">

        <h1>{titleMap[tipe] || "Ulasan"}</h1>

        <div className="admin-header-actions">

          <button
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>

        </div>

      </div>


      {/* FILTER BINTANG */}

      <div className="admin-filter-group">

        <button
          className={selectedBintang === null ? "active" : ""}
          onClick={() => {
            setSelectedBintang(null);
            setPage(1);
          }}
        >
          Semua
        </button>

        {[5,4,3,2,1].map((b) => (

          <button
            key={b}
            className={selectedBintang === b ? "active" : ""}
            onClick={() => {
              setSelectedBintang(b);
              setPage(1);
            }}
          >
            {renderStars(b)}
          </button>

        ))}

      </div>


      {/* TABLE */}

      <div className="admin-table-wrapper">

        <table className="admin-table">

          <thead>

            <tr>
              <th>User</th>
              <th>Bintang</th>
              <th>Ulasan</th>
              <th>Tanggal</th>
            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            )}

            {!loading && (!reviews || reviews.length === 0) && (
              <tr>
                <td colSpan="4">Belum ada ulasan</td>
              </tr>
            )}

            {!loading && reviews?.map((r) => (

              <tr key={r.id}>

                <td>
                  @{r.user?.username}
                </td>

                <td>
                  ⭐ {r.bintang}
                </td>

                <td>
                  {r.review || "-"}
                </td>

                <td>
                  {new Date(r.created_at)
                    .toLocaleDateString("id-ID")}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* PAGINATION */}

      {lastPage > 1 && (

        <div className="modal-actions">

          <button
            className="btn-secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} / {lastPage}
          </span>

          <button
            className="btn-secondary"
            disabled={page === lastPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
};

export default AdminReviews;