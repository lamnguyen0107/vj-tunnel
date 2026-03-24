/* ======================================================
   main.js — Application entry point
   
   Orchestrates renderer, audio, UI, and theme transitions.
   Single fullscreen fragment shader — all visuals in GPU.
   ====================================================== */

import { TunnelRenderer } from './renderer.js';
import { AudioAnalyzer } from './audio.js';
import { UIController } from './ui.js';
import { themes, lerpTheme, getRandomThemeKey } from './themes.js';

const isMobileViewport = window.matchMedia('(max-width: 900px)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const isMobile = isMobileViewport || isCoarsePointer;

// ---- State ----
const state = {
  time: 0,
  speed: 0.5,
  sensitivity: 1.0,
  kaleidoscope: 0.5,
  kaleidoscopeMode: 0,
  kaleidoscopeModePrevious: 0,
  kaleidoscopeSwitchTime: 0,
  cooldownMs: 650,
  kaleidoscopeAutoMode: true,
  kaleidoscopeAngle: 0,
  kaleidoscopeFlash: 0,
  livePreset: 'drop',
  objectEnabled: true,
  cloneCount: 5,
  cloneFreeFly: false,
  objectGap: 0.28,
  objectSize: 0.30,
  objectRotation: { x: 0, y: 0, z: 0 },
  quality: isMobile ? 0.82 : 1.0,
  fpsEstimate: 60,
  colorMode: 'theme', // Default to theme mode for color sync

  // Current interpolated theme
  current: { ...themes.neonCyberpunk },
  target:  { ...themes.neonCyberpunk },
  transitionProgress: 1.0,
  customColors: {
    color1: [...themes.neonCyberpunk.color1],
    color2: [...themes.neonCyberpunk.color2],
    bgColor: [...themes.neonCyberpunk.bgColor],
  },
};

const livePresets = {
  drop: {
    speed: 0.62,
    kaleidoscope: 0.72,
    distortion: 0.65,
    glowIntensity: 2.05,
    colorShiftSpeed: 1.35,
    fractalDepth: 0.86,
    waveIntensity: 0.93,
    twistAmount: 0.92,
    particleIntensity: 0.84,
    chaosAmount: 0.82,
  },
  breakdown: {
    speed: 0.28,
    kaleidoscope: 0.42,
    distortion: 0.28,
    glowIntensity: 1.32,
    colorShiftSpeed: 0.45,
    fractalDepth: 0.52,
    waveIntensity: 0.68,
    twistAmount: 0.58,
    particleIntensity: 0.58,
    chaosAmount: 0.36,
  },
  buildUp: {
    speed: 0.48,
    kaleidoscope: 0.64,
    distortion: 0.54,
    glowIntensity: 1.82,
    colorShiftSpeed: 1.05,
    fractalDepth: 0.78,
    waveIntensity: 0.84,
    twistAmount: 0.8,
    particleIntensity: 0.74,
    chaosAmount: 0.66,
  },
};

function hexToRgbArray(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function rgbArrayToHex(rgb) {
  return '#' + rgb.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

// ---- Initialize ----
const canvas = document.getElementById('glcanvas');
const renderer = new TunnelRenderer(canvas);
const audio = new AudioAnalyzer();

// ---- UI ----
const ui = new UIController({
  onFileLoad: async (file) => { await audio.loadFile(file); },
  onModelLoad: async (file) => {
    await renderer.loadObjectFile(file);
    renderer.setCloneOptions(state.cloneCount, state.cloneFreeFly);
  },
  onObjectToggle: (enabled) => { 
    state.objectEnabled = Boolean(enabled); 
    console.log('Main current objectEnabled state:', state.objectEnabled);
  },
  onObjectSizeChange: (sizeNorm) => {
    state.objectSize = Math.max(0.02, Math.min(0.6, Number(sizeNorm) || 0.3));
    renderer.setObjectScale(state.objectSize);
  },
  onObjectRotXChange: (deg) => {
    state.objectRotation.x = Math.max(-180, Math.min(180, Number(deg) || 0));
    renderer.setObjectRotation(state.objectRotation.x, state.objectRotation.y, state.objectRotation.z);
  },
  onObjectRotYChange: (deg) => {
    state.objectRotation.y = Math.max(-180, Math.min(180, Number(deg) || 0));
    renderer.setObjectRotation(state.objectRotation.x, state.objectRotation.y, state.objectRotation.z);
  },
  onObjectRotZChange: (deg) => {
    state.objectRotation.z = Math.max(-180, Math.min(180, Number(deg) || 0));
    renderer.setObjectRotation(state.objectRotation.x, state.objectRotation.y, state.objectRotation.z);
  },
  onCloneCountChange: (count) => {
    state.cloneCount = Math.max(1, Math.min(10, Number(count) || 6));
    renderer.setCloneOptions(state.cloneCount, state.cloneFreeFly);
  },
  onCloneFreeFlyChange: (enabled) => {
    state.cloneFreeFly = Boolean(enabled);
    renderer.setCloneOptions(state.cloneCount, state.cloneFreeFly);
  },
  onPlayPause: (play) => { play ? audio.play() : audio.pause(); },
  onVolumeChange: (v) => { audio.setVolume(v); },
  onSpeedChange: (v) => { state.speed = v; },
  onSensitivityChange: (v) => {
    state.sensitivity = v;
    audio.setSensitivity(v);
  },
  onObjectGapChange: (v) => { 
    state.objectGap = v; 
    renderer.setObjectGap(v);
  },
  onKaleidoscopeChange: (v) => { state.kaleidoscope = v; },
  onCooldownChange: (v) => { state.cooldownMs = v; },
  onKaleidoscopeModeChange: (m) => { 
    if (state.kaleidoscopeMode !== m) {
      state.kaleidoscopeModePrevious = state.kaleidoscopeMode;
      state.kaleidoscopeSwitchTime = state.time;
      state.kaleidoscopeMode = m; 
      state.lastMixTime = state.time;
    }
  },
  onKaleidoscopeAutoModeChange: (b) => { state.kaleidoscopeAutoMode = b; },
  onWaveChange: (v) => {
    state.current.waveIntensity = v;
    state.target.waveIntensity = v;
  },
  onTwistChange: (v) => {
    state.current.twistAmount = v;
    state.target.twistAmount = v;
  },
  onParticleChange: (v) => {
    state.current.particleIntensity = v;
    state.target.particleIntensity = v;
  },
  onObjectBoostChange: () => {},
  onChaosChange: (v) => {
    state.current.chaosAmount = v;
    state.target.chaosAmount = v;
  },
  onAutoMixChange: () => {},
  onObjectEnabledChange: (enabled) => { state.objectEnabled = Boolean(enabled); },
  onParticleShapeChange: () => {},
  onObjectDistanceChange: () => {},
  onPrimaryColorChange: (hex) => {
    state.customColors.color1 = hexToRgbArray(hex);
    state.colorMode = 'custom';
  },
  onSecondaryColorChange: (hex) => {
    state.customColors.color2 = hexToRgbArray(hex);
    state.colorMode = 'custom';
  },
  onBgColorChange: (hex) => {
    state.customColors.bgColor = hexToRgbArray(hex);
    state.colorMode = 'custom';
  },
  onObjectColorChange: () => {},
  onObjectColorModeChange: () => {},
  onColorModeChange: (mode) => {
    state.colorMode = mode === 'custom' ? 'custom' : 'theme';
    ui.setColorMode(state.colorMode);
    if (state.colorMode === 'theme') {
      ui.setPrimaryColor(rgbArrayToHex(state.current.color1));
      ui.setSecondaryColor(rgbArrayToHex(state.current.color2));
      ui.setBackgroundColor(rgbArrayToHex(state.current.bgColor));
    } else {
      ui.setPrimaryColor(rgbArrayToHex(state.customColors.color1));
      ui.setSecondaryColor(rgbArrayToHex(state.customColors.color2));
      ui.setBackgroundColor(rgbArrayToHex(state.customColors.bgColor));
    }
  },
  onLivePresetChange: (presetKey) => {
    applyLivePreset(presetKey);
  },
  onThemeChange: (key) => { switchTheme(key); },
  onRandomize: () => {
    const key = getRandomThemeKey();
    ui.setTheme(key);
    switchTheme(key);
  },
});

ui.setTunnelControls({
  wave: state.current.waveIntensity ?? 0.6,
  twist: state.current.twistAmount ?? 0.7,
  chaos: state.current.chaosAmount ?? 0.55,
});
ui.setCoreControls({
  speed: state.speed,
  kaleidoscope: state.kaleidoscope,
});
ui.setLivePreset(state.livePreset);
ui.setColorMode(state.colorMode);
ui.setObjectToggle(state.objectEnabled);
ui.setObjectSize(state.objectSize);
ui.setCloneCount(state.cloneCount);
ui.setCloneFreeFly(state.cloneFreeFly);
ui.setObjectGap(state.objectGap);
renderer.setObjectGap(state.objectGap);
ui.setPrimaryColor(rgbArrayToHex(state.customColors.color1));
ui.setSecondaryColor(rgbArrayToHex(state.customColors.color2));
ui.setBackgroundColor(rgbArrayToHex(state.customColors.bgColor));
state.current.waveIntensity = 0.5;
state.target.waveIntensity = 0.5;
state.current.twistAmount = 0.5;
state.target.twistAmount = 0.5;
state.current.chaosAmount = 0.5;
state.target.chaosAmount = 0.5;
state.current.distortion = 0.5;
state.target.distortion = 0.5;
state.current.glowIntensity = 1.5;
state.target.glowIntensity = 1.5;
state.current.colorShiftSpeed = 0.7;
state.target.colorShiftSpeed = 0.7;
state.current.fractalDepth = 0.5;
state.target.fractalDepth = 0.5;
ui.setTunnelControls({ wave: 0.5, twist: 0.5, chaos: 0.5 });
ui.setKaleidoscopeMode(state.kaleidoscopeMode);
ui.setKaleidoscopeAutoMode(state.kaleidoscopeAutoMode);
renderer.setCloneOptions(state.cloneCount, state.cloneFreeFly);
renderer.setObjectScale(state.objectSize);
renderer.setObjectRotation(state.objectRotation.x, state.objectRotation.y, state.objectRotation.z);
renderer.loadObjectUrl('./assets/cyber_core.glb').then(() => {
  renderer.setCloneOptions(state.cloneCount, state.cloneFreeFly);
  renderer.setObjectScale(state.objectSize);
  renderer.setObjectRotation(state.objectRotation.x, state.objectRotation.y, state.objectRotation.z);
}).catch(() => {
  // Keep built-in default object if the local model is unavailable.
});

// ---- Theme switching ----
function switchTheme(key) {
  const t = themes[key];
  if (!t) return;
  
  state.colorMode = 'theme'; // Reset to theme mode
  state.target = { ...t };
  state.transitionProgress = 0;

  // Sync color pickers with new theme colors immediately
  ui.setPrimaryColor(rgbArrayToHex(t.color1));
  ui.setSecondaryColor(rgbArrayToHex(t.color2));
  ui.setBackgroundColor(rgbArrayToHex(t.bgColor));

  ui.setTunnelControls({
    wave: t.waveIntensity ?? 0.6,
    twist: t.twistAmount ?? 0.7,
    chaos: t.chaosAmount ?? 0.55,
  });
}

function applyLivePreset(presetKey) {
  const preset = livePresets[presetKey];
  if (!preset) return;

  state.livePreset = presetKey;
  state.speed = preset.speed;
  state.kaleidoscope = preset.kaleidoscope;

  state.current.distortion = preset.distortion;
  state.current.glowIntensity = preset.glowIntensity;
  state.current.colorShiftSpeed = preset.colorShiftSpeed;
  state.current.fractalDepth = preset.fractalDepth;
  state.current.waveIntensity = preset.waveIntensity;
  state.current.twistAmount = preset.twistAmount;
  state.current.particleIntensity = preset.particleIntensity;
  state.current.chaosAmount = preset.chaosAmount;

  state.target.distortion = preset.distortion;
  state.target.glowIntensity = preset.glowIntensity;
  state.target.colorShiftSpeed = preset.colorShiftSpeed;
  state.target.fractalDepth = preset.fractalDepth;
  state.target.waveIntensity = preset.waveIntensity;
  state.target.twistAmount = preset.twistAmount;
  state.target.particleIntensity = preset.particleIntensity;
  state.target.chaosAmount = preset.chaosAmount;

  ui.setTunnelControls({
    wave: preset.waveIntensity,
    twist: preset.twistAmount,
    chaos: preset.chaosAmount,
  });
  ui.setCoreControls({
    speed: preset.speed,
    kaleidoscope: preset.kaleidoscope,
  });
  ui.setLivePreset(presetKey);
}

// ---- Easing ----
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// ---- Render Loop ----
const clock = { last: performance.now(), delta: 0 };

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  clock.delta = Math.min((now - clock.last) / 1000, 0.1); // cap at 100ms
  clock.last = now;
  state.time += clock.delta;
  const instantFps = 1.0 / Math.max(clock.delta, 0.0001);
  state.fpsEstimate += (instantFps - state.fpsEstimate) * 0.08;

  // Adaptive quality controller targeting 60 FPS
  if (state.fpsEstimate < 58) {
    state.quality = Math.max(isMobile ? 0.28 : 0.35, state.quality - clock.delta * 0.45);
  } else if (state.fpsEstimate > 62) {
    state.quality = Math.min(isMobile ? 0.9 : 1.0, state.quality + clock.delta * 0.2);
  }

  // Audio analysis
  audio.update();

  // Theme transition
  if (state.transitionProgress < 1.0) {
    state.transitionProgress = Math.min(state.transitionProgress + clock.delta * 1.5, 1.0);
    const t = easeInOutCubic(state.transitionProgress);
    state.current = lerpTheme(state.current, state.target, t);
  }

  // Render the fullscreen shader
  const activeColors = state.colorMode === 'custom'
    ? state.customColors
    : {
      color1: state.current.color1,
      color2: state.current.color2,
      bgColor: state.current.bgColor,
    };

  // Audio-synced modulation layer: sliders remain base values.
  const bassN = Math.pow(clamp01(audio.bass), 1.55);
  const midN = Math.pow(clamp01(audio.mid), 1.3);
  const highN = Math.pow(clamp01(audio.high), 1.25);

  const reactiveWave = clamp01(
    (state.current.waveIntensity ?? 0.6) *
    (0.85 + bassN * 0.25 + midN * 0.22) // Reduced multipliers from 0.42/0.36
  );
  const reactiveTwist = clamp01(
    (state.current.twistAmount ?? 0.7) *
    (0.8 + bassN * 0.35 + midN * 0.25) // Reduced multipliers from 0.56/0.34
  );
  const reactiveChaos = clamp01(
    (state.current.chaosAmount ?? 0.55) *
    (0.65 + midN * 0.8 + highN * 0.42)
  );
  const reactiveDistortion = clamp01(
    (state.current.distortion ?? 0.8) *
    (1.0 + midN * 0.5 + highN * 0.4)
  );

  const isMusicReactive = Boolean(audio.buffer);
  const jump = Math.pow(clamp01(audio.bass), 1.55);
  const autoSpeed = isMusicReactive
    ? clamp01(state.speed * (0.88 + jump * 0.45) + jump * 0.08) // Reduced 'jump' impact
    : state.speed;
  const autoKaleidoscope = isMusicReactive
    ? clamp01(state.kaleidoscope * (0.86 + midN * 0.55) + highN * 0.22)
    : state.kaleidoscope;

  // Auto Mix logic - sync with music pitch/frequency!
  if (state.kaleidoscopeAutoMode) {
    // Continually rotate slightly, speeding up heavily on beats
    state.kaleidoscopeAngle += clock.delta * (0.05 + jump * 0.45);
    
    if (!state.lastMixTime) state.lastMixTime = state.time;
    
    // Logic: If there is a noticeable jump (beat)
    const timeSinceLast = (state.time - state.lastMixTime) * 1000.0;
    const isBeat = jump > 0.6; 
    
    if (isBeat && timeSinceLast > state.cooldownMs) {
       // Pick any of the 10 modes randomly to see all effects
       let targetMode = Math.floor(Math.random() * 10);
       
       if (targetMode === state.kaleidoscopeMode) {
         targetMode = (targetMode + 1) % 10;
       }
       
       state.kaleidoscopeModePrevious = state.kaleidoscopeMode;
       state.kaleidoscopeSwitchTime = state.time;
       state.kaleidoscopeMode = targetMode;
       state.lastMixTime = state.time;
       state.kaleidoscopeFlash = 0.8 + jump * 0.4; // Flash follows beat intensity
       if (ui && ui.setKaleidoscopeMode) ui.setKaleidoscopeMode(state.kaleidoscopeMode);
    }
  }

  // Decay the flash value over time
  state.kaleidoscopeFlash = Math.max(0, state.kaleidoscopeFlash - clock.delta * 2.5);

  let kFade = (state.time - (state.kaleidoscopeSwitchTime || 0)) / 0.15; // 150ms crossfade
  kFade = clamp01(kFade);

  if (isMusicReactive) {
    ui.setCoreControls({
      speed: autoSpeed,
      kaleidoscope: autoKaleidoscope,
    });
    ui.setTunnelControls({
      wave: reactiveWave,
      twist: reactiveTwist,
      chaos: reactiveChaos,
    });
  }

  renderer.render(state.time, {
    bass: audio.bass,
    mid:  audio.mid,
    high: audio.high,
  }, {
    speed:           autoSpeed,
    kaleidoscope:    autoKaleidoscope,
    kaleidoscopeMode: state.kaleidoscopeMode,
    kaleidoscopeModePrevious: state.kaleidoscopeModePrevious,
    kaleidoscopeAngle: state.kaleidoscopeAngle,
    kaleidoscopeFlash: state.kaleidoscopeFlash,
    kaleidoscopeFade: kFade,
    distortion:      reactiveDistortion,
    glowIntensity:   state.current.glowIntensity,
    colorShiftSpeed: state.current.colorShiftSpeed,
    fractalDepth:    state.current.fractalDepth,
    waveIntensity:   reactiveWave,
    twistAmount:     reactiveTwist,
    chaosAmount:     reactiveChaos,
    objectEnabled:   state.objectEnabled,
    quality:         state.quality,
    color1:          activeColors.color1,
    color2:          activeColors.color2,
    bgColor:         activeColors.bgColor,
  });

  // UI updates
  if (typeof ui.drawVisualizer === 'function' && ui.els && ui.els.visualizerCanvas) {
    ui.drawVisualizer(audio.getFrequencyData());
  }
  ui.updateFPS();
}

animate();
