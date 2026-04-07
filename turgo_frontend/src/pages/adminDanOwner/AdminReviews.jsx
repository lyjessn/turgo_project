import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiTrash2 ,FiX } from "react-icons/fi";
import { getRatingsByTarget, deleteRating } from "../../api/apiRating";
import { useAuth } from "../../auth/useAuth";
import "./css/AdminReviews.css";

const AdminReviews = () => {
  const { user } = useAuth();
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

  const handleDelete = async (id) => {

    if (!window.confirm("Hapus ulasan ini?")) return;

    try {

      await deleteRating(id);
      fetchReviews();

    } catch (err) {
      console.error(err);
    }

  };

  return (

    <div className="admin-reviews-page">

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

        <div className="review-list">

          {reviews.map((r) => (

            <div className="review-card" key={r.id}>

  <div className="review-stars">
    {"⭐".repeat(r.bintang)}
  </div>

  <div className="review-meta">
    <span className="review-user">@{r.user?.username}</span>

    <span className="review-date">
      • {new Date(r.created_at).toLocaleDateString("id-ID")}
    </span>

    {(user?.role?.name === "admin" || user?.role?.name === "owner") && (
      <button
        className="delete-btn"
        onClick={() => handleDelete(r.id)}
      >
        <FiTrash2 />
      </button>
    )}
  </div>

  <div className="review-text">
    {r.review || "-"}
  </div>

</div>

          ))}

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