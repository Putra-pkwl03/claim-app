<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /** CREATE USER */
    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'photo'    => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'password' => 'required|min:6',
            'role'     => 'required|in:contractor,surveyor,finance,owner,managerial',
            'status'   => 'nullable|in:active,inactive'
        ]);

        $photoPath = $request->hasFile('photo') 
            ? $request->file('photo')->store('users', 'public') 
            : null;

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'status'   => $request->status ?? 'inactive',
            'photo'    => $photoPath
        ]);

        $role = Role::firstOrCreate(['name' => $request->role]);
        $user->assignRole($role);

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user,
            'role'    => $role->name,
            'photo_url' => $user->photo ? asset('storage/' . $user->photo) : null
        ], 201);
    }

    /** READ (GET ALL USERS) */
    public function getUsers()
    {
        $users = User::with('roles')->get();

        return response()->json([
            'users' => $users->map(function ($user) {
                return [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'status'    => $user->status,
                    'role'      => $user->roles->pluck('name')->first(),
                    'photo_url' => $user->photo ? asset('storage/' . $user->photo) : null,
                ];
            })
        ]);
    }

    /** UPDATE USER */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'nullable|string|max:100',
            'email'    => 'nullable|email|unique:users,email,' . $id,
            'photo'    => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'password' => 'nullable|min:6',
            'role'     => 'nullable|in:contractor,surveyor,finance,owner,managerial',
            'status'   => 'nullable|in:active,inactive'
        ]);

        if ($request->hasFile('photo')) {
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }

            $user->photo = $request->file('photo')->store('users', 'public');
        }

        $user->update([
            'name'     => $request->name ?? $user->name,
            'email'    => $request->email ?? $user->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
            'status'   => $request->status ?? $user->status
        ]);

        if ($request->role) {
            $role = Role::firstOrCreate(['name' => $request->role]);
            $user->syncRoles($role);
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $user,
            'role'    => $user->roles->pluck('name')->first(),
            'photo_url' => $user->photo ? asset('storage/' . $user->photo) : null
        ]);
    }

    /** DELETE USER */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->photo && Storage::disk('public')->exists($user->photo)) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ], 200);
    }
}
