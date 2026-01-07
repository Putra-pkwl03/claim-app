<?php
namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtFromCookie
{
    public function handle($request, Closure $next)
    {
        if ($token = $request->cookie('auth-jwt-pcys')) {
            try {
                $user = JWTAuth::setToken($token)->authenticate();
                auth()->setUser($user);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Token tidak valid atau expired'], 401);
            }
        } else {
            return response()->json(['message' => 'Token Tidak ada'], 401);
        }

        return $next($request);
    }
}
