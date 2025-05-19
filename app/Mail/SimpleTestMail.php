<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SimpleTestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct()
    {
        //
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Simple Test Email',
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.simple-test',
        );
    }

    public function attachments()
    {
        return [];
    }

    // Dla starszych wersji Laravel
    public function build()
    {
        return $this->subject('Simple Test Email')
            ->view('emails.simple-test');
    }
}
