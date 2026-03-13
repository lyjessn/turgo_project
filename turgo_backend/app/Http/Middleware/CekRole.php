<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CekRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Harus login terlebih dahulu',
            ], 401);
        }

        $role = strtolower(str_replace(' ', '_', $user->role->name));

        if (!in_array($role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Role tidak sesuai: ' . $role . ', harus salah satu dari: ' . implode(', ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
