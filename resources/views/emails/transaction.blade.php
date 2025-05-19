<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $isOutgoing ? 'Potwierdzenie przelewu wychodzącego' : 'Potwierdzenie przelewu przychodzącego' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0047B3;
            padding: 20px;
            color: white;
            text-align: center;
        }
        .content {
            background-color: #f8f9fa;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .transaction-details {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .transaction-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .transaction-details th,
        .transaction-details td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .transaction-details th {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{ $isOutgoing ? 'Potwierdzenie przelewu wychodzącego' : 'Potwierdzenie przelewu przychodzącego' }}</h1>
    </div>

    <div class="content">
        <p>Szanowny Kliencie,</p>

        <p>
            {{ $isOutgoing
                ? 'Informujemy, że wykonano przelew wychodzący z Twojego konta.'
                : 'Informujemy o otrzymaniu przelewu na Twoje konto.'
            }}
        </p>

        <div class="transaction-details">
            <h2>Szczegóły transakcji</h2>

            <table>
                <tr>
                    <th>Data transakcji</th>
                    <td>{{ $transaction->executed_at ? date('d.m.Y H:i', strtotime($transaction->executed_at)) : date('d.m.Y H:i', strtotime($transaction->created_at)) }}</td>
                </tr>
                <tr>
                    <th>Tytuł</th>
                    <td>{{ $transaction->title }}</td>
                </tr>
                @if($transaction->description)
                    <tr>
                        <th>Opis</th>
                        <td>{{ $transaction->description }}</td>
                    </tr>
                @endif
                <tr>
                    <th>Kwota</th>
                    <td>
                        {{ number_format($transaction->amount, 2, ',', ' ') }}
                        {{ $transaction->fromAccount ? $transaction->fromAccount->currency : 'PLN' }}
                    </td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>
                        @if($transaction->status === 'completed')
                            Zrealizowana
                        @elseif($transaction->status === 'pending')
                            Oczekująca
                        @else
                            {{ ucfirst($transaction->status) }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <th>{{ $isOutgoing ? 'Odbiorca' : 'Nadawca' }}</th>
                    <td>
                        {{ $isOutgoing
                            ? ($transaction->toAccount->name ?? 'Brak danych')
                            : ($transaction->fromAccount->name ?? 'Brak danych')
                        }}
                    </td>
                </tr>
                <tr>
                    <th>Numer referencyjny</th>
                    <td>REF-{{ date('Ymd', strtotime($transaction->created_at)) }}-{{ $transaction->id }}</td>
                </tr>
            </table>
        </div>

        <p>Dziękujemy za korzystanie z naszych usług!</p>

        <p>Z poważaniem,<br>Zespół Bank App</p>
    </div>

    <div class="footer">
        <p>Ta wiadomość została wygenerowana automatycznie, prosimy na nią nie odpowiadać.</p>
        <p>© {{ date('Y') }} Bank App. Wszelkie prawa zastrzeżone.</p>
    </div>
</div>
</body>
</html>
