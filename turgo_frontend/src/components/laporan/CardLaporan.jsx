import { useState } from "react";
import { FiFileText } from "react-icons/fi";

const CardLaporan = ({ title, description, onDownload, periodeMode = "owner" }) => {
    const today = new Date();
    const [periodeType, setPeriodeType] = useState(periodeMode === "weekly" ? "mingguan" : "bulanan");
    const [bulan, setBulan] = useState(today.getMonth()+1);
    const [tahun, setTahun] = useState(today.getFullYear());
    const [minggu, setMinggu] = useState(1);

    const bulanList = [
        "Januari","Februari","Maret","April","Mei","Juni",
        "Juli","Agustus","September","Oktober","November","Desember"
    ];

    const mingguList = [1,2,3,4];

    const startYear = 2026;
    const currentYear = Math.max(new Date().getFullYear(), startYear);

    const tahunList = Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
    );

    return (
        <div className="card-laporan">

            <div className="laporan-info">
                <FiFileText className="laporan-icon"/>

                <div>
                    <h4 className="laporan-title">{title}</h4>
                    <p className="laporan-desc">{description}</p>

                    <div className="laporan-periode">
                        <span>Periode:</span>

                        {periodeMode === "owner" && (
                            <select
                                value={periodeType}
                                onChange={(e)=>setPeriodeType(e.target.value)}
                                className="laporan-select"
                            >
                                <option value="bulanan">Bulanan</option>
                                <option value="tahunan">Tahunan</option>
                            </select>
                            )}

                            {periodeMode === "weekly" && (
                                <span className="laporan-periode-label">Mingguan</span>
                            )}

                            {periodeMode === "monthly" && (
                                <span className="laporan-periode-label">Bulanan</span>
                            )}

                        {(periodeType === "mingguan" || periodeMode === "weekly") && (
                            <>
                                <select
                                    value={minggu}
                                    onChange={(e)=>setMinggu(Number(e.target.value))}
                                    className="laporan-select"
                                >
                                    {mingguList.map((m)=>(
                                        <option key={m} value={m}>
                                        Minggu {m}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={bulan}
                                    onChange={(e)=>setBulan(Number(e.target.value))}
                                    className="laporan-select"
                                >
                                    {bulanList.map((b,i)=>(
                                        <option key={i} value={i+1}>
                                        {b}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {(periodeType === "bulanan" || periodeMode === "monthly") && (
                            <select
                                value={bulan}
                                onChange={(e)=>setBulan(Number(e.target.value))}
                                className="laporan-select"
                            >
                                {bulanList.map((b,i)=>(
                                <option key={i} value={i+1}>
                                    {b}
                                </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={tahun}
                            onChange={(e)=>setTahun(Number(e.target.value))}
                            className="laporan-select"
                        >
                            {tahunList.map((t)=>(
                                <option key={t} value={t}>
                                {t}
                                </option>
                            ))}
                        </select>

                    </div>

                </div>
            </div>

            <button
                className="laporan-download"
                onClick={()=>{
                    const params = { periodeType, tahun };

                    if(periodeType === "bulanan" || periodeMode === "monthly"){
                        params.bulan = bulan;
                    }

                    if(periodeType === "mingguan" || periodeMode === "weekly"){
                        params.bulan = bulan;
                        params.minggu = minggu;
                    }
                    onDownload(params);
                }}
            >
                Download PDF
            </button>

        </div>
    );
};

export default CardLaporan;