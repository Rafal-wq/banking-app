<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankAccount extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'account_number',
        'name',
        'balance',
        'currency',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the bank account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the outgoing transactions for the bank account.
     */
    public function outgoingTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'from_account_id');
    }

    /**
     * Get the incoming transactions for the bank account.
     */
    public function incomingTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'to_account_id');
    }

    /**
     * Get all transactions for the bank account (both incoming and outgoing).
     */
    public function transactions()
    {
        return Transaction::where('from_account_id', $this->id)
            ->orWhere('to_account_id', $this->id);
    }

    /**
     * Generate a unique account number.
     */
    public static function generateAccountNumber(): string
    {
        $prefix = 'PL';
        $randomPart = mt_rand(10000000, 99999999) . mt_rand(10000000, 99999999);
        $accountNumber = $prefix . $randomPart;

        // Ensure uniqueness
        while (self::where('account_number', $accountNumber)->exists()) {
            $randomPart = mt_rand(10000000, 99999999) . mt_rand(10000000, 99999999);
            $accountNumber = $prefix . $randomPart;
        }

        return $accountNumber;
    }

    /**
     * Deposit money into the account.
     */
    public function deposit(float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $this->balance = $this->balance + $amount;
        return $this->save();
    }

    /**
     * Withdraw money from the account.
     */
    public function withdraw(float $amount): bool
    {
        if ($amount <= 0 || $this->balance < $amount) {
            return false;
        }

        $this->balance = $this->balance - $amount;
        return $this->save();
    }
}
