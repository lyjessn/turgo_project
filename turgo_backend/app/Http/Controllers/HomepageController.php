<?php

namespace App\Http\Controllers;

use App\Models\PaketWisata;
use App\Models\Homestay;
use App\Models\TourGuide;

class HomepageController extends Controller
{
    public function index()
    {
        return response()->json([
            "paket_wisata" => PaketWisata::latest()->take(6)->get(),
            "homestay"     => Homestay::latest()->take(6)->get(),
            "tour_guide"   => TourGuide::latest()->take(6)->get(),
        ]);
    }
}
