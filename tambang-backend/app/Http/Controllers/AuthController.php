<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Storage;


class AuthController extends Controller
{
    // Login menggunakan JWT
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['message' => 'Password Atau Email Salah!'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['message' => 'Token Tidak Bisa Dibuat'], 500);
        }

        $user = auth()->user();

        // Cek status user (kecuali admin misalnya)
        if (!$user->hasRole('admin') && $user->status !== 'active') {
            return response()->json(['message' => 'Akun belum aktif'], 403);
        }

        $cookie = cookie('auth-jwt-pcys', $token, 60, '/', null, false, true, false, 'Lax');

        return response()->json([
            'message' => 'Login Berhasil',
            'status' => $user->status,
            'role' => $user->getRoleNames(),
        ])->cookie($cookie);

    }

    public function refreshToken(Request $request)
    {
        try {
            $token = $request->cookie('auth-jwt-pcys');

            if (!$token) {
                return response()->json(['message' => 'Token tidak ditemukan'], 401);
            }
            $newToken = JWTAuth::setToken($token)->refresh();
            $user = JWTAuth::setToken($newToken)->toUser();
            $cookie = cookie(
                'auth-jwt-pcys', 
                $newToken,       
                60,             
                '/',             
                null,           
                false,           
                true,            
                false,           
                'Lax'            
            );

            return response()->json([
                'message' => 'Token diperbarui',
                'role' => $user->getRoleNames()
            ])->cookie($cookie);

        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Token tidak dapat diperbarui',
                'error' => $e->getMessage() 
            ], 401);
        }
    }

    public function me(Request $request)
    {
        try {
            $token = $request->cookie('auth-jwt-pcys');
            if (!$token) {
                return response()->json(['message' => 'Token Tidak ada'], 401);
            }
            $user = JWTAuth::setToken($token)->toUser(); 

            if (!$user) {
                return response()->json(['message' => 'User tidak ditemukan'], 401);
            }

            return response()->json([
                'user' => $user,
                'role' => $user->getRoleNames(),
                'status' => $user->hasRole('admin') ? null : $user->status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $token = $request->cookie('auth-jwt-pcys');

            if (!$token) {
                return response()->json(['message' => 'Token tidak ditemukan'], 401);
            }

            $user = JWTAuth::setToken($token)->toUser();

            if (!$user) {
                return response()->json(['message' => 'User tidak ditemukan'], 404);
            }

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'password' => 'sometimes|min:6',
                'photo'    => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            ]);

            // Update basic info
            if ($request->has('name')) $user->name = $request->name;
            if ($request->has('email')) $user->email = $request->email;
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            // Handle Photo Upload
            if ($request->hasFile('photo')) {
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }

            $user->photo = $request->file('photo')->store('users', 'public');
            }

            $user->save();

            return response()->json([
                'message' => 'Profil berhasil diperbarui',
                'user' => $user,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui profil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Logout JWT
   public function logout(Request $request)
    {
        $cookie = cookie('auth-jwt-pcys', '', -1, null, null, false, true);

        try {
            $token = JWTAuth::getToken(); 
            if ($token) {
                JWTAuth::invalidate($token);
            }
        } catch (\Exception $e) {
        }

        return response()->json(['message' => 'Anda berhasil keluar'])->cookie($cookie);
    }

}
