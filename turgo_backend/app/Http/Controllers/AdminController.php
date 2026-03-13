<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

use App\Models\User;
use App\Models\Role;

class AdminController extends Controller
{
    public function getAdmin()
    {
        $users = User::with('role')
            ->whereIn('role_id', [1,2])
            ->select('id','nama_lengkap','username','email','role_id','is_aktif', 'nomor_telepon', 'foto_profil')
            ->orderBy('id','desc')
            ->get();

        return response()->json([
            'data' => $users
        ]);
    }  

    public function update(Request $request, $id)
    {
        $userLogin = $request->user();

        $admin = User::find($id);

        if (!$admin) {
            return response()->json([
                "success" => false,
                "message" => "Admin tidak ditemukan"
            ], 404);
        }

        if ($userLogin->role->name !== 'owner') {
            return response()->json([
                "message" => "Forbidden"
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_lengkap'  => 'nullable|string|max:255',
            'username'      => 'nullable|string|max:255|unique:user,username,' . $id,
            'email'         => 'nullable|email|max:255|unique:user,email,' . $id,
            'nomor_telepon' => 'nullable|string|max:20',
            'role_id'       => 'nullable|in:1,2',
            'is_aktif'      => 'nullable|boolean',
            'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('foto_profil')) {

            if ($admin->foto_profil && Storage::disk('public')->exists($admin->foto_profil)) {
                Storage::disk('public')->delete($admin->foto_profil);
            }

            $admin->foto_profil = $request->file('foto_profil')
                ->store('foto_profil', 'public');
        }

        $admin->update($request->except('foto_profil'));

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil diupdate',
            'data'    => $admin->load('role')
        ]);
    }
}
