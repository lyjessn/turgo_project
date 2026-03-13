@extends('laporan.layout')

@section('content')

    @php
        $grouped = $data->groupBy('bulan');
    @endphp

    @for($bulan = 1; $bulan <= 12; $bulan++)

        @php
            $rows = $grouped->get($bulan, collect());
        @endphp

        <h3>
            {{ \Carbon\Carbon::create()->month($bulan)->locale('id')->translatedFormat('F') }}
        </h3>

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

                @if($rows->count())

                    @foreach($rows as $row)

                        <tr>
                            <td>{{ $row->id }}</td>
                            <td>{{ $row->jumlah_paket }}</td>
                            <td>{{ $row->nama_paket }}</td>
                            <td>{{ $row->jumlah_orang }}</td>
                            <td>{{ ucfirst($row->jenis_tour_guide) }}</td>
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

                    @endforeach

                @else

                    <tr>
                        <td colspan="8" style="text-align:center">
                            Tidak ada data
                        </td>
                    </tr>

                @endif

            </tbody>
        </table>

        @if(isset($totalPerBulan[$bulan]))

            <p>
                Total pendapatan bulan ini:
                Rp {{ number_format($totalPerBulan[$bulan], 0, ',', '.') }}
            </p>

        @endif

    @endfor


    @if(isset($totalTahunan))

        <div class="summary">
            <p>
                Total pendapatan tahun ini:
                Rp {{ number_format($totalTahunan, 0, ',', '.') }}
            </p>
        </div>

    @endif

@endsection