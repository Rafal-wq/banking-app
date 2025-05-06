export default function BankLogo({ className = 'h-10' }) {
    return (
        <svg className={className} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
            {/* Tło - prostokąt */}
            <rect x="0" y="45" width="200" height="4" fill="#0047B3" />

            {/* Budynek banku */}
            <g>
                {/* Dach banku */}
                <polygon points="60,15 110,15 85,5" fill="#0047B3" />

                {/* Tło budynku */}
                <rect x="65" y="15" width="40" height="30" fill="#0047B3" />

                {/* Kolumny banku */}
                <rect x="70" y="15" width="6" height="30" fill="#FFFFFF" />
                <rect x="82" y="15" width="6" height="30" fill="#FFFFFF" />
                <rect x="94" y="15" width="6" height="30" fill="#FFFFFF" />
            </g>

            {/* Symbol dolara w kółku - prawidłowa orientacja */}
            <circle cx="40" cy="25" r="10" fill="#0047B3" />
            <path d="M40,19 L40,31" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M43,21 C43,19.5 41.5,18 40,18 C38.5,18 37,19 37,21 C37,23 39,24 40,24 C41,24 43,25 43,27 C43,29 41.5,30 40,30 C38.5,30 37,28.5 37,27" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        </svg>
    );
}
