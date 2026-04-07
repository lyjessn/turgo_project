import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import idLocale from "date-fns/locale/id";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  getGlobalBlockouts,
  getSpesifikBlockouts,
  createGlobalBlockout,
  createSpesifikBlockout,
  updateGlobalBlockout,
  updateSpesifikBlockout,
  deleteGlobalBlockout,
  deleteSpesifikBlockout
} from "../api/apiBlockout";

import { getAllPaketWisata, getMyCreatedPakets } from "../api/apiPaketWisata";
import { getAllTourGuide } from "../api/apiTourGuide";
import { getAllHomestay } from "../api/apiHomestay";
import { getAllUmkm } from "../api/apiUmkm";

import { GetUserData } from "../api/apiAuth";

import "./adminDanOwner/css/Modal.css";
import "./penjadwalan.css";
import "./adminDanOwner/css/AdminShared.css";

const locales = { id: idLocale };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: idLocale }),
  getDay,
  locales
});

export default function Penjadwalan() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [targets, setTargets] = useState([]);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState("month");

    const [form, setForm] = useState({
        tipe: "global",
        kategori: "",
        id_target: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        alasan: ""
    });

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            loadData();
            if (role === "pelaku_wisata") {
                loadTargets("paket_wisata");
            }
        }
    }, [user]);

    const loadUser = async () => {
        try {
            const res = await GetUserData();
            setUser(res.user);
            console.log(res.user);
            const normalizedRole = res.role?.toLowerCase().replace(/\s+/g, "_");
            setRole(normalizedRole);

        } catch (err) {
            console.error("Gagal ambil user:", err);
        }
    };

    const loadData = async () => {

        const globalRes = await getGlobalBlockouts().catch(() => ({ data: [] }));
        const spesifikRes = await getSpesifikBlockouts().catch(() => ({ data: [] }));

        const global = globalRes.data || [];
        const spesifik = spesifikRes.data || [];

        const gEvents = global.map(b => ({
        id: b.id,
        title: `Global - ${b.alasan}`,
        start: new Date(b.tanggal_mulai),
        end: new Date(b.tanggal_selesai),
        kategori: "global",
        type: "global",
        raw: b
        }));

        const sEvents = spesifik.map(b => ({
        id: b.id,
        title:
        b.kategori === "tour_guide"
            ? `${b.tour_guide?.user?.nama_lengkap} - ${b.alasan}`
            : b.kategori === "paket_wisata"
            ? `${b.paket_wisata?.nama} - ${b.alasan}`
            : `${b.homestay?.nama} - ${b.alasan}`,
        start: new Date(b.tanggal_mulai),
        end: new Date(b.tanggal_selesai),
        kategori: b.kategori,
        type: "spesifik",
        raw: b
        }));

        let allEvents = [...gEvents, ...sEvents];

        if(role === "pelaku_wisata"){

        allEvents = allEvents.filter(e => {

            if(e.kategori === "global") return true;

            if(e.kategori !== "paket_wisata") return false;

            const paket = e.raw.paket_wisata;

            if(!paket) return false;

            const isCreator = paket.id_pembuat === user.id;

            const isParticipant = paket.participants?.some(
                p => p.user_id === user.id
            );

            return isCreator || isParticipant;
        });

        }

        setEvents(allEvents);
    };

    const loadTargets = async (kategori) => {

        try {

            if (kategori === "paket_wisata") {

                if(role === "pelaku_wisata"){
                    const res = await getMyCreatedPakets();
                    setTargets(res.data);
                }else{
                    const res = await getAllPaketWisata();
                    setTargets(res.data);
                }

            }

            if (kategori === "tour_guide") {
                const res = await getAllTourGuide();
                setTargets(res.data);
            }

            if (kategori === "homestay") {
                const res = await getAllHomestay();
                setTargets(res.data);
            }

            if (kategori === "umkm") {
                const res = await getAllUmkm();
                setTargets(res.data);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const eventStyleGetter = (event) => {

        let className = "event-default";

        if (event.kategori === "global") className = "event-global";
        if (event.kategori === "tour_guide") className = "event-tg";
        if (event.kategori === "paket_wisata") className = "event-pw";
        if (event.kategori === "homestay") className = "event-hs";
        if (event.kategori === "umkm") className = "event-umkm";

        return {
        className
        };
    };

    const handleSelectSlot = (slot) => {
        setForm({
        tipe: "global",
        kategori: "",
        id_target: "",
        tanggal_mulai: format(slot.start, "yyyy-MM-dd"),
        tanggal_selesai: format(slot.end, "yyyy-MM-dd"),
        alasan: ""
        });

        setEditMode(false);
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        const data = event.raw;

        setForm({
            tipe: event.type,
            kategori: data.kategori || "",
            id_target: data.id_target || "",
            tanggal_mulai: data.tanggal_mulai,
            tanggal_selesai: data.tanggal_selesai,
            alasan: data.alasan
        });

        if (event.type === "spesifik" && data.kategori) {
            loadTargets(data.kategori);
        }

        setSelectedEvent(event);
        setEditMode(true);
        setShowModal(true);
    };

    const handleSubmit = async () => {

        let payload = { ...form };
        console.log(payload);

        if (role === "tour_guide") {
            payload.tipe = "spesifik";
            payload.kategori = "tour_guide";
            payload.id_target = user.tour_guide.id;
        }

        if (role === "homestay") {
            payload.tipe = "spesifik";
            payload.kategori = "homestay";
            payload.id_target = user.homestays.id;
        }

        if (role === "pelaku_wisata") {
            payload.tipe = "spesifik";
            payload.kategori = "paket_wisata";
        }
        try {
            if (editMode) {

                if (form.tipe === "global")
                    await updateGlobalBlockout(selectedEvent.id, payload);
                else
                    await updateSpesifikBlockout(selectedEvent.id, payload);

            } else {

                if (payload.tipe === "global")
                    await createGlobalBlockout(payload);
                else
                    await createSpesifikBlockout(payload);
            }

            setShowModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Terjadi kesalahan");
        }
    };

    const handleDelete = async () => {

        if (!window.confirm("Hapus blockout ini?")) return;

        if (selectedEvent.type === "global")
            await deleteGlobalBlockout(selectedEvent.id);
        else
            await deleteSpesifikBlockout(selectedEvent.id);

        setShowModal(false);
        loadData();
    };

    return (
        <div className="schedule-page">

            <h2 className="schedule-title">Penjadwalan</h2>

            <div className="schedule-legend">

                <div className="legend-item">
                    <span className="legend-color global"></span> Global
                </div>

                {(role === "admin" || role === "owner") && (
                    <>
                        <div className="legend-item">
                            <span className="legend-color tg"></span> Tour Guide
                        </div>

                        <div className="legend-item">
                            <span className="legend-color pw"></span> Paket Wisata
                        </div>

                        <div className="legend-item">
                            <span className="legend-color hs"></span> Homestay
                        </div>

                        <div className="legend-item">
                            <span className="legend-color umkm"></span> UMKM
                        </div>
                    </>
                )}

                {role === "homestay" && (
                    <div className="legend-item">
                        <span className="legend-color hs"></span> Homestay
                    </div>
                )}

                {role === "tour_guide" && (
                    <div className="legend-item">
                        <span className="legend-color tg"></span> Tour Guide
                    </div>
                )}

                {role === "pelaku_wisata" && (
                    <div className="legend-item">
                        <span className="legend-color pw"></span> Paket Wisata
                    </div>
                )}

            </div>

            <div className="schedule-calendar">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    popup
                    date={date}
                    view={view}
                    onNavigate={(newDate) => setDate(newDate)}
                    onView={(newView) => setView(newView)}
                    defaultView="month"
                    views={["month","week","day","agenda"]}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                />
            </div>

            {showModal && (

                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{editMode ? "Edit Blockout" : "Tambah Blockout"}</h3>
                        {(role === "admin" || role === "owner") && !editMode && (
                            <div className="modal-body">
                                <div className="form-group">

                                    <label>Tipe</label>

                                    <select
                                    value={form.tipe}
                                    onChange={(e) =>
                                        setForm({ ...form, tipe: e.target.value })
                                    }
                                    >

                                    <option value="global">Global</option>
                                    <option value="spesifik">Spesifik</option>

                                    </select>

                                </div>
                            </div>
                        )}

                        {(role === "admin" || role === "owner") && form.tipe === "spesifik" && (
                            <>
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <select
                                        value={form.kategori}
                                        onChange={(e) => {
                                            const val = e.target.value;

                                            setForm({
                                                ...form,
                                                kategori: val,
                                                id_target: ""
                                            });

                                            loadTargets(val);
                                        }}
                                    >
                                        <option value="">Pilih</option>
                                        <option value="tour_guide">Tour Guide</option>
                                        <option value="paket_wisata">Paket Wisata</option>
                                        <option value="homestay">Homestay</option>
                                        <option value="umkm">UMKM</option>
                                    </select>

                                </div>

                                <div className="form-group">
                                    <label>ID Target</label>
                                    <select
                                        value={form.id_target}
                                        onChange={(e) =>
                                            setForm({ ...form, id_target: e.target.value })
                                        }
                                    >

                                    <option value="">Pilih Target</option>

                                    {targets.map((t) => (
                                        <option key={t.id} value={t.id}>
                                        {t.id} - {t.nama || t.user?.nama_lengkap}
                                        </option>
                                    ))}

                                    </select>
                                </div>
                            </>
                        )}

                        {role === "pelaku_wisata" && (

                            <div className="form-group">

                                <label>Paket Wisata</label>

                                <select
                                value={form.id_target}
                                onChange={(e)=>
                                    setForm({
                                    ...form,
                                    id_target: e.target.value
                                    })
                                }
                                >

                                <option value="">Pilih Paket</option>

                                {targets.map((t)=>(
                                    <option key={t.id} value={t.id}>
                                    {t.nama}
                                    </option>
                                ))}

                                </select>

                            </div>

                        )}

                        <div className="form-group">

                            <label>Tanggal Mulai</label>

                            <input
                                type="date"
                                value={form.tanggal_mulai}
                                onChange={(e) =>
                                setForm({ ...form, tanggal_mulai: e.target.value })
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>Tanggal Selesai</label>

                            <input
                                type="date"
                                value={form.tanggal_selesai}
                                onChange={(e) =>
                                setForm({ ...form, tanggal_selesai: e.target.value })
                                }
                            />

                        </div>

                        <div className="form-group">
                            <label>Alasan</label>

                            <input
                                type="text"
                                value={form.alasan}
                                onChange={(e) =>
                                setForm({ ...form, alasan: e.target.value })
                                }
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-primary"
                                onClick={handleSubmit}
                            >
                                Simpan
                            </button>

                            {editMode && (
                                (selectedEvent?.type !== "global" || (role === "admin" || role === "owner")) && (
                                    <button
                                        className="btn-danger"
                                        onClick={handleDelete}
                                    >
                                        Hapus
                                    </button>
                                )
                            )}

                            <button
                                className="btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Batal
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}