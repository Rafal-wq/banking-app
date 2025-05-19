<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TransactionNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The transaction instance.
     *
     * @var \App\Models\Transaction
     */
    public $transaction;

    /**
     * Whether the transaction is outgoing from the user's perspective.
     *
     * @var bool
     */
    public $isOutgoing;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\Transaction  $transaction
     * @param  bool  $isOutgoing
     * @return void
     */
    public function __construct(Transaction $transaction, bool $isOutgoing)
    {
        $this->transaction = $transaction;
        $this->isOutgoing = $isOutgoing;
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope()
    {
        return new Envelope(
            subject: $this->isOutgoing ?
                'Potwierdzenie przelewu wychodzącego' :
                'Potwierdzenie przelewu przychodzącego',
        );
    }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        return new Content(
            view: 'emails.transaction',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array
     */
    public function attachments()
    {
        return [];
    }
}
