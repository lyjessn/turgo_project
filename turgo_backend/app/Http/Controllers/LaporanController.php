<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class LaporanController extends Controller
{

    private function getTanggalMingguan($minggu, $bulan, $tahun)
    {
        $start = null;
        $end = null;

        switch ($minggu) {
            case 1:
                $start = "$tahun-$bulan-01";
                $end = "$tahun-$bulan-07";
                break;

            case 2:
                $start = "$tahun-$bulan-08";
                $end = "$tahun-$bulan-14";
                break;

            case 3:
                $start = "$tahun-$bulan-15";
                $end = "$tahun-$bulan-21";
                break;

            case 4:
                $start = "$tahun-$bulan-22";
                $end = Carbon::create($tahun,$bulan)->endOfMonth()->toDateString();
                break;
        }

        return [$start,$end];
    }

    private function getNamaBulan($bulan)
    {
        $list = [
            1=>"Januari",
            2=>"Februari",
            3=>"Maret",
            4=>"April",
            5=>"Mei",
            6=>"Juni",
            7=>"Juli",
            8=>"Agustus",
            9=>"September",
            10=>"Oktober",
            11=>"November",
            12=>"Desember"
        ];

        return $list[$bulan];
    }

    private function filterPeriode($query, $type, $request)
    {
        if($type === "bulanan"){
            return $query
                ->whereMonth('bookings.tanggal_booking',$request->bulan)
                ->whereYear('bookings.tanggal_booking',$request->tahun);
        }

        if($type === "tahunan"){
            return $query
                ->whereYear('bookings.tanggal_booking',$request->tahun);
        }

        if($type === "mingguan"){
            [$start,$end] = $this->getTanggalMingguan(
                $request->minggu,
                $request->bulan,
                $request->tahun
            );

            return $query
                ->whereBetween(DB::raw('DATE(bookings.tanggal_booking)'),[$start,$end]);
        }

        return $query;
    }

    private function headerLaporan($judul,$periode)
    {
        return [
            "desa"=>"Desa Wisata Turgo",
            "judul"=>$judul,
            "periode"=>$periode,
            "tanggalCetak"=>Carbon::now()->format('d F Y')
        ];
    }

    public function laporanPaketWisataBulanan(Request $request)
    {
        $query = DB::table('bookings')
            ->join('booking_paket_wisata_details','bookings.id','=','booking_paket_wisata_details.booking_id')
            ->join('paket_wisatas','booking_paket_wisata_details.paket_wisata_id','=','paket_wisatas.id')
            ->join('user','bookings.user_id','=','user.id')
            ->where('bookings.status_pemesanan','selesai');

        $query = $this->filterPeriode($query,"bulanan",$request);

        $data = $query
            ->select(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'paket_wisatas.nama',
                'booking_paket_wisata_details.jumlah_orang',
                'bookings.status_pemesanan',
                DB::raw('(booking_paket_wisata_details.jumlah_orang * paket_wisatas.harga) as total')
            )
            ->get();

        $totalBooking = $data->count();
        $totalPendapatan = $data->sum('total');

        $header = $this->headerLaporan(
            "Laporan Booking Paket Wisata",
            $this->getNamaBulan($request->bulan)." ".$request->tahun
        );

        $pdf = Pdf::loadView('laporan.paket_wisata_bulanan',[
            "header"=>$header,
            "data"=>$data,
            "totalBooking"=>$totalBooking,
            "totalPendapatan"=>$totalPendapatan
        ]);

        return $pdf->download("laporan_paket_wisata_bulanan.pdf");
    }

    public function laporanPaketWisataTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_paket_wisata_details','bookings.id','=','booking_paket_wisata_details.booking_id')
            ->join('paket_wisatas','booking_paket_wisata_details.paket_wisata_id','=','paket_wisatas.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'paket_wisatas.nama',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(booking_paket_wisata_details.jumlah_orang * paket_wisatas.harga) as total_pendapatan')
            )
            ->groupBy(DB::raw('MONTH(bookings.tanggal_booking)'), 'paket_wisatas.nama')
            ->orderBy('bulan')
            ->get();

        $totalPerBulan = $data->groupBy('bulan')->map(function($rows){
            return $rows->sum('total_pendapatan');
        });

        $totalTahunan = $data->sum('total_pendapatan');

        $topPerBulan = $data->groupBy('bulan')->map(function($rows){
            $max = $rows->max('jumlah_booking');
            return $rows->where('jumlah_booking',$max);
        });

        $topTahunan = $data
            ->groupBy('nama')
            ->map(function($rows){
                return (object)[
                    'nama'=>$rows->first()->nama,
                    'jumlah_booking'=>$rows->sum('jumlah_booking')
                ];
            })
            ->sortByDesc('jumlah_booking')
            ->first();

        $header = $this->headerLaporan("Laporan Booking Paket Wisata",$tahun);

        $pdf = Pdf::loadView('laporan.paket_wisata_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan,
            "topPerBulan"=>$topPerBulan,
            "topTahunan"=>$topTahunan
        ]);

        return $pdf->download("laporan_paket_wisata_tahunan.pdf");
    }

    public function laporanCustomBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_custom_details','bookings.id','=','booking_custom_details.booking_id')
            ->join('paket_wisatas','booking_custom_details.paket_wisata_id','=','paket_wisatas.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->select(
                'bookings.id',

                DB::raw('GROUP_CONCAT(DISTINCT paket_wisatas.nama SEPARATOR ", ") as nama_paket'),

                DB::raw('COUNT(booking_custom_details.id) as jumlah_paket'),

                DB::raw('MAX(booking_custom_details.jumlah_orang) as jumlah_orang'),
                DB::raw('MAX(booking_custom_details.jenis_tour_guide) as jenis_tour_guide'),

                DB::raw('CASE
                    WHEN MAX(booking_custom_details.jenis_tour_guide) = "full day" THEN 300000
                    WHEN MAX(booking_custom_details.jenis_tour_guide) = "half day" THEN 150000
                    ELSE 0
                END as harga_tg'),

                DB::raw('SUM(paket_wisatas.harga) as total_harga_paket'),

                DB::raw('(SUM(paket_wisatas.harga) * MAX(booking_custom_details.jumlah_orang)) as pendapatan_paket'),

                DB::raw('MAX(bookings.total_harga) as total_pendapatan')
            )
            ->groupBy('bookings.id')
            ->orderBy('bookings.id')
            ->get();

        $totalBulanan = $data->sum('total_pendapatan');

        $header = $this->headerLaporan(
            "Laporan Booking Paket Custom",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.custom_bulanan',[
            "header"=>$header,
            "data"=>$data,
            "totalBulanan"=>$totalBulanan
        ]);

        return $pdf->download("laporan_custom_bulanan.pdf");
    }
    public function laporanCustomTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_custom_details','bookings.id','=','booking_custom_details.booking_id')
            ->join('paket_wisatas','booking_custom_details.paket_wisata_id','=','paket_wisatas.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'bookings.id',

                DB::raw('GROUP_CONCAT(DISTINCT paket_wisatas.nama SEPARATOR ", ") as nama_paket'),

                DB::raw('COUNT(booking_custom_details.id) as jumlah_paket'),

                DB::raw('MAX(booking_custom_details.jumlah_orang) as jumlah_orang'),
                DB::raw('MAX(booking_custom_details.jenis_tour_guide) as jenis_tour_guide'),

                DB::raw('CASE
                    WHEN MAX(booking_custom_details.jenis_tour_guide) = "full day" THEN 300000
                    WHEN MAX(booking_custom_details.jenis_tour_guide) = "half day" THEN 150000
                    ELSE 0
                END as harga_tg'),

                DB::raw('SUM(paket_wisatas.harga) as total_harga_paket'),

                DB::raw('(SUM(paket_wisatas.harga) * MAX(booking_custom_details.jumlah_orang)) as pendapatan_paket'),

                DB::raw('MAX(bookings.total_harga) as total_pendapatan')
            )
            ->groupBy(
                DB::raw('MONTH(bookings.tanggal_booking)'),
                'bookings.id'
            )
            ->orderBy('bulan')
            ->get();
        $totalPerBulan = $data->groupBy('bulan')->map(function($rows){
            return $rows->sum('total_pendapatan');
        });

        $totalTahunan = $data->sum('total_pendapatan');

        $header = $this->headerLaporan(
            "Laporan Booking Paket Custom",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.custom_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan
        ]);

        return $pdf->download("laporan_custom_tahunan.pdf");
    }

    public function laporanHomestayBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_homestay_details','bookings.id','=','booking_homestay_details.booking_id')
            ->join('kamars','booking_homestay_details.kamar_id','=','kamars.id')
            ->join('homestays','kamars.homestay_id','=','homestays.id')
            ->join('user','bookings.user_id','=','user.id')
            ->leftJoin('riwayat_saldos','bookings.id','=','riwayat_saldos.booking_id')
            ->whereIn('bookings.status_pemesanan',['selesai'])
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                    'bookings.id',
                    'bookings.tanggal_booking',
                    'user.nama_lengkap',
                    'homestays.nama as nama_homestay',
                    'kamars.nama as nama_kamar',
                    DB::raw('DATEDIFF(bookings.tanggal_selesai,bookings.tanggal_mulai) as jumlah_hari'),
                    'bookings.status_pemesanan',
                    DB::raw('SUM(riwayat_saldos.jumlah) as total')
                )
            ->groupBy(
                    'bookings.id',
                    'bookings.tanggal_booking',
                    'user.nama_lengkap',
                    'homestays.nama',
                    'kamars.nama',
                    'bookings.tanggal_mulai',
                    'bookings.tanggal_selesai',
                    'bookings.status_pemesanan'
                )
            ->get();

        $totalBooking = $data->count();
        $totalPendapatan = $data->sum('total');

       $top = DB::table('booking_homestay_details')
            ->join('bookings','booking_homestay_details.booking_id','=','bookings.id')
            ->join('kamars','booking_homestay_details.kamar_id','=','kamars.id')
            ->join('homestays','kamars.homestay_id','=','homestays.id')
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->where('bookings.status_pemesanan','selesai')
            ->select('homestays.nama', DB::raw('COUNT(*) as jumlah'))
            ->groupBy('homestays.nama')
            ->orderByDesc('jumlah')
            ->first();

        $header = $this->headerLaporan(
            "Laporan Booking Homestay",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.homestay_bulanan',[
            "header"=>$header,
            "data"=>$data,
            "totalBooking"=>$totalBooking,
            "totalPendapatan"=>$totalPendapatan,
            "bookingTerbanyak"=>$top
        ]);

        return $pdf->download("laporan_homestay_bulanan.pdf");
    }

    public function laporanHomestayTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_homestay_details','bookings.id','=','booking_homestay_details.booking_id')
            ->join('kamars','booking_homestay_details.kamar_id','=','kamars.id')
            ->join('homestays','kamars.homestay_id','=','homestays.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'homestays.nama',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(bookings.total_harga) as total_pendapatan')
            )
            ->groupBy('bulan','homestays.nama')
            ->orderBy('bulan')
            ->get();

        $totalPerBulan = $data->groupBy('bulan')->map(function($rows){
            return $rows->sum('total_pendapatan');
        });

        $totalTahunan = $data->sum('total_pendapatan');

        $topPerBulan = $data->groupBy('bulan')->map(function($rows){
            $max = $rows->max('jumlah_booking');
            return $rows->where('jumlah_booking',$max);
        });

        $topTahunan = $data
            ->groupBy('nama')
            ->map(function($rows){
                return (object)[
                    'nama'=>$rows->first()->nama,
                    'jumlah_booking'=>$rows->sum('jumlah_booking')
                ];
            })
            ->sortByDesc('jumlah_booking')
            ->first();

        $header = $this->headerLaporan(
            "Laporan Booking Homestay",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.homestay_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan,
            "topPerBulan"=>$topPerBulan,
            "topTahunan"=>$topTahunan
        ]);

        return $pdf->download("laporan_homestay_tahunan.pdf");
    }

    public function laporanTourGuideBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_tour_guide_details','bookings.id','=','booking_tour_guide_details.booking_id')
            ->join('tour_guides','booking_tour_guide_details.tour_guide_id','=','tour_guides.id')
            ->join('user','bookings.user_id','=','user.id')
            ->join('user as tg_user','tour_guides.user_id','=','tg_user.id')
            ->leftJoin('riwayat_saldos','bookings.id','=','riwayat_saldos.booking_id')
            ->whereIn('bookings.status_pemesanan',['selesai'])
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'tg_user.nama_lengkap as nama_tour_guide',
                'booking_tour_guide_details.durasi',
                'bookings.status_pemesanan',
                DB::raw('SUM(riwayat_saldos.jumlah) as total')
            )
            ->groupBy(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'tg_user.nama_lengkap',
                'booking_tour_guide_details.durasi',
                'bookings.status_pemesanan'
            )
            ->get();

        $totalBooking = $data->count();
        $totalPendapatan = $data->sum('total');

        $top = DB::table('booking_tour_guide_details')
            ->join('tour_guides','booking_tour_guide_details.tour_guide_id','=','tour_guides.id')
            ->join('user as tg_user','tour_guides.user_id','=','tg_user.id')
            ->select('tg_user.nama_lengkap as nama_tour_guide', DB::raw('COUNT(*) as jumlah'))
            ->groupBy('tg_user.nama_lengkap')
            ->orderByDesc('jumlah')
            ->first();

        $header = $this->headerLaporan(
            "Laporan Booking Tour Guide",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.tourguide_bulanan',[
            "header"=>$header,
            "data"=>$data,
            "totalBooking"=>$totalBooking,
            "totalPendapatan"=>$totalPendapatan,
            "bookingTerbanyak"=>$top
        ]);

        return $pdf->download("laporan_tourguide_bulanan.pdf");
    }

    public function laporanTourGuideTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_tour_guide_details','bookings.id','=','booking_tour_guide_details.booking_id')
            ->join('tour_guides','booking_tour_guide_details.tour_guide_id','=','tour_guides.id')
            ->join('user as tg_user','tour_guides.user_id','=','tg_user.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'tg_user.nama_lengkap as nama',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(bookings.total_harga) as total_pendapatan')
            )
            ->groupBy('bulan','tg_user.nama_lengkap')
            ->orderBy('bulan')
            ->get();

        $totalPerBulan = $data->groupBy('bulan')->map(function($rows){
            return $rows->sum('total_pendapatan');
        });

        $totalTahunan = $data->sum('total_pendapatan');

        $topPerBulan = $data->groupBy('bulan')->map(function($rows){
            $max = $rows->max('jumlah_booking');
            return $rows->where('jumlah_booking',$max);
        });

        $topTahunan = $data
            ->groupBy('nama')
            ->map(function($rows){
                return (object)[
                    'nama'=>$rows->first()->nama,
                    'jumlah_booking'=>$rows->sum('jumlah_booking')
                ];
            })
            ->sortByDesc('jumlah_booking')
            ->first();

        $header = $this->headerLaporan(
            "Laporan Booking Tour Guide",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.tourguide_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan,
            "topPerBulan"=>$topPerBulan,
            "topTahunan"=>$topTahunan
        ]);

        return $pdf->download("laporan_tourguide_tahunan.pdf");
    }

    public function laporanKategoriPaketBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_paket_wisata_details','bookings.id','=','booking_paket_wisata_details.booking_id')
            ->join('paket_wisatas','booking_paket_wisata_details.paket_wisata_id','=','paket_wisatas.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                'paket_wisatas.kategori_paket',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(booking_paket_wisata_details.jumlah_orang * paket_wisatas.harga) as total_pendapatan')
            )
            ->groupBy('paket_wisatas.kategori_paket')
            ->get();

        $top = $data->sortByDesc('jumlah_booking')->first();

        $header = $this->headerLaporan(
            "Laporan Booking Paket Wisata Per Kategori",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.kategori_paket_bulanan',[
            "header"=>$header,
            "data"=>$data,
            "bookingTerbanyak"=>$top
        ]);

        return $pdf->download("laporan_kategori_paket_bulanan.pdf");
    }

    public function laporanKategoriPaketTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('booking_paket_wisata_details','bookings.id','=','booking_paket_wisata_details.booking_id')
            ->join('paket_wisatas','booking_paket_wisata_details.paket_wisata_id','=','paket_wisatas.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'paket_wisatas.kategori_paket',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(booking_paket_wisata_details.jumlah_orang * paket_wisatas.harga) as total_pendapatan')
            )
            ->groupBy(
                DB::raw('MONTH(bookings.tanggal_booking)'),
                'paket_wisatas.kategori_paket'
            )
            ->orderBy('bulan')
            ->get();

        $totalPerBulan = $data
            ->groupBy('bulan')
            ->map(function ($rows) {
                return $rows->sum('total_pendapatan');
            });

        $totalTahunan = $data->sum('total_pendapatan');

        $topPerBulan = $data->groupBy('bulan')->map(function($rows){
            $max = $rows->max('jumlah_booking');
            return $rows->where('jumlah_booking',$max);
        });

        $topTahunan = $data
            ->groupBy('kategori_paket')
            ->map(function($rows){
                return (object)[
                    'kategori_paket'=>$rows->first()->kategori_paket,
                    'jumlah_booking'=>$rows->sum('jumlah_booking')
                ];
            })
            ->sortByDesc('jumlah_booking')
            ->first();

        $header = $this->headerLaporan(
            "Laporan Booking Paket Wisata Per Kategori",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.kategori_paket_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "topPerBulan"=>$topPerBulan,
            "topTahunan"=>$topTahunan,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan
        ]);

        return $pdf->download("laporan_kategori_paket_tahunan.pdf");
    }

    public function laporanBookingBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->leftJoin('riwayat_saldos','bookings.id','=','riwayat_saldos.booking_id')
            ->whereIn('bookings.status_pemesanan',['selesai'])
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                'bookings.tipe_booking',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(riwayat_saldos.jumlah) as total_pendapatan')
            )
            ->groupBy('bookings.tipe_booking')
            ->get();

        $header = $this->headerLaporan(
            "Laporan Booking Keseluruhan",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.booking_bulanan',[
            "header"=>$header,
            "data"=>$data
        ]);

        return $pdf->download("laporan_booking_bulanan.pdf");
    }

    public function laporanBookingTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->leftJoin('riwayat_saldos','bookings.id','=','riwayat_saldos.booking_id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'bookings.tipe_booking',
                DB::raw('COUNT(bookings.id) as jumlah_booking'),
                DB::raw('SUM(riwayat_saldos.jumlah) as total_pendapatan')
            )
            ->groupBy(
                DB::raw('MONTH(bookings.tanggal_booking)'),
                'bookings.tipe_booking'
            )
            ->orderBy('bulan')
            ->get();

        $totalPerBulan = $data->groupBy('bulan')->map(function($rows){
            return $rows->sum('total_pendapatan');
        });

        $totalTahunan = $data->sum('total_pendapatan');

        $topPerBulan = $data->groupBy('bulan')->map(function($rows){
            $max = $rows->max('jumlah_booking');
            return $rows->where('jumlah_booking',$max);
        });

        $topTahunan = $data
            ->groupBy('tipe_booking')
            ->map(function($rows){
                return (object)[
                    'tipe_booking'=>$rows->first()->tipe_booking,
                    'jumlah_booking'=>$rows->sum('jumlah_booking')
                ];
            })
            ->sortByDesc('jumlah_booking')
            ->first();

        $header = $this->headerLaporan(
            "Laporan Booking Keseluruhan",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.booking_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan,
            "topPerBulan"=>$topPerBulan,
            "topTahunan"=>$topTahunan
        ]);
        return $pdf->download("laporan_booking_tahunan.pdf");
    }

    public function laporanBookingBatalBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('user','bookings.user_id','=','user.id')
            ->whereIn('bookings.status_pemesanan',['batal','ditolak'])
            ->whereMonth('bookings.tanggal_booking',$bulan)
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'bookings.tipe_booking',
                'bookings.status_pemesanan',
                'bookings.alasan_penolakan'
            )
            ->orderBy('bookings.tanggal_booking')
            ->get();

        $header = $this->headerLaporan(
            "Laporan Booking Batal",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.booking_batal_bulanan',[
            "header"=>$header,
            "data"=>$data
        ]);

        return $pdf->download("laporan_booking_batal_bulanan.pdf");
    }

    public function laporanBookingBatalTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $data = DB::table('bookings')
            ->join('user','bookings.user_id','=','user.id')
            ->whereIn('bookings.status_pemesanan',['batal','ditolak'])
            ->whereYear('bookings.tanggal_booking',$tahun)
            ->select(
                DB::raw('MONTH(bookings.tanggal_booking) as bulan'),
                'bookings.id',
                'user.nama_lengkap',
                'bookings.tipe_booking',
                'bookings.status_pemesanan',
                'bookings.alasan_penolakan'
            )
            ->orderBy('bulan')
            ->get();

        $totalPerBulan = $data->groupBy('bulan')->map(function($rows){
            return $rows->count();
        });

        $totalTahunan = $data->count();

        $header = $this->headerLaporan(
            "Laporan Booking Batal",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.booking_batal_tahunan',[
            "header"=>$header,
            "data"=>$data,
            "totalPerBulan"=>$totalPerBulan,
            "totalTahunan"=>$totalTahunan
        ]);

        return $pdf->download("laporan_booking_batal_tahunan.pdf");
    }

    public function laporanPaketWisataMingguan(Request $request)
    {
        $query = DB::table('bookings')
            ->join('booking_paket_wisata_details','bookings.id','=','booking_paket_wisata_details.booking_id')
            ->join('paket_wisatas','booking_paket_wisata_details.paket_wisata_id','=','paket_wisatas.id')
            ->join('user','bookings.user_id','=','user.id')
            ->where('bookings.status_pemesanan','selesai');

        $query = $this->filterPeriode($query,"mingguan",$request);

        $data = $query
            ->select(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'paket_wisatas.nama',
                'booking_paket_wisata_details.jumlah_orang',
                'bookings.status_pemesanan',
                DB::raw('(booking_paket_wisata_details.jumlah_orang * paket_wisatas.harga) as total')
            )
            ->get();

        $totalBooking = $data->count();
        $totalPendapatan = $data->sum('total');

        $header = $this->headerLaporan(
            "Laporan Booking Paket Wisata Mingguan",
            "Minggu {$request->minggu} ".$this->getNamaBulan($request->bulan)." ".$request->tahun
        );

        $pdf = Pdf::loadView('laporan.paket_wisata_mingguan',[
            "header"=>$header,
            "data"=>$data,
            "totalBooking"=>$totalBooking,
            "totalPendapatan"=>$totalPendapatan
        ]);

        return $pdf->download("laporan_paket_wisata_mingguan.pdf");
    }

    public function laporanCustomMingguan(Request $request)
    {
        $minggu = $request->minggu;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        [$start,$end] = $this->getTanggalMingguan($minggu,$bulan,$tahun);

        $data = DB::table('bookings')
            ->join('booking_custom_details','bookings.id','=','booking_custom_details.booking_id')
            ->join('paket_wisatas','booking_custom_details.paket_wisata_id','=','paket_wisatas.id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereBetween(DB::raw('DATE(bookings.tanggal_booking)'),[$start,$end])
            ->select(

                'bookings.id',

                DB::raw('GROUP_CONCAT(DISTINCT paket_wisatas.nama SEPARATOR ", ") as nama_paket'),

                DB::raw('COUNT(booking_custom_details.id) as jumlah_paket'),

                DB::raw('MAX(booking_custom_details.jumlah_orang) as jumlah_orang'),

                DB::raw('MAX(booking_custom_details.jenis_tour_guide) as jenis_tour_guide'),

                DB::raw('CASE
                    WHEN MAX(booking_custom_details.jenis_tour_guide) = "full day" THEN 300000
                    WHEN MAX(booking_custom_details.jenis_tour_guide) = "half day" THEN 150000
                    ELSE 0
                END as harga_tg'),

                DB::raw('SUM(paket_wisatas.harga) as total_harga_paket'),

                DB::raw('(SUM(paket_wisatas.harga) * MAX(booking_custom_details.jumlah_orang)) as pendapatan_paket'),

                DB::raw('MAX(bookings.total_harga) as total_pendapatan')
            )
            ->groupBy('bookings.id')
            ->orderBy('bookings.id')
            ->get();

        $totalMingguan = $data->sum('total_pendapatan');

        $header = $this->headerLaporan(
            "Laporan Booking Paket Custom",
            "Minggu $minggu ".$this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.custom_mingguan',[
            "header"=>$header,
            "data"=>$data,
            "totalMingguan"=>$totalMingguan
        ]);

        return $pdf->download("laporan_custom_mingguan.pdf");
    }

    public function laporanHomestayMingguan(Request $request)
    {
        $minggu = $request->minggu;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        [$start,$end] = $this->getTanggalMingguan($minggu,$bulan,$tahun);

        $data = DB::table('bookings')
            ->join('booking_homestay_details','bookings.id','=','booking_homestay_details.booking_id')
            ->join('kamars','booking_homestay_details.kamar_id','=','kamars.id')
            ->join('homestays','kamars.homestay_id','=','homestays.id')
            ->join('user','bookings.user_id','=','user.id')
            ->leftJoin('riwayat_saldos','bookings.id','=','riwayat_saldos.booking_id')
            ->where('bookings.status_pemesanan','selesai')
            ->whereBetween('bookings.tanggal_booking',[$start,$end])
            ->select(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'homestays.nama as nama_homestay',
                'kamars.nama as nama_kamar',
                DB::raw('DATEDIFF(bookings.tanggal_selesai,bookings.tanggal_mulai) as jumlah_hari'),
                'bookings.status_pemesanan',
                DB::raw('SUM(riwayat_saldos.jumlah) as total')
            )
            ->groupBy(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'homestays.nama',
                'kamars.nama',
                'bookings.tanggal_mulai',
                'bookings.tanggal_selesai',
                'bookings.status_pemesanan'
            )
            ->get();

        $totalBooking = $data->count();
        $totalPendapatan = $data->sum('total');

        $header = $this->headerLaporan(
            "Laporan Booking Homestay Mingguan",
            "Minggu $minggu ".$this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.homestay_mingguan',[
            "header"=>$header,
            "data"=>$data,
            "totalBooking"=>$totalBooking,
            "totalPendapatan"=>$totalPendapatan
        ]);

        return $pdf->download("laporan_homestay_mingguan.pdf");
    }
    public function laporanTourGuideMingguan(Request $request)
    {
        $minggu = $request->minggu;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        [$start,$end] = $this->getTanggalMingguan($minggu,$bulan,$tahun);

        $data = DB::table('bookings')
            ->join('booking_tour_guide_details','bookings.id','=','booking_tour_guide_details.booking_id')
            ->join('tour_guides','booking_tour_guide_details.tour_guide_id','=','tour_guides.id')
            ->join('user','bookings.user_id','=','user.id')
            ->join('user as tg_user','tour_guides.user_id','=','tg_user.id')
            ->whereBetween(DB::raw('DATE(bookings.tanggal_booking)'),[$start,$end])
            ->select(
                'bookings.id',
                'bookings.tanggal_booking',
                'user.nama_lengkap',
                'tg_user.nama_lengkap as nama_tour_guide',
                'booking_tour_guide_details.durasi',
                'bookings.status_pemesanan'
            )
            ->where('bookings.status_pemesanan','selesai')
            ->get();

        $header = $this->headerLaporan(
            "Laporan Booking Tour Guide Mingguan",
            "Minggu $minggu ".$this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.tourguide_mingguan',[
            "header"=>$header,
            "data"=>$data
        ]);

        return $pdf->download("laporan_tourguide_mingguan.pdf");
    }

    public function laporanBlockoutBulanan(Request $request)
    {
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $global = DB::table('blockout_globals')
            ->whereMonth('tanggal_mulai',$bulan)
            ->whereYear('tanggal_mulai',$tahun)
            ->select(
                'tanggal_mulai',
                'tanggal_selesai',
                DB::raw("'Global' as tipe_blockout"),
                DB::raw("'Semua Paket' as kategori"),
                DB::raw("'Semua Paket' as nama_target"),
                'alasan'
            );

        $spesifik = DB::table('blockout_spesifiks')
            ->leftJoin('paket_wisatas', function($join){
                $join->on('blockout_spesifiks.id_target','=','paket_wisatas.id')
                    ->where('blockout_spesifiks.kategori','paket_wisata');
            })
            ->leftJoin('tour_guides', function($join){
                $join->on('blockout_spesifiks.id_target','=','tour_guides.id')
                    ->where('blockout_spesifiks.kategori','tour_guide');
            })
            ->leftJoin('user as tg_user','tour_guides.user_id','=','tg_user.id')
            ->leftJoin('homestays', function($join){
                $join->on('blockout_spesifiks.id_target','=','homestays.id')
                    ->where('blockout_spesifiks.kategori','homestay');
            })
            ->whereMonth('blockout_spesifiks.tanggal_mulai',$bulan)
            ->whereYear('blockout_spesifiks.tanggal_mulai',$tahun)
            ->select(
                'blockout_spesifiks.tanggal_mulai',
                'blockout_spesifiks.tanggal_selesai',
                DB::raw("'Spesifik' as tipe_blockout"),
                'blockout_spesifiks.kategori',
                DB::raw("
                    CASE
                        WHEN blockout_spesifiks.kategori='paket_wisata' THEN paket_wisatas.nama
                        WHEN blockout_spesifiks.kategori='tour_guide' THEN tg_user.nama_lengkap
                        WHEN blockout_spesifiks.kategori='homestay' THEN homestays.nama
                    END as nama_target
                "),
                'blockout_spesifiks.alasan'
            );

        $data = $global
            ->unionAll($spesifik)
            ->orderBy('tanggal_mulai')
            ->get();

        $header = $this->headerLaporan(
            "Laporan Blockout Date",
            $this->getNamaBulan($bulan)." ".$tahun
        );

        $pdf = Pdf::loadView('laporan.blockout_bulanan',[
            "header"=>$header,
            "data"=>$data
        ]);

        return $pdf->download("laporan_blockout_bulanan.pdf");
    }

    public function laporanBlockoutTahunan(Request $request)
    {
        $tahun = $request->tahun;

        $global = DB::table('blockout_globals')
            ->whereYear('tanggal_mulai',$tahun)
            ->select(
                DB::raw('MONTH(tanggal_mulai) as bulan'),
                'tanggal_mulai',
                'tanggal_selesai',
                DB::raw("'Global' as tipe_blockout"),
                DB::raw("'Semua Paket' as kategori"),
                DB::raw("'Semua Paket' as nama_target"),
                'alasan'
            );

        $spesifik = DB::table('blockout_spesifiks')
            ->leftJoin('paket_wisatas', function($join){
                $join->on('blockout_spesifiks.id_target','=','paket_wisatas.id')
                    ->where('blockout_spesifiks.kategori','paket_wisata');
            })
            ->leftJoin('tour_guides', function($join){
                $join->on('blockout_spesifiks.id_target','=','tour_guides.id')
                    ->where('blockout_spesifiks.kategori','tour_guide');
            })
            ->leftJoin('user as tg_user','tour_guides.user_id','=','tg_user.id')
            ->leftJoin('homestays', function($join){
                $join->on('blockout_spesifiks.id_target','=','homestays.id')
                    ->where('blockout_spesifiks.kategori','homestay');
            })
            ->whereYear('blockout_spesifiks.tanggal_mulai',$tahun)
            ->select(
                DB::raw('MONTH(blockout_spesifiks.tanggal_mulai) as bulan'),
                'blockout_spesifiks.tanggal_mulai',
                'blockout_spesifiks.tanggal_selesai',
                DB::raw("'Spesifik' as tipe_blockout"),
                'blockout_spesifiks.kategori',
                DB::raw("
                    CASE
                        WHEN blockout_spesifiks.kategori='paket_wisata' THEN paket_wisatas.nama
                        WHEN blockout_spesifiks.kategori='tour_guide' THEN tg_user.nama_lengkap
                        WHEN blockout_spesifiks.kategori='homestay' THEN homestays.nama
                    END as nama_target
                "),
                'blockout_spesifiks.alasan'
            );

        $data = $global
            ->unionAll($spesifik)
            ->orderBy('bulan')
            ->orderBy('tanggal_mulai')
            ->get();

        $header = $this->headerLaporan(
            "Laporan Blockout Date",
            $tahun
        );

        $pdf = Pdf::loadView('laporan.blockout_tahunan',[
            "header"=>$header,
            "data"=>$data
        ]);

        return $pdf->download("laporan_blockout_tahunan.pdf");
    }

}