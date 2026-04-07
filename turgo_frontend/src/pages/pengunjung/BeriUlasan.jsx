import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import {getRateableItems, createRating} from "../../api/apiRating";
import "../public/css/Detail.css";

const BeriUlasan=()=>{
    const { id } = useParams();
    const navigate = useNavigate();

    const[items,setItems] = useState([]);
    const[ratings,setRatings] = useState({});
    const[loading,setLoading] = useState(true);

    const [modal,setModal] = useState({
        show:false,
        type:"",
        message:""
    });

    useEffect(()=>{
        fetchItems();
    },[]);

    const fetchItems=async()=>{
        try {
            const res=await getRateableItems(id);
            setItems(res);
        } catch {
            setModal({
                show:true,
                type:"error",
                message:"Gagal load data"
            });
        } finally {
            setLoading(false);
        }
    };

    const setStar=(item,value)=>{
        const key=item.tipe_target+"-"+item.id_target;

        setRatings(prev=>({
            ...prev,
            [key]:{
                ...prev[key],
                bintang:value
            }
        }));
    };

    const setReview=(item,value)=>{
        const key=item.tipe_target+"-"+item.id_target;

        setRatings(prev=>({
            ...prev,
            [key]:{
                ...prev[key],
                review:value
            }
        }));
    };

    const handleSubmit=async()=>{

        try{

            for(const item of items)
            {
                if(item.sudah_rating) continue;

                const key=item.tipe_target+"-"+item.id_target;

                const rating=ratings[key];

                if(!rating?.bintang) continue;

                await createRating({
                    booking_id:id,
                    tipe_target:item.tipe_target,
                    id_target:item.id_target,
                    bintang:rating.bintang,
                    review:rating.review || ""
                });
            }

            setModal({
                show:true,
                type:"success",
                message:"Ulasan berhasil dikirim"
            });

        }catch(err){
            setModal({
                show:true,
                type:"error",
                message:err.response?.data?.message || "Gagal kirim ulasan"
            });
        }

    };

    if(loading)
        return<div className="detail-container">Loading...</div>;

    return(
        <>
        <div className="detail-container">

            <h1 className="detail-title">
                Beri Ulasan
            </h1>

            <div className="detail-section">

                <div className="detail-info-list">

                    {items.map(item=>{
                        const key=item.tipe_target+"-"+item.id_target;

                        const rating=ratings[key]||{};

                        return(

                            <div key={key} className="review-card">

                                <img
                                    src={`http://127.0.0.1:8000/storage/${item.thumbnail}`}
                                    className="detail-thumb-small"
                                />

                                <div className="review-content">

                                    <div className="review-header">

                                        <div className="review-name">
                                            {item.nama}
                                        </div>

                                        {item.sudah_rating&&(
                                            <div className="review-date">
                                                Sudah dinilai
                                            </div>
                                        )}

                                    </div>

                                    {!item.sudah_rating&&(

                                        <>
                                            <div className="review-rating">

                                                {[1,2,3,4,5].map(star=>(
                                                    <span
                                                        key={star}
                                                        style={{
                                                            cursor:"pointer",
                                                            fontSize:"20px",
                                                            marginRight:"4px"
                                                        }}
                                                        onClick={()=>
                                                            setStar(item,star)
                                                        }
                                                    >
                                                        {star <= (rating.bintang||0)
                                                            ? "★"
                                                            : "☆"
                                                        }
                                                    </span>
                                                ))}

                                            </div>

                                            <textarea
                                                className="detail-date-input"
                                                placeholder="Tulis ulasan..."
                                                style={{
                                                    marginTop:"8px",
                                                    width:"100%",
                                                    minHeight:"70px"
                                                }}
                                                onChange={(e)=>
                                                    setReview(item,e.target.value)
                                                }
                                            />

                                        </>
                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

            <div className="detail-section">

                <button
                    className="detail-book-btn"
                    onClick={handleSubmit}
                >
                    Kirim Ulasan
                </button>

            </div>

        </div>

        {modal.show && (
            <div className="custom-modal-overlay">
                <div className="custom-modal modal-center">

                    <div className="modal-icon-wrapper">
                        {modal.type === "success" && (
                            <div className="modal-icon success">✓</div>
                        )}
                        {modal.type === "error" && (
                            <div className="modal-icon error">✕</div>
                        )}
                    </div>

                    <h3 className="modal-title">
                        {modal.type === "success" && "Ulasan Berhasil"}
                        {modal.type === "error" && "Terjadi Kesalahan"}
                    </h3>

                    <p className="modal-message">
                        {modal.message}
                    </p>

                    <button
                        className="modal-button"
                        onClick={()=>{
                            setModal({...modal,show:false});

                            if(modal.type==="success"){
                                navigate("/profile");
                            }
                        }}
                    >
                        OK
                    </button>

                </div>
            </div>
        )}
    </>
    );

};

export default BeriUlasan;