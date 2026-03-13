@extends('laporan.layout')
@section('content')

<table>
    <thead>
        <tr>
            <th>Kategori Paket</th>
            <th>Jumlah Booking</th>
            <th>Total Pendapatan</th>
        </tr>
    </thead>

    <tbody>
        @foreach($data as $row)
            <tr>
                <td>{{ $row->kategori_paket }}</td>
                <td>{{ $row->jumlah_booking }}</td>
                <td>Rp {{ number_format($row->total_pendapatan,0,',','.') }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@if(isset($bookingTerbanyak))
    <div class="summary">
        <p>
        Booking terbanyak: 
        {{ $bookingTerbanyak->kategori_paket }}
        ({{ $bookingTerbanyak->jumlah_booking }} booking)
        </p>
    </div>
@endif

@endsection