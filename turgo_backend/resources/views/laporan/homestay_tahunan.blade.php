@extends('laporan.layout')
@section('content')

@php
    $grouped = $data->groupBy('bulan');
@endphp

@for($bulan = 1; $bulan <= 12; $bulan++)

<h3>
    {{ \Carbon\Carbon::create()->month($bulan)->locale('id')->translatedFormat('F') }}
</h3>

<table>
    <thead>
        <tr>
            <th>Homestay</th>
            <th>Jumlah Booking</th>
            <th>Total Pendapatan</th>
        </tr>
    </thead>

    <tbody>

    @if(isset($grouped[$bulan]))

        @foreach($grouped[$bulan] as $row)

        <tr>
            <td>{{ $row->nama }}</td>
            <td>{{ $row->jumlah_booking }}</td>
            <td>
                Rp {{ number_format($row->total_pendapatan,0,',','.') }}
            </td>
        </tr>

        @endforeach

    @else

        <tr>
            <td colspan="3" style="text-align:center">
                Tidak ada data
            </td>
        </tr>

    @endif

    </tbody>
</table>

@if(isset($totalPerBulan[$bulan]))
<p>
    Total pendapatan bulan ini:
    Rp {{ number_format($totalPerBulan[$bulan],0,',','.') }}
</p>
@endif

@if(isset($topPerBulan[$bulan]))
<p>
    Homestay terbanyak bulan ini:

    @foreach($topPerBulan[$bulan] as $top)
        {{ $top->nama }} ({{ $top->jumlah_booking }} booking)
        @if(!$loop->last), @endif
    @endforeach

</p>
@endif

<br>

@endfor


@if(isset($totalTahunan))
<div class="summary">
    <p>
        Total pendapatan tahun ini:
        Rp {{ number_format($totalTahunan,0,',','.') }}
    </p>
</div>
@endif


@if(isset($topTahunan))
<div class="summary">
    <p>
        Homestay terbanyak tahun ini:
        {{ $topTahunan->nama }}
        ({{ $topTahunan->jumlah_booking }} booking)
    </p>
</div>
@endif

@endsection