@extends('laporan.layout')
@section('content')

<table>
    <thead>
        <tr>
            <th>Tanggal</th>
            <th>Kode Booking</th>
            <th>Pemesan</th>
            <th>Tour Guide</th>
            <th>Durasi</th>
            <th>Total</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @foreach($data as $row)
            <tr>
                <td>{{ $row->tanggal_booking }}</td>
                <td>#{{ $row->id }}</td>
                <td>{{ $row->nama_lengkap }}</td>
                <td>{{ $row->nama_tour_guide }}</td>
                <td>{{ $row->durasi }}</td>
                <td>Rp {{ number_format($row->total,0,',','.') }}</td>
                <td>{{ $row->status_pemesanan }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection