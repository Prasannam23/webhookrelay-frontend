/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0D10',        // near-black console background
        panel: '#12161B',       // card/panel surface
        panelAlt: '#171C22',    // solid secondary surface (replaces translucent overlays)
        border: '#20272E',      // hairline borders
        borderStrong: '#2C343C',
        muted: '#6E7A85',       // secondary text
        mutedDim: '#4A545C',    // solid dim text (replaces text-muted/60 etc)
        ink: '#E7ECEF',         // primary text
        overlay: '#05070A',     // solid modal backdrop (replaces bg-black/70)
        signal: {
          DEFAULT: '#FFB000',   // phosphor amber — the "live" accent
          dim: '#8A5E00',
          muted: '#2E2408',     // solid dark-amber fill (replaces bg-signal/10)
        },
        ok: '#33D6A6',
        okMuted: '#0F2A22',
        warn: '#FFB000',
        dead: '#FF5D5D',
        deadMuted: '#2E1414',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Solid offset shadow, no blur, no alpha — a hard-edged console/terminal
        // signature instead of a soft translucent glow.
        hard: '4px 4px 0 0 #FFB000',
        hardSm: '2px 2px 0 0 #FFB000',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '80%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        scan: {
          '0%': { left: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { left: '100%', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
      },
    },
  },
  plugins: [],
};
