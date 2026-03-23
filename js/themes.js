/* ======================================================
   themes.js — Theme presets
   
   Each theme controls shader uniforms for a distinct look.
   ====================================================== */

export const themes = {
  neonCyberpunk: {
    name: 'Neon Cyberpunk',
    color1: [0.0, 1.0, 1.0],        // cyan
    color2: [1.0, 0.0, 1.0],        // magenta
    bgColor: [0.0, 0.02, 0.06],     // deep dark blue
    glowIntensity: 1.6,
    distortion: 0.35,
    colorShiftSpeed: 0.3,
    fractalDepth: 0.5,
    waveIntensity: 0.6,
    twistAmount: 0.7,
    particleIntensity: 0.65,
    chaosAmount: 0.55,
  },

  psychedelicRainbow: {
    name: 'Psychedelic Rainbow',
    color1: [1.0, 0.2, 0.5],        // hot pink
    color2: [0.2, 1.0, 0.5],        // lime green
    bgColor: [0.04, 0.0, 0.06],     // dark purple
    glowIntensity: 2.0,
    distortion: 0.6,
    colorShiftSpeed: 1.5,
    fractalDepth: 0.8,
    waveIntensity: 0.82,
    twistAmount: 0.9,
    particleIntensity: 0.75,
    chaosAmount: 0.8,
  },

  darkIndustrial: {
    name: 'Dark Industrial',
    color1: [1.0, 0.15, 0.0],       // red-orange
    color2: [1.0, 0.4, 0.0],        // orange
    bgColor: [0.03, 0.0, 0.0],      // near black red
    glowIntensity: 1.2,
    distortion: 0.2,
    colorShiftSpeed: 0.1,
    fractalDepth: 0.3,
    waveIntensity: 0.35,
    twistAmount: 0.5,
    particleIntensity: 0.45,
    chaosAmount: 0.35,
  },

  galaxyWarp: {
    name: 'Galaxy Warp',
    color1: [0.5, 0.3, 1.0],        // violet
    color2: [0.0, 0.7, 1.0],        // sky blue
    bgColor: [0.01, 0.0, 0.04],     // deep space
    glowIntensity: 1.8,
    distortion: 0.5,
    colorShiftSpeed: 0.6,
    fractalDepth: 0.7,
    waveIntensity: 0.75,
    twistAmount: 0.78,
    particleIntensity: 0.68,
    chaosAmount: 0.62,
  },
};

/** Linearly interpolate all theme numeric values. */
export function lerpTheme(current, target, t) {
  const result = {};
  for (const key of Object.keys(target)) {
    if (key === 'name') { result[key] = target[key]; continue; }
    if (Array.isArray(target[key])) {
      // Lerp array (colors)
      result[key] = target[key].map((v, i) => {
        const from = current[key]?.[i] ?? v;
        return from + (v - from) * t;
      });
    } else if (typeof target[key] === 'number') {
      const from = current[key] ?? target[key];
      result[key] = from + (target[key] - from) * t;
    } else {
      result[key] = target[key];
    }
  }
  return result;
}

/** Get a random theme key. */
export function getRandomThemeKey() {
  const keys = Object.keys(themes);
  return keys[Math.floor(Math.random() * keys.length)];
}
