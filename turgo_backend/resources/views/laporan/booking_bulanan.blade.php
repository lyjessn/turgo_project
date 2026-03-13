@extends('laporan.layout')
@section('content')

<table>
    <thead>
        <tr>
            <th>Tipe Booking</th>
            <th>Jumlah Booking</th>
            <th>Total Pendapatan</th>
        </tr>
    </thead>
    
    <tbody>
        @foreach($data as $row)
            <tr>
                <td>{{ $row->tipe_booking }}</td>
                <td>{{ $row->jumlah_booking }}</td>
                <td>Rp {{ number_format($row->total_pendapatan,0,',','.') }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection