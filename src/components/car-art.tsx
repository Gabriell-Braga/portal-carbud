/**
 * Ilustração de carro do Figma ("Vehicle Art"), usada só quando o anúncio
 * não tem foto. Anúncio com foto sempre mostra a foto real.
 */
const PALETTES = [
  { body: "#b3101c", shade: "#8a0c16", bg: "from-brand-soft to-white" }, // cherry
  { body: "#3a3f47", shade: "#23272d", bg: "from-subtle to-white" }, // graphite
  { body: "#b8bec8", shade: "#8f96a1", bg: "from-subtle to-white" }, // silver
  { body: "#1b2333", shade: "#0e1420", bg: "from-subtle to-white" }, // midnight
];

function pick(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

export function CarArt({ seed, className = "" }: { seed: string; className?: string }) {
  const color = pick(seed);
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${color.bg} ${className}`}>
      <svg viewBox="0 0 240 100" className="w-3/4 max-w-[320px]" aria-hidden="true">
        <ellipse cx="120" cy="88" rx="100" ry="5" fill="#000" opacity="0.08" />
        <path
          d="M18 70c0-9 4-15 14-17l30-6 26-18c6-4 12-6 20-6h46c9 0 15 3 21 9l17 15 24 4c9 2 14 8 14 16v6c0 3-2 5-5 5H23c-3 0-5-2-5-5z"
          fill={color.body}
        />
        <path d="M96 31c4-3 8-4 13-4h18v20H74z" fill="#cfe0ee" />
        <path d="M133 27h17c6 0 10 2 14 6l13 14h-44z" fill="#cfe0ee" />
        <rect x="128" y="27" width="4" height="22" fill={color.shade} />
        <path d="M18 70h212v6c0 3-2 5-5 5H23c-3 0-5-2-5-5z" fill={color.shade} />
        <rect x="214" y="58" width="12" height="5" rx="2" fill="#f3c25a" />
        {[62, 184].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="78" r="17" fill="#1a1d22" />
            <circle cx={cx} cy="78" r="9" fill="#d5d9df" />
            <circle cx={cx} cy="78" r="3" fill="#1a1d22" />
          </g>
        ))}
      </svg>
    </div>
  );
}
