<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\RiwayatSaldo;

class RiwayatSaldoController extends Controller
{
    public function myIncome(Request $request)
    {
        $user = $request->user();

        $data = RiwayatSaldo::with([
            'booking.user',
            'booking.homestayDetails.homestay',
            'booking.homestayDetails.kamar',
            'booking.paketWisataDetails.paketWisata',
            'booking.tourGuideDetails.tourGuide.user',
            'booking.customDetails.paketWisata'
        ])
        ->where('user_id', $user->id)
        ->orderBy('tanggal','desc')
        ->get();

        $total = RiwayatSaldo::where('user_id',$user->id)->sum('jumlah');

        $bulanIni = RiwayatSaldo::where('user_id',$user->id)
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->sum('jumlah');

        $jumlahBooking = RiwayatSaldo::where('user_id',$user->id)->count();

        return response()->json([
            'data' => $data,
            'summary' => [
                'total' => $total,
                'bulan_ini' => $bulanIni,
                'jumlah_booking' => $jumlahBooking
            ]
        ]);
    }

    public function downloadRekapCsv(Request $request)
    {
        $user = $request->user();

        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $query = RiwayatSaldo::with([
            'booking.user',
            'booking.homestayDetails.homestay',
            'booking.paketWisataDetails.paketWisata',
            'booking.tourGuideDetails'
        ])
        ->where('user_id', $user->id);

        if ($bulan !== 'all') {
            $query->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun);
        }

        $data = $query->get();

        $filename = $bulan === 'all'
            ? "rekap_penghasilan_keseluruhan_{$tahun}.csv"
            : "rekap_penghasilan_{$bulan}_{$tahun}.csv";

        $counter = [];

        foreach ($data as $row) {

            $booking = $row->booking;
            $aktivitas = '-';

            if ($booking->tipe_booking === 'homestay') {
                $aktivitas = $booking->homestayDetails?->homestay?->nama;
            }

            if ($booking->tipe_booking === 'paket_wisata') {
                $aktivitas = $booking->paketWisataDetails?->paketWisata?->nama;
            }

            if ($booking->tipe_booking === 'tour_guide') {
                $aktivitas = $booking->tourGuideDetails?->durasi . ' Jam';
            }

            if (!isset($counter[$aktivitas])) {
                $counter[$aktivitas] = 0;
            }

            $counter[$aktivitas]++;
        }

        $topAktivitas = "-";
        $topCount = 0;

        if (!empty($counter)) {
            arsort($counter);
            $topAktivitas = array_key_first($counter);
            $topCount = $counter[$topAktivitas];
        }

        $totalPenghasilan = $data->sum('jumlah');
        $jumlahBooking = $data->count();

        return response()->streamDownload(function () use ($data, $topAktivitas, $topCount, $totalPenghasilan, $jumlahBooking) {

            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Laporan Penghasilan Mitra']);
            fputcsv($handle, []);

            fputcsv($handle, ['Total Penghasilan', $totalPenghasilan]);
            fputcsv($handle, ['Jumlah Booking', $jumlahBooking]);
            fputcsv($handle, ['Aktivitas Terpopuler', $topAktivitas]);
            fputcsv($handle, ['Jumlah Aktivitas', $topCount]);

            fputcsv($handle, []);

            fputcsv($handle, [
                'Booking ID',
                'Nama Pemesan',
                'Aktivitas',
                'Tanggal',
                'Penghasilan'
            ]);

            foreach ($data as $row) {

                $booking = $row->booking;

                $aktivitas = '-';

                if ($booking->tipe_booking === 'homestay') {
                    $aktivitas = $booking->homestayDetails?->homestay?->nama;
                }

                if ($booking->tipe_booking === 'tour_guide') {
                    $aktivitas = "Tour Guide";
                }

                if ($booking->tipe_booking === 'paket_wisata') {
                    $aktivitas = $booking->paketWisataDetails?->paketWisata?->nama;
                }

                if ($booking->tipe_booking === 'custom') {
                    $aktivitas = "Custom Paket";
                }

                fputcsv($handle, [
                    $row->booking_id,
                    $booking?->user?->nama_lengkap,
                    $aktivitas,
                    $row->tanggal,
                    $row->jumlah
                ]);
            }

            fclose($handle);

        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
