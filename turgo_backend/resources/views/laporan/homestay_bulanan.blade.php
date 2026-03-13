@extends('laporan.layout')
@section('content')

<table>
    <thead>
        <tr>
            <th>Tanggal</th>
            <th>Kode Booking</th>
            <th>Pemesan</th>
            <th>Homestay</th>
            <th>Kamar</th>
            <th>Jumlah Hari</th>
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
                <td>{{ $row->nama_homestay }}</td>
                <td>{{ $row->nama_kamar }}</td>
                <td>{{ $row->jumlah_hari }}</td>
                <td>Rp {{ number_format($row->total,0,',','.') }}</td>
                <td>{{ $row->status_pemesanan }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection