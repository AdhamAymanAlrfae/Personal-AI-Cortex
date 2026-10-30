'use client';

export default function WebGLFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Neural Network Connection Lines */}
        <g stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6">
          <line x1="200" y1="150" x2="380" y2="280" />
          <line x1="380" y1="280" x2="620" y2="220" />
          <line x1="620" y1="220" x2="800" y2="350" />
          <line x1="380" y1="280" x2="450" y2="480" />
          <line x1="620" y1="220" x2="720" y2="450" />
          <line x1="450" y1="480" x2="720" y2="450" />
          <line x1="200" y1="150" x2="250" y2="390" />
          <line x1="250" y1="390" x2="450" y2="480" />
          <line x1="620" y1="220" x2="850" y2="180" />
          <line x1="720" y1="450" x2="800" y2="350" />
        </g>

        {/* Synaptic Nodes */}
        <g>
          {[
            { cx: 200, cy: 150, r: 5, color: '#06b6d4' },
            { cx: 380, cy: 280, r: 7, color: '#8b5cf6' },
            { cx: 620, cy: 220, r: 6, color: '#06b6d4' },
            { cx: 800, cy: 350, r: 8, color: '#10b981' },
            { cx: 450, cy: 480, r: 6, color: '#06b6d4' },
            { cx: 720, cy: 450, r: 7, color: '#8b5cf6' },
            { cx: 250, cy: 390, r: 4, color: '#10b981' },
            { cx: 850, cy: 180, r: 5, color: '#06b6d4' },
          ].map((node, i) => (
            <g key={i}>
              <circle cx={node.cx} cy={node.cy} r={node.r * 2.5} fill="url(#nodeGlow)" />
              <circle cx={node.cx} cy={node.cy} r={node.r} fill={node.color} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
