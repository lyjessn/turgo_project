<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Models\User;

class UserController extends Controller
{
    public function getMitra()
    {
        $users = User::with('role')
            ->whereIn('role_id', [3,4,5,6])
            ->select('id','nama_lengkap','username','email','role_id','is_aktif','profile_completed', 'foto_profil', 'nomor_telepon')
            ->orderBy('id','desc')
            ->get();

        return response()->json([
            'data' => $users
        ]);
    }

    public function getPengunjung()
    {
        $users = User::with('role')
            ->whereIn('role_id', [7])
            ->select('id','nama_lengkap','username','email','role_id','is_aktif', 'nomor_telepon', 'foto_profil')
            ->orderBy('id','desc')
            ->get();

        return response()->json([
            'data' => $users
        ]);
    }  

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $currentUser = $request->user();

        if ($currentUser->role->name === 'admin' && $user->role->name == 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin hanya bisa mengubah status admin lain'
            ],403);
        }

        $validator = Validator::make($request->all(), [
            'is_aktif' => 'nullable|boolean',
            'foto_profil' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'=>false,
                'errors'=>$validator->errors()
            ],422);
        }

        if ($request->hasFile('foto_profil')) {

            if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
                Storage::disk('public')->delete($user->foto_profil);
            }

            $user->foto_profil = $request->file('foto_profil')
                ->store('foto_profil', 'public');
        }

        $user->update($request->except('foto_profil'));

        return response()->json([
            'success'=>true,
            'data'=>$user->load('role')
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:user,username,' . $user->id,
            'email' => 'required|email|unique:user,email,' . $user->id,
            'nomor_telepon' => 'nullable|string|max:20',
            'foto_profil' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('foto_profil')) {

            $path = $request->file('foto_profil')
                ->store('profiles', 'public');

            $user->foto_profil = $path;
        }

        $user->nama_lengkap = $request->nama_lengkap;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->nomor_telepon = $request->nomor_telepon;

        $user->save();

        return response()->json([
            'success' => true,
            'data' => $user->load('role')
        ]);
    }

    public function updatePengunjung(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role_id != 7) {
            return response()->json([
                'success' => false,
                'message' => 'User bukan pengunjung'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_aktif' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->is_aktif = $request->is_aktif;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => $user->load('role')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $userLogin = $request->user();

        if ($userLogin->role->name !== 'owner') abort(403);

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        if ($userLogin->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus akun sendiri'
            ], 400);
        }

        if ($user->tourGuide) {
            $user->tourGuide()->delete();
        }

        if ($user->homestay) {
            $user->homestay()->delete();
        }

        if ($user->umkm) {
            $user->umkm()->delete();
        }

        if ($user->pelakuWisata) {
            $user->pelakuWisata()->delete();
        }

        if ($user->foto_profil) {
            Storage::disk('public')->delete($user->foto_profil);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus'
        ]);
    }
}
