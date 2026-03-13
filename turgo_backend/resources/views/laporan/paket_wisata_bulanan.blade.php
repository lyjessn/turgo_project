@extends('laporan.layout')
@section('content')

<table>
    <thead>
        <tr>
            <th>Tanggal</th>
            <th>Kode Booking</th>
            <th>Pemesan</th>
            <th>Paket</th>
            <th>Jumlah Orang</th>
            <th>Total</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @foreach($data as $row)
            <tr>
                <td>{{ \Carbon\Carbon::parse($row->tanggal_booking)->locale('id')->translatedFormat('d F Y') }}</td>
                <td>#{{ $row->id }}</td>
                <td>{{ $row->nama_lengkap }}</td>
                <td>{{ $row->nama }}</td>
                <td>{{ $row->jumlah_orang }}</td>
                <td>Rp {{ number_format($row->total,0,',','.') }}</td>
                <td>{{ $row->status_pemesanan }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<div class="summary">
    <p>Total Booking: {{ $totalBooking }}</p>
    <p>Total Pendapatan: Rp {{ number_format($totalPendapatan,0,',','.') }}</p>

    @if(isset($bookingTerbanyak))
    <p>
        Booking terbanyak:
        {{ $bookingTerbanyak->nama }}
        ({{ $bookingTerbanyak->jumlah }} booking)
    </p>
    @endif

</div>

@endsection