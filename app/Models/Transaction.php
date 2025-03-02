<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'from_account_id',
        'to_account_id',
        'amount',
        'title',
        'description',
        'status',
        'executed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'executed_at' => 'datetime',
    ];

    /**
     * Get the source account for the transaction.
     */
    public function fromAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'from_account_id');
    }

    /**
     * Get the destination account for the transaction.
     */
    public function toAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'to_account_id');
    }

    /**
     * Execute the transaction by transferring the amount from the source account to the destination account.
     */
    public function execute(): bool
    {
        // Checking if transaction is already executed or failed
        if ($this->status !== 'pending') {
            return false;
        }

        $fromAccount = $this->fromAccount;
        $toAccount = $this->toAccount;

        if (!$fromAccount || !$toAccount || !$fromAccount->is_active || !$toAccount->is_active) {
            $this->status = 'failed';
            $this->save();
            return false;
        }

        // Check if the source account has enough balance
        if ($fromAccount->balance < $this->amount) {
            $this->status = 'failed';
            $this->save();
            return false;
        }

        \DB::beginTransaction();

        try {
            $withdrawSuccess = $fromAccount->withdraw($this->amount);

            $depositSuccess = $toAccount->deposit($this->amount);

            if ($withdrawSuccess && $depositSuccess) {
                $this->status = 'completed';
                $this->executed_at = now();
                $this->save();

                \DB::commit();
                return true;
            } else {
                \DB::rollBack();
                $this->status = 'failed';
                $this->save();
                return false;
            }
        } catch (\Exception $e) {
            \DB::rollBack();
            $this->status = 'failed';
            $this->save();
            return false;
        }
    }
}
