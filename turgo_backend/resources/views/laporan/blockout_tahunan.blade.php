@extends('laporan.layout')
@section('content')

<table>
    <thead>
        <tr>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
            <th>Kategori</th>
            <th>Target</th>
            <th>Jenis Blockout</th>
            <th>Alasan</th>
        </tr>
    </thead>

    <tbody>

        @forelse($data as $row)

        <tr>
            <td>
                {{ \Carbon\Carbon::parse($row->tanggal_mulai)->locale('id')->translatedFormat('d F Y') }}
            </td>

            <td>
                {{ \Carbon\Carbon::parse($row->tanggal_selesai)->locale('id')->translatedFormat('d F Y') }}
            </td>

            <td>{{ ucfirst(str_replace('_',' ',$row->kategori)) }}</td>

            <td>{{ $row->nama_target }}</td>

            <td>{{ $row->tipe_blockout }}</td>

            <td>{{ $row->alasan ?? '-' }}</td>
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