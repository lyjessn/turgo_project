import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getRatingsByTarget } from "../../api/apiRating";
import { getMyHomestay } from "../../api/apiHomestay";
import "./css/Detail.css";
import "./css/Ulasan.css";

const Ulasan = () => {
  const { id: paramId } = useParams();
  const location = useLocation();

  const [id,setId] = useState(paramId || null);

  const tipe = location.pathname.includes("tour-guide")
    ? "tour_guide"
    : location.pathname.includes("paket-wisata")
    ? "paket_wisata"
    : "homestay";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBintang, setSelectedBintang] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if(!id){
      fetchMyHomestay();
    }
  },[]);

  useEffect(() => {
    if(id){
      fetchReviews();
    }
  },[id,selectedBintang,page]);

  const fetchMyHomestay = async () => {
    try{
      const res = await getMyHomestay();
      setId(res.data.id);
    }catch(err){
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getRatingsByTarget(
        tipe,
        id,
        selectedBintang,
        page
      );

      setReviews(res.data);
      setLastPage(res.last_page);

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
    <div className="detail-container reviews-wrapper">
      <div className="detail-section">
        <h2 className="detail-section-title center" style={{fontSize:"24px"}}>
          Semua Ulasan
        </h2>

        <div className="reviews-filter">

          <button
            className={
              selectedBintang === null
                ? "filter-active"
                : "filter-inactive"
            }
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
              className={
                selectedBintang === b
                  ? "filter-active"
                  : "filter-inactive"
              }
              onClick={() => {
                setSelectedBintang(b);
                setPage(1);
              }}
            >
              {renderStars(b)}
            </button>

          ))}

        </div>

        {loading && <p>Loading...</p>}

        {!loading && reviews.length === 0 && (
          <p className="detail-empty-review">
            Belum ada ulasan
          </p>
        )}

        <div className="detail-review-list">

          {reviews.map((r) => (

            <div key={r.id} className="review-card">

              <div className="review-avatar">
                {r.user?.foto_profil ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${r.user.foto_profil}`}
                    alt={r.user.username}
                  />
                ) : (
                  r.user?.username?.charAt(0).toUpperCase()
                )}
              </div>

              <div className="review-content">

                <div className="review-header">

                  <div className="review-name">
                    @{r.user?.username}
                  </div>

                  <div className="review-date">
                    {new Date(r.created_at)
                      .toLocaleDateString("id-ID")}
                  </div>

                </div>

                <div className="review-rating">
                  ⭐ {r.bintang}/5
                </div>

                {r.review && (
                  <div className="review-text">
                    {r.review}
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

        {lastPage > 1 && (
          <div className="reviews-pagination">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} / {lastPage}
            </span>

            <button
              disabled={page === lastPage}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default Ulasan;