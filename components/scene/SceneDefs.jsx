// Gradients, filters and the clip that keeps the city inside the window.
// Referenced by id from the rest of the scene, so ids must stay in sync.
export default function SceneDefs() {
  return (
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#241a3c" />
        <stop offset="0.28" stopColor="#5b2f4c" />
        <stop offset="0.52" stopColor="#a8464a" />
        <stop offset="0.72" stopColor="#dd7443" />
        <stop offset="0.88" stopColor="#f5a860" />
        <stop offset="1" stopColor="#ffd79b" />
      </linearGradient>

      <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff6d8" stopOpacity="0.95" />
        <stop offset="0.35" stopColor="#ffcf8a" stopOpacity="0.55" />
        <stop offset="1" stopColor="#ff9a52" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#150f16" />
        <stop offset="0.6" stopColor="#241922" />
        <stop offset="1" stopColor="#1a121a" />
      </linearGradient>

      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a1d21" />
        <stop offset="1" stopColor="#0f0a0d" />
      </linearGradient>

      <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffce8f" stopOpacity="0.20" />
        <stop offset="1" stopColor="#ffb066" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="couch" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5c363c" />
        <stop offset="1" stopColor="#2b1a20" />
      </linearGradient>

      <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b1d33" />
        <stop offset="1" stopColor="#3d2436" />
      </linearGradient>

      <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffdba4" stopOpacity="0.85" />
        <stop offset="1" stopColor="#ffb066" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.72">
        <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
        <stop offset="1" stopColor="#06040a" stopOpacity="0.82" />
      </radialGradient>

      <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="softenSm" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" />
      </filter>

      <clipPath id="windowClip">
        <rect x="318" y="96" width="980" height="452" rx="10" />
      </clipPath>
    </defs>
  )
}
