<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

use App\Models\User;
use App\Models\Role;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username'      => 'required|string|max:255|unique:user,username',
                'email'         => 'required|email|max:255|unique:user,email',
                'password'      => 'required|string|min:8|confirmed',
                'nama_lengkap'  => 'required|string|max:255',
                'nomor_telepon' => 'nullable|string|max:20',
                'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $fotoPath = null;

            if ($request->hasFile('foto_profil')) {
                $namaFile = strtolower(str_replace(' ', '_', $request->username))
                    . '.' . $request->file('foto_profil')->extension();

                $fotoPath = $request->file('foto_profil')
                    ->storeAs('foto_profil', $namaFile, 'public');
            }

            $user = User::create([
                'username'      => $request->username,
                'email'         => $request->email,
                'password'      => Hash::make($request->password),
                'nama_lengkap'  => $request->nama_lengkap,
                'nomor_telepon' => $request->nomor_telepon,

                'role_id'       => 7,
                'foto_profil'   => $fotoPath,

                'is_aktif'      => 1,
                'created_at'    => Carbon::now(),
                'updated_at'    => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'Register berhasil',
                'user'    => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Register gagal',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function registerByAdmin(Request $request)
    {
        $userLogin = $request->user();

        if (!$userLogin || ($userLogin->role->name !== 'admin' && $userLogin->role->name !== 'owner')) {
            return response()->json([
                'message' => 'Forbidden, hanya admin'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'username'      => 'required|string|max:255|unique:user,username',
            'email'         => 'required|email|max:255|unique:user,email',
            'password'      => 'required|string|min:8|confirmed',
            'nama_lengkap'  => 'required|string|max:255',
            'nomor_telepon' => 'nullable|string|max:20',
            'role_id'       => 'required|in:2,3,4,5,6,7',
            'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->role_id == 1) {
            return response()->json([
                'message' => 'Admin tidak boleh membuat akun Owner'
            ], 403);
        }

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first()
            ], 400);
        }

        $fotoPath = null;

        if ($request->hasFile('foto_profil')) {
            $namaFile = strtolower(str_replace(' ', '_', $request->username))
                . '.' . $request->file('foto_profil')->extension();

            $fotoPath = $request->file('foto_profil')
                ->storeAs('foto_profil', $namaFile, 'public');
        }

        $user = User::create([
            'username'      => $request->username,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'nama_lengkap'  => $request->nama_lengkap,
            'nomor_telepon' => $request->nomor_telepon,

            'role_id'       => $request->role_id,
            'foto_profil'   => $fotoPath,

            'is_aktif'      => 1,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat oleh admin',
            'user'    => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        if (!$user->is_aktif) {
            return response()->json([
                'message' => 'Akun tidak aktif'
            ], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Login berhasil',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
            'role'         => $user->role->name ?? null,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak terautentikasi'
            ], 401);
        }

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function getRole(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'role' => $user->role->name ?? null
        ]);
    }

    public function getUserData(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user,
            'role' => $user->role->name ?? null
        ]);
    }
}
