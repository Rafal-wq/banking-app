<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BankAccountFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BankAccount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $currencies = ['PLN', 'EUR', 'USD', 'GBP'];

        return [
            'user_id' => User::factory(),
            'account_number' => 'PL' . $this->faker->numerify('################'),
            'name' => $this->faker->randomElement(['Personal', 'Savings', 'Business', 'Investment', 'Holiday']) . ' Account',
            'balance' => $this->faker->randomFloat(2, 100, 10000),
            'currency' => $this->faker->randomElement($currencies),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the account is inactive.
     */
    public function inactive(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Indicate that the account has a specific balance.
     */
    public function withBalance(float $balance): self
    {
        return $this->state(function (array $attributes) use ($balance) {
            return [
                'balance' => $balance,
            ];
        });
    }

    /**
     * Indicate that the account has a specific currency.
     */
    public function withCurrency(string $currency): self
    {
        return $this->state(function (array $attributes) use ($currency) {
            return [
                'currency' => $currency,
            ];
        });
    }
}
