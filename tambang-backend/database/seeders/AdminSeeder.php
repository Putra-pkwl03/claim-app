<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@system.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
            ]
        );

        $admin->assignRole('admin');
    }
}
