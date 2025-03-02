<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BankAccount;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // Create a few more users
        $users = User::factory(3)->create();
        $users->push($testUser); // Add test user to the collection

        // Create bank accounts for each user
        $allAccounts = new Collection();

        foreach ($users as $user) {
            // Create 2-3 bank accounts for each user
            for ($i = 0; $i < rand(2, 3); $i++) {
                $account = BankAccount::factory()->create([
                    'user_id' => $user->id,
                ]);
                $allAccounts->push($account);
            }

            // Create one primary PLN account with higher balance
            $primaryAccount = BankAccount::factory()->create([
                'user_id' => $user->id,
                'name' => 'Primary Account',
                'currency' => 'PLN',
                'balance' => 5000.00,
            ]);

            $allAccounts->push($primaryAccount);
        }

        // Create transactions between accounts (only if we have enough accounts)
        if ($allAccounts->count() >= 2) {
            foreach ($allAccounts as $fromAccount) {
                // Create 1-3 outgoing transactions for each account
                $numTransactions = rand(1, 3);

                for ($i = 0; $i < $numTransactions; $i++) {
                    // Select a random destination account different from the source
                    $potentialAccounts = $allAccounts->where('id', '!=', $fromAccount->id);

                    if ($potentialAccounts->count() > 0) {
                        $toAccount = $potentialAccounts->random();

                        // Create a transaction
                        $amount = rand(10, 100) + (rand(0, 99) / 100); // Random amount between 10.00 and 100.99

                        // Ensure the amount doesn't exceed the account balance
                        $amount = min($amount, $fromAccount->balance);

                        if ($amount > 0) {
                            $transaction = Transaction::create([
                                'from_account_id' => $fromAccount->id,
                                'to_account_id' => $toAccount->id,
                                'amount' => $amount,
                                'title' => 'Sample Transaction',
                                'description' => 'This is a sample transaction created by seeder',
                                'status' => 'pending',
                            ]);

                            // Execute the transaction
                            $transaction->execute();
                        }
                    }
                }
            }
        }

        // Get test user accounts directly without using the relationship
        $testUserAccounts = BankAccount::where('user_id', $testUser->id)->get();

        if ($testUserAccounts->count() > 0) {
            $testAccount = $testUserAccounts->first();

            // Ensure the test account has sufficient balance for testing
            if ($testAccount->balance < 1000) {
                $testAccount->balance = 1000;
                $testAccount->save();
            }

            // Get all accounts except the test user's accounts
            $otherAccounts = $allAccounts->whereNotIn('id', $testUserAccounts->pluck('id'));

            // Create a few pending transactions if there are other accounts
            if ($otherAccounts->count() > 0) {
                for ($i = 0; $i < min(3, $otherAccounts->count()); $i++) {
                    // Get a random account from other accounts
                    $toAccount = $otherAccounts->random();

                    Transaction::create([
                        'from_account_id' => $testAccount->id,
                        'to_account_id' => $toAccount->id,
                        'amount' => 50.00,
                        'title' => 'Pending Transaction ' . ($i + 1),
                        'description' => 'This is a pending transaction for testing',
                        'status' => 'pending',
                    ]);
                }
            }
        }
    }
}
