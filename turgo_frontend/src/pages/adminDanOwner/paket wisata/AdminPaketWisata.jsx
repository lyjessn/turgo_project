import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEdit, FiTrash2, FiEye, FiX } from "react-icons/fi";
import "../css/AdminShared.css";
import "../css/AdminPaketWisata.css";
import { getAllPaketWisataAdmin, updatePaketWisata, deletePaketWisata } from "../../../api/apiPaketWisata";
import { GetUserData } from "../../../api/apiAuth";

const AdminPaketWisata = () => {
  const defaultForm = {
    nama: "",
    kategori_paket: "alam",
    deskripsi: "",
    harga: "",
    durasi: "",
    lokasi: "",
    perlengkapan: "",
    kapasitas_min: "",
    kapasitas_max: "",
    url_thumbnail: null
  };

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUser();
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const loadUser = async () => {
    try {
      const res = await GetUserData();
      setRole(res.role);
    } catch (err) {
      console.error("Gagal ambil user:", err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await getAllPaketWisataAdmin();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filter === "aktif")
      result = result.filter(d => d.is_aktif == 1);

    if (filter === "nonaktif")
      result = result.filter(d => d.is_aktif == 0);

    if (search)
      result = result.filter(d =>
        d.nama.toLowerCase().includes(search.toLowerCase())
      );

    return result;
  }, [data, filter, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const formatHarga = (harga) => {
    return Number(harga).toLocaleString("id-ID");
  };

  const toggleStatus = async (item) => {
    try {
        const formData = new FormData();
        formData.append(
            "is_aktif",
            item.is_aktif == 1 ? 0 : 1
        );
        await updatePaketWisata(item.id, formData);

        setData(prev =>
            prev.map(d =>
            d.id == item.id
                ? { ...d, is_aktif: d.is_aktif == 1 ? 0 : 1 }
                : d
            )
        );
    } catch (err) {
        console.error(err);
    }
  };

  const handleDelete = async () => {
      try {
          await deletePaketWisata(selectedItem.id);

          setShowDeleteModal(false);
          setSelectedItem(null);

          fetchData();
      } catch (err) {
          console.error(err);
      }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="admin-page">

        <div className="admin-header">
          <h1>Paket Wisata</h1>

          <div className="admin-header-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("tambah")}
            >
              + Tambah
            </button>

            <div className="admin-search-wrapper">
              <FiSearch />
              <input
                type="text"
                placeholder="Cari paket wisata di sini"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-filter-group">
          <button className={filter==="semua"?"active":""}
            onClick={()=>setFilter("semua")}>Semua</button>

          <button className={filter==="aktif"?"active":""}
            onClick={()=>setFilter("aktif")}>Aktif</button>

          <button className={filter==="nonaktif"?"active":""}
            onClick={()=>setFilter("nonaktif")}>Nonaktif</button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Harga</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nama}</td>
                  <td>Rp {formatHarga(item.harga)}</td>
                  <td>⭐ {Number(item.ratings_avg_bintang ?? 0).toFixed(2)}</td>
                  <td>
                    <label className="switch">
                        <input
                        type="checkbox"
                        checked={item.is_aktif == 1}
                        onChange={() => toggleStatus(item)}
                        />
                        <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button className="btn-icon"
                      onClick={() => navigate(`${item.id}`)}
                    >
                      <FiEye/>
                    </button>

                    <button className="btn-icon"
                      onClick={()=>navigate(`edit/${item.id}`)}>
                      <FiEdit/>
                    </button>

                    {role === "owner" && (
                      <button
                        className="btn-icon danger"
                        onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteModal(true);
                        }}
                      >
                        <FiTrash2/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {totalPages > 1 && (
            <div className="admin-pagination">

              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>

              <span>
                Page {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>

            </div>
          )}
        </div>

      </div>

      {showDeleteModal && selectedItem && (
          <div className="custom-modal-overlay">
              <div className="custom-modal modal-center">

                  <div className="modal-icon-wrapper">
                      <div className="modal-icon error">!</div>
                  </div>

                  <h3 className="modal-title">
                      Hapus Paket Wisata
                  </h3>

                  <p className="modal-message">
                      Apakah Anda yakin ingin menghapus{" "}
                      <b>{selectedItem.nama}</b>?
                      <br />
                      Data yang dihapus tidak dapat dikembalikan.
                  </p>

                  <div className="modal-actions">
                      <button
                          className="btn-danger"
                          onClick={handleDelete}
                      >
                          Hapus
                      </button>

                      <button
                          className="btn-secondary"
                          onClick={() => setShowDeleteModal(false)}
                      >
                          Batal
                      </button>
                  </div>

              </div>
          </div>
        )}
    </>
  );
};

export default AdminPaketWisata;