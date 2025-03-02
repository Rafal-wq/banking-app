<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Transaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'completed', 'failed'];
        $titles = [
            'Salary Payment', 'Rent', 'Utilities', 'Grocery', 'Online Purchase',
            'Transfer', 'Investment', 'Insurance', 'Subscription', 'Other'
        ];

        return [
            'from_account_id' => BankAccount::factory(),
            'to_account_id' => BankAccount::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'title' => $this->faker->randomElement($titles),
            'description' => $this->faker->optional(0.7)->sentence(),
            'status' => $this->faker->randomElement($statuses),
            'executed_at' => $this->faker->optional(0.8)->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the transaction is completed.
     */
    public function completed(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'executed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            ];
        });
    }

    /**
     * Indicate that the transaction is pending.
     */
    public function pending(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'executed_at' => null,
            ];
        });
    }

    /**
     * Indicate that the transaction failed.
     */
    public function failed(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'failed',
                'executed_at' => null,
            ];
        });
    }
}
