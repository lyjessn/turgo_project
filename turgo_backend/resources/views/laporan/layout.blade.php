<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
            <style>

            @page{
                margin:40px;
            }

            h3{
                margin-top:20px;
            }

            body{
                font-family: DejaVu Sans;
                font-size:12px;
            }

            .header{
                text-align:center;
                margin-bottom:20px;
                page-break-inside: avoid;
            }

            table{
                width:100%;
                border-collapse:collapse;
                margin-bottom:15px;
            }

            table th, table td{
                border:1px solid #000;
                padding:6px;
            }

            th{
                background:#f0f0f0;
            }

            thead{
                display: table-header-group;
            }

            .summary{
                margin-top:20px;
            }

        </style>

    </head>

    <body>

        <table style="border:none; width:100%; margin-bottom:20px;">
            <tr>
                <td style="border:none; text-align:center;">
                    <h2>{{ $header['desa'] }}</h2>
                    <h3>{{ $header['judul'] }}</h3>
                    <p>Periode: {{ $header['periode'] }}</p>
                    <p>Tanggal Cetak: {{ $header['tanggalCetak'] }}</p>
                </td>
            </tr>
        </table>

    @yield('content')

    </body>
</html>