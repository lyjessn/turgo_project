import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import "../css/AdminShared.css";
import { getAllHomestay, updateHomestay, deleteHomestay } from "../../../api/apiHomestay";
import { GetUserData } from "../../../api/apiAuth";

const AdminHomestay = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [role, setRole] = useState(null);

  useEffect(() => {
    loadUser();
    fetchData();
  }, []);

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
      const res = await getAllHomestay();
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
      result = result.filter(d => d.is_aktif === 1);

    if (filter === "nonaktif")
      result = result.filter(d => d.is_aktif === 0);

    if (search)
      result = result.filter(d =>
        d.nama.toLowerCase().includes(search.toLowerCase())
      );

    return result;
  }, [data, filter, search]);

  const toggleStatus = async (item) => {
    const formData = new FormData();
    formData.append("is_aktif", item.is_aktif === 1 ? 0 : 1);

    await updateHomestay(item.id, formData);

    setData(prev =>
      prev.map(d =>
        d.id === item.id
          ? { ...d, is_aktif: d.is_aktif === 1 ? 0 : 1 }
          : d
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus homestay ini?")) return;

    try {
      await deleteHomestay(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">

      <div className="admin-header">
        <h1>Homestay</h1>

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
              placeholder="Cari homestay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-filter-group">
        <button
          className={filter === "semua" ? "active" : ""}
          onClick={() => setFilter("semua")}
        >
          Semua
        </button>

        <button
          className={filter === "aktif" ? "active" : ""}
          onClick={() => setFilter("aktif")}
        >
          Aktif
        </button>

        <button
          className={filter === "nonaktif" ? "active" : ""}
          onClick={() => setFilter("nonaktif")}
        >
          Nonaktif
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Lokasi</th>
              <th>Harga Min</th>
              <th>Harga Max</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nama}</td>
                <td>{item.lokasi}</td>
                <td>
                  Rp {Number(item.kamars_min_harga_per_malam ?? 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp {Number(item.kamars_max_harga_per_malam ?? 0)
                    .toLocaleString("id-ID")}
                </td>
                <td> ⭐ {Number(item.ratings_avg_bintang ?? 0).toFixed(1)}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.is_aktif === 1}
                      onChange={() => toggleStatus(item)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>

                <td>
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`${item.id}`)}
                  >
                    <FiEye />
                  </button>

                  <button
                    className="btn-icon"
                    onClick={() => navigate(`edit/${item.id}`)}
                  >
                    <FiEdit />
                  </button>

                  {role === "owner" && (
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FiTrash2/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AdminHomestay;