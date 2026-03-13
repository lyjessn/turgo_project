@extends('laporan.layout')

@section('content')

<table>

    <thead>
        <tr>
            <th>Kode Booking</th>
            <th>Jumlah Paket</th>
            <th>Nama Paket</th>
            <th>Jumlah Orang</th>
            <th>Jenis TG</th>
            <th>Harga TG</th>
            <th>Pendapatan Paket</th>
            <th>Total Pendapatan</th>
        </tr>
    </thead>

    <tbody>

        @forelse($data as $row)

            <tr>

                <td>
                    {{ $row->id }}
                </td>

                <td>{{ $row->jumlah_paket }}</td>

                <td>
                    {{ $row->nama_paket }}
                </td>

                <td>
                    {{ $row->jumlah_orang }}
                </td>

                <td>
                    {{ ucfirst($row->jenis_tour_guide) }}
                </td>

                <td>
                    Rp {{ number_format($row->harga_tg, 0, ',', '.') }}
                </td>

                <td>
                    Rp {{ number_format($row->pendapatan_paket, 0, ',', '.') }}
                </td>

                <td>
                    Rp {{ number_format($row->total_pendapatan, 0, ',', '.') }}
                </td>

            </tr>

        @empty

            <tr>
                <td colspan="8" style="text-align:center">
                    Tidak ada data
                </td>
            </tr>

        @endforelse

    </tbody>

</table>

@if(isset($totalMingguan))

<div class="summary">
    <p>
        Total pendapatan minggu ini:
        Rp {{ number_format($totalMingguan, 0, ',', '.') }}
    </p>
</div>

@endif

@endsection