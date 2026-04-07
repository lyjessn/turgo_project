import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./css/Custom.css";
import "./css/Catalog.css";
import "./css/Detail.css";
import "../../components/homepage/paketwisatasection.css";
import { FiCalendar, FiCheck, FiPlus, FiMapPin, FiSearch } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import { createBooking } from "../../api/apiBooking";
import { getAllPaketWisata, getAvailablePaketWisata } from "../../api/apiPaketWisata";

const Custom = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
	const [pakets, setPakets] = useState([]);
	const [kategori, setKategori] = useState("");
	const [available, setAvailable] = useState([]);
	const [selectedPakets, setSelectedPakets] = useState([]);
	const [selectedGuide, setSelectedGuide] = useState(null);
	const [tanggal, setTanggal] = useState("");
	const [jumlahOrang, setJumlahOrang] = useState(1);
	const [search, setSearch] = useState("");
	const [showPicker, setShowPicker] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => { fetchAll(); }, []);

	const fetchAll = async () => {
		try {
			const res = await getAllPaketWisata();
			setPakets(res.data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!tanggal) {
			setAvailable([]);
			return;
		}
		fetchAvailable();
	}, [tanggal]);

	const fetchAvailable = async () => {
		try {
			const data = await getAvailablePaketWisata(tanggal);
			setAvailable(data || []);
		} catch (err) {
			console.error(err);
			setAvailable([]);
		}
	};

	const isAvailable = (id) => {
		if (!tanggal) return true;
		return available.some(p => p.id === id);
	};

	const kategoriList = useMemo(() => {
		const source = pakets || [];
		const unique = [...new Set(source.map(p => p.kategori_paket))];
		return unique;
	}, [pakets]);

	const dataToShow = useMemo(() => {
		let data = tanggal ? available : pakets;

		if (search) {
			data = data.filter(p =>
			p.nama.toLowerCase().includes(search.toLowerCase())
			);
		}

		if (kategori) {
			data = data.filter(p => p.kategori_paket === kategori);
		}

		return data;
	}, [pakets, available, tanggal, search, kategori]);

	const togglePaket = (paket) => {
		const exists = selectedPakets.find(p => p.id === paket.id);

		if (exists) {
			setSelectedPakets(prev => prev.filter(p => p.id !== paket.id));
			return;
		}

		if (selectedPakets.length >= 3) {
			return;
		}
		setSelectedPakets(prev => [...prev, paket]);
	};

	const isSelected = (id) => selectedPakets.some(p => p.id === id);

    const selectedCount = selectedPakets?.length ?? 0;

	const guidePrice =
		selectedGuide === "half" ? 150000 :
		selectedGuide === "full" ? 300000 : 0;

	const paketTotal =
	selectedPakets
		.filter(p => isAvailable(p.id))
		.reduce((sum, p) => sum + Number(p.harga || 0), 0)
		* jumlahOrang;

	const totalHarga =
	selectedPakets.filter(p => isAvailable(p.id)).length === 0
		? 0
		: paketTotal + guidePrice;

	const hasUnavailable = selectedPakets.some(p => !isAvailable(p.id));

    const handleBooking = async () => {
		if (!user) {
            navigate("/login", {
                state: {
                    redirectTo: `/custom`,
                    tanggal,
                    jumlahOrang
                }
            });
            return;
        }
		
        try {
            const formData = new FormData();

            selectedPakets
                .filter(p => isAvailable(p.id))
                .forEach(p => {
                    formData.append("paket_ids[]", p.id);
                });

            formData.append("tanggal_mulai", tanggal);
            formData.append("tanggal_selesai", tanggal);
            formData.append("jumlah_orang", jumlahOrang);

            const guideMap = {
                full: "full day",
                half: "half day",
                null: "tanpa"
            };

            formData.append(
                "jenis_tour_guide",
                selectedGuide ? guideMap[selectedGuide] : "tanpa"
            );

            const res = await createBooking(formData);

            navigate(`/pembayaran/${res.data.id}`);

        }catch(err){
			console.log(err);
            alert(err.response?.data?.message||"Gagal booking");
        }
    };

	if (loading) {
		return (
			<div className="catalog-container">
				Loading...
			</div>
		);
	}

	const minDate = new Date();
	minDate.setDate(minDate.getDate() + 2);
	const minDateString = minDate.toISOString().split("T")[0];

	return (
		<div className="catalog-container">

			<div className="catalog-header">
				<h1>Custom Paket Wisata</h1>
				<p>Gabungkan beberapa paket wisata sesuai keinginan Anda</p>
			</div>

			<div className="catalog-filter-row">

				<div className="date-filter">
					<input
						type="date"
						min={minDateString}
						value={tanggal}
						onChange={(e) => setTanggal(e.target.value)}
						className={showPicker ? "show" : ""}
					/>
					<div
						className="date-toggle"
						onClick={() => setShowPicker(!showPicker)}
					>
						<span>{tanggal || "Pilih Tanggal"}</span>
						<div className="date-icon">
							<FiCalendar />
						</div>
					</div>
				</div>

				<select
					className="catalog-filter"
					value={kategori}
					onChange={(e) => setKategori(e.target.value)}
				>
					<option value="">Semua Kategori</option>
					{kategoriList.map((k, i) => (
						<option key={i} value={k}>
						{k}
						</option>
					))}
				</select>

				<div className="catalog-search-wrapper">
					<FiSearch className="catalog-search-icon" />
					<input
						className="catalog-search"
						placeholder="Cari paket wisata..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

			</div>

			<div className="custom-grid">

				<div className="catalog-grid">

					{dataToShow.map((paket) => {
						const selected = isSelected(paket.id);
						const availableStatus = isAvailable(paket.id);

						return (
							<div
								key={paket.id}
								className={`paket-card-small ${
									!availableStatus ? "unavailable" : ""
								}`}
								style={{
									backgroundImage:
										`url(http://127.0.0.1:8000/storage/${paket.url_thumbnail})`
								}}
							>

								{!availableStatus && (
									<div className="unavailable-badge">
										Tidak tersedia di tanggal ini
									</div>
								)}

								<div className="paket-kecil-content">

									<div className="catalog-pill-row">
										<span className="catalog-pill">
											{paket.kategori_paket}
										</span>
										<span className="catalog-pill">
											{paket.durasi}
										</span>
									</div>

									<h4>{paket.nama}</h4>

									<div className="paket-kecil-meta">
										<BiMoney />
										Rp {Number(paket.harga).toLocaleString("id-ID")}
									</div>

									<div className="paket-kecil-meta">
										<FiMapPin />
										{paket.lokasi}
									</div>

									<button
										disabled={!availableStatus}
										className={selected ? "btn-added" : "btn-add"}
										onClick={() => togglePaket(paket)}
									>
										{selected ? (
											<>
												<FiCheck />
												Ditambahkan
											</>
										) : (
											<>
												<FiPlus />
												Tambah
											</>
										)}
									</button>

								</div>

							</div>
						);
					})}

				</div>

				<div className="summary-wrapper">
                    <h2>Ringkasan Order</h2>
					<div className="summary-card">
						<div className="summary-section">
							<h4>Paket Wisata</h4>
							{selectedPakets.length === 0 && (
								<p className="summary-empty">
									Belum ada paket dipilih
								</p>
							)}

							{selectedPakets.length >= 3 && (
							<p className="custom-warning">
								Maksimal 3 paket dalam 1 hari
							</p>
							)}

							{selectedPakets.map((p) => {
								const availableStatus = isAvailable(p.id);

								return (
									<div
									key={p.id}
									className={`summary-item ${
										!availableStatus ? "unavailable-text" : ""
									}`}
									>
									<div className="summary-left">

										<div>
										{p.nama}

										{!availableStatus && (
											<div className="unavailable-label">
											Tidak tersedia di tanggal ini
											</div>
										)}

										</div>

									</div>

									<div className="summary-right">

										<div>
										{availableStatus
											? `Rp ${Number(p.harga).toLocaleString("id-ID")}`
											: "Rp 0"}
										</div>

										<button
										className="summary-remove"
										onClick={() =>
											setSelectedPakets(prev =>
											prev.filter(x => x.id !== p.id)
											)
										}
										>
										✕
										</button>

									</div>

									</div>
								);
								})}

						</div>

						<div className="summary-section">

							<h4>Tour Guide</h4>

							<label className="guide-option">
                                <input
                                    type="radio"
                                    name="guide"
                                    checked={selectedGuide === null}
                                    onChange={() => setSelectedGuide(null)}
                                />

                                <span className="guide-label">
                                    Tidak Pakai Guide
                                </span>

                                <span className="guide-price">
                                    + Rp 0
                                </span>

                            </label>


                            <label className="guide-option">

                                <input
                                    type="radio"
                                    name="guide"
                                    checked={selectedGuide === "half"}
                                    onChange={() => setSelectedGuide("half")}
                                />

                                <span className="guide-label">
                                    Guide 1/2 Hari
                                </span>

                                <span className="guide-price">
                                    + Rp 150.000
                                </span>

                            </label>

                            <label className="guide-option">
                                <input
                                    type="radio"
                                    name="guide"
                                    checked={selectedGuide === "full"}
                                    onChange={() => setSelectedGuide("full")}
                                />
                                <span className="guide-label">
                                    Guide 1 Hari Full
                                </span>

                                <span className="guide-price">
                                    + Rp 300.000
                                </span>
                            </label>
						</div>

						<div className="summary-section">
							<h4>Detail Pemesanan</h4>
							<div className="detail-booking-row">
								<div className="detail-input-group">
									<label>Tanggal</label>
									<input
										type="date"
										min={minDateString}
										value={tanggal}
										onChange={(e) => setTanggal(e.target.value)}
										className="detail-date-input uniform-input"
									/>

                                    {!tanggal && (
                                        <p className="detail-warning">
                                        Pilih tanggal terlebih dahulu
                                        </p>
                                    )}
								</div>

								<div className="detail-input-group">
									<label>Jumlah Orang</label>
									<div className="detail-stepper uniform-input">
										<button
											className="stepper-btn"
											onClick={() =>
												setJumlahOrang(prev =>
													prev > 1 ? prev - 1 : 1
												)
											}
										>
											−
										</button>

										<div className="stepper-value"> {jumlahOrang} </div>

										<button
											className="stepper-btn"
											onClick={() =>
												setJumlahOrang(prev => prev + 1)
											}
										>
											+
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className="summary-total">
							Total Biaya:
							<strong>
								Rp {totalHarga.toLocaleString("id-ID")}
							</strong>
						</div>

						<button
							className="btn-checkout"
							disabled={
								selectedCount === 0 ||
								!tanggal ||
								jumlahOrang < 1 ||
                                hasUnavailable
							}
                            onClick={handleBooking}
						>
							Pesan Sekarang
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Custom;