export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0052ff", "base-dark": "#0041cc",
        cyan: "#00d4ff", gold: "#f0b429", "gold-dark": "#d4940a",
        success: "#00c853", danger: "#ff3b3b",
        surface: "#12141a", "surface-2": "#1a1d27", "surface-3": "#22263a",
        bg: "#0a0b0f",
      },
      fontFamily: {
        display: ["Syne","sans-serif"],
        mono:    ["JetBrains Mono","monospace"],
        num:     ["Orbitron","monospace"],
      },
      animation: {
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up":   "slideUp 0.4s ease-out",
        "fade-in":    "fadeIn 0.3s ease-out",
        "float":      "float 3s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: { "0%,100%": { boxShadow: "0 0 5px #0052ff40" }, "50%": { boxShadow: "0 0 20px #0052ff80" } },
        slideUp:   { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float:     { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-6px)" } },
      },
      boxShadow: {
        "glow":      "0 0 20px rgba(0,82,255,0.4)",
        "glow-sm":   "0 0 10px rgba(0,82,255,0.3)",
        "glow-gold": "0 0 20px rgba(240,180,41,0.4)",
        "card":      "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
