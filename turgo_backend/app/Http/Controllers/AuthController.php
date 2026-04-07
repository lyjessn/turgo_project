<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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
                'message' => 'Forbidden, hanya admin dan owner'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'username'      => 'required|string|max:255|unique:user,username',
            'email'         => 'required|email|max:255|unique:user,email',
            'password'      => 'required|string|min:8|confirmed',
            'nama_lengkap'  => 'required|string|max:255',
            'nomor_telepon' => 'nullable|string|max:20',
            'role_id'       => 'required|in:3,4,5,6',
            'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $fotoPath = null;

        if ($request->hasFile('foto_profil')) {

            $ext = $request->file('foto_profil')->getClientOriginalExtension();
            $namaFile = time().'_'.$request->username.'.'.$ext;

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
            'profile_completed' => 0
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'profile_completed' => $user->profile_completed
            ]
        ], 201);

    }

    public function registerByOwner(Request $request)
    {
        $userLogin = $request->user();

        $validator = Validator::make($request->all(), [
            'username'      => 'required|string|max:255|unique:user,username',
            'email'         => 'required|email|max:255|unique:user,email',
            'password'      => 'required|string|min:8|confirmed',
            'nama_lengkap'  => 'required|string|max:255',
            'nomor_telepon' => 'nullable|string|max:20',
            'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'role_id'       => 'nullable|in:1,2,7',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($userLogin && $userLogin->role_id == 1) {
            $role_id = $request->role_id ?? 2; 
        } else {
            $role_id = 7; 
        }

        $fotoPath = null;

        if ($request->hasFile('foto_profil')) {
            $ext = $request->file('foto_profil')->getClientOriginalExtension();
            $namaFile = time().'_'.$request->username.'.'.$ext;

            $fotoPath = $request->file('foto_profil')
                ->storeAs('foto_profil', $namaFile, 'public');
        }

        $user = User::create([
            'username'      => $request->username,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'nama_lengkap'  => $request->nama_lengkap,
            'nomor_telepon' => $request->nomor_telepon,
            'role_id'       => $role_id,
            'foto_profil'   => $fotoPath,
            'is_aktif'      => 1,
            'profile_completed' => 0
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
            ]
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
            'role' => str_replace(' ', '_', strtolower($user->role->name ?? '')),
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
        $user = $request->user()->load([
            'role',
            'tourGuide',
            'pelakuWisata',
            'homestays'
        ]);

        return response()->json([
            'user' => $user,
            'role' => str_replace(' ', '_', strtolower($user->role->name ?? ''))
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email tidak ditemukan'
            ], 404);
        }

        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        $resetLink = env('FRONTEND_URL') .
            "/reset-password?token=$token&email=" .
            urlencode($request->email);

        Mail::html("
        <p>Klik link berikut untuk reset password:</p>
        <a href='$resetLink'>Reset Password</a>
        ", function ($message) use ($request) {

            $message->to($request->email)
                    ->subject("Reset Password");

        });

        return response()->json([
            'message' => 'Link reset password telah dikirim ke email.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);

        $reset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset) {
            return response()->json([
                'message' => 'Link reset password tidak valid atau sudah kadaluarsa.'
            ], 422);
        }

        // cek user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        // cek password sama
        if (Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Password baru tidak boleh sama dengan password lama.'
            ], 422);
        }

        // update password
        $user->password = Hash::make($request->password);
        $user->save();

        // hapus token reset
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'message' => 'Password berhasil diubah.'
        ]);
    }
}
