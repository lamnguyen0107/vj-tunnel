/* ======================================================
   themes.js — Theme presets
   
   Each theme controls shader uniforms for a distinct look.
   ====================================================== */

export const themes = {
  neonCyberpunk: {
    name: 'Neon Cyberpunk',
    color1: [0.0, 1.0, 0.8],        // Bright Cyan/Teal
    color2: [0.9, 0.0, 1.0],        // Vivid Magenta
    bgColor: [0.0, 0.01, 0.04],     // Deeper Blue
    glowIntensity: 1.45,            // Slightly reduced for less whiteout
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
    color1: [1.0, 0.0, 0.4],        // Deep Pink
    color2: [0.0, 1.0, 0.3],        // Vivid Lime
    bgColor: [0.03, 0.0, 0.05],     // Darkest Purple
    glowIntensity: 1.8,             // Reduced bloom
    distortion: 0.6,
    colorShiftSpeed: 1.2,
    fractalDepth: 0.8,
    waveIntensity: 0.82,
    twistAmount: 0.9,
    particleIntensity: 0.75,
    chaosAmount: 0.8,
  },

  lavaCore: {
    name: 'Lava Core',
    color1: [1.0, 0.1, 0.0],        // Pure Red
    color2: [1.0, 0.5, 0.0],        // Bright Orange
    bgColor: [0.02, 0.0, 0.0],      // Deep Red-Black
    glowIntensity: 1.5,
    distortion: 0.45,
    colorShiftSpeed: 0.25,
    fractalDepth: 0.65,
    waveIntensity: 0.7,
    twistAmount: 0.85,
    particleIntensity: 0.6,
    chaosAmount: 0.45,
  },

  deepOcean: {
    name: 'Deep Ocean',
    color1: [0.0, 0.3, 1.0],        // Oceanic Blue
    color2: [0.0, 1.0, 0.6],        // Seafoam Green
    bgColor: [0.0, 0.02, 0.03],     // Midnight Blue
    glowIntensity: 1.4,
    distortion: 0.3,
    colorShiftSpeed: 0.15,
    fractalDepth: 0.45,
    waveIntensity: 0.75,
    twistAmount: 0.6,
    particleIntensity: 0.55,
    chaosAmount: 0.3,
  },

  goldenEmerald: {
    name: 'Golden Emerald',
    color1: [1.0, 0.8, 0.0],        // Vivid Gold
    color2: [0.0, 1.0, 0.4],        // Lush Green
    bgColor: [0.01, 0.02, 0.0],     // Dark Moss
    glowIntensity: 1.6,
    distortion: 0.4,
    colorShiftSpeed: 0.4,
    fractalDepth: 0.55,
    waveIntensity: 0.65,
    twistAmount: 0.75,
    particleIntensity: 0.65,
    chaosAmount: 0.5,
  },

  acidTechno: {
    name: 'Acid Techno',
    color1: [0.7, 1.0, 0.0],        // Acid Green
    color2: [0.5, 0.0, 1.0],        // Electric Purple
    bgColor: [0.02, 0.0, 0.04],     // Dark Void
    glowIntensity: 1.7,
    distortion: 0.65,
    colorShiftSpeed: 0.8,
    fractalDepth: 0.75,
    waveIntensity: 0.9,
    twistAmount: 0.95,
    particleIntensity: 0.8,
    chaosAmount: 0.85,
  },

  sunsetHorizon: {
    name: 'Sunset Horizon',
    color1: [1.0, 0.4, 0.2],        // Coral Orange
    color2: [0.4, 0.2, 1.0],        // Royal Purple
    bgColor: [0.03, 0.01, 0.05],    // Dusk Black
    glowIntensity: 1.5,
    distortion: 0.3,
    colorShiftSpeed: 0.2,
    fractalDepth: 0.4,
    waveIntensity: 0.55,
    twistAmount: 0.65,
    particleIntensity: 0.6,
    chaosAmount: 0.4,
  },

  vintageVapor: {
    name: 'Vintage Vapor',
    color1: [1.0, 0.6, 0.8],        // Pastel Pink
    color2: [0.4, 0.8, 1.0],        // Sky Blue
    bgColor: [0.05, 0.04, 0.08],    // Dark Indigo
    glowIntensity: 1.3,
    distortion: 0.25,
    colorShiftSpeed: 0.1,
    fractalDepth: 0.3,
    waveIntensity: 0.4,
    twistAmount: 0.4,
    particleIntensity: 0.5,
    chaosAmount: 0.25,
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
