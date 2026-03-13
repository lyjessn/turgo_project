@extends('laporan.layout')

@section('content')

<table>

    <thead>
        <tr>
            <th>Tanggal</th>
            <th>Kode Booking</th>
            <th>Pemesan</th>
            <th>Tipe Booking</th>
            <th>Status</th>
            <th>Alasan Penolakan</th>
        </tr>
    </thead>

    <tbody>

        @forelse($data as $row)

            <tr>

                <td>
                    {{ \Carbon\Carbon::parse($row->tanggal_booking)->locale('id')->translatedFormat('d F Y') }}
                </td>

                <td>
                    {{ $row->id }}
                </td>

                <td>
                    {{ $row->nama_lengkap }}
                </td>

                <td>
                    {{ ucfirst($row->tipe_booking) }}
                </td>

                <td>
                    {{ ucfirst($row->status_pemesanan) }}
                </td>

                <td>
                    {{ $row->alasan_penolakan ?? '-' }}
                </td>

            </tr>

        @empty

            <tr>
                <td colspan="6" style="text-align:center">
                    Tidak ada data
                </td>
            </tr>

        @endforelse

    </tbody>

</table>

@endsection