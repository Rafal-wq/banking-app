<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Dla żądań AJAX lub API, zwraca odpowiedź JSON
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Already authenticated',
                        'redirect' => RouteServiceProvider::HOME
                    ]);
                }

                // Przekierowanie z komunikatem dla żądań standardowych
                return redirect(RouteServiceProvider::HOME)
                    ->with('success', 'Jesteś już zalogowany');
            }
        }

        return $next($request);
    }
}
