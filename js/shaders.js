/* ======================================================
   shaders.js — Tunnel-only optimized shader
   ====================================================== */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;

  uniform float uKaleidoscope;
  uniform float uKaleidoscopeMode;
  uniform float uKaleidoscopeModePrevious;
  uniform float uKaleidoscopeAngle;
  uniform float uKaleidoscopeFlash;
  uniform float uKaleidoscopeFade;
  uniform float uDistortion;
  uniform float uGlowIntensity;

  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uBgColor;

  uniform vec2 uMouse;
  uniform vec2 uResolution;

  uniform float uColorShiftSpeed;
  uniform float uFractalDepth;
  uniform float uWaveIntensity;
  uniform float uTwistAmount;
  uniform float uChaosAmount;
  uniform float uQuality;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    float c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
    return (rgb - 0.5) * c + hsl.z;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  vec2 rotate2d(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c) * p;
  }

  vec2 kaleidoscope(vec2 uv, float segments, float mode, float angleOffset) {
    if (mode < 0.5) {
      // Mode 0: Radial (Standard)
      // Ensure segments is an integer to avoid broken UV wrap seams
      float s = max(1.0, floor(segments + 0.5));
      float angle = atan(uv.y, uv.x) + angleOffset;
      float radius = length(uv);
      float segAngle = TAU / s;
      
      // Add TAU * 10.0 to prevent negative angle mod bugs in WebGL/Windows D3D
      angle = mod(angle + TAU * 10.0, segAngle);
      angle = abs(angle - segAngle * 0.5);
      
      return vec2(cos(angle), sin(angle)) * radius;
    } else if (mode < 1.5) {
      // Mode 1: Mirror
      uv = rotate2d(uv, angleOffset);
      uv = abs(uv);
      for(int i=0; i<3; i++) {
        if (float(i) >= segments * 0.3) break;
        uv = abs(uv - 0.5);
        if (uv.x < uv.y) uv = uv.yx;
      }
      return uv;
    } else if (mode < 2.5) {
      // Mode 2: Triangle
      uv = rotate2d(uv, angleOffset);
      float s = 0.866025; // sqrt(3)/2
      uv = abs(uv);
      vec2 p = vec2(uv.x - s * uv.y, uv.y);
      p = mod(p + 1.0, 2.0) - 1.0;
      return abs(p);
    } else if (mode < 3.5) {
      // Mode 3: Spiral
      float radius = length(uv);
      float angle = atan(uv.y, uv.x) + angleOffset + radius * segments * 0.5;
      float segAngle = TAU / 6.0;
      angle = mod(angle, segAngle);
      angle = abs(angle - segAngle * 0.5);
      return vec2(cos(angle), sin(angle)) * radius;
    } else if (mode < 4.5) {
      // Mode 4: Diamond
      uv = rotate2d(uv, angleOffset);
      uv = abs(uv);
      uv = rotate2d(uv, PI * 0.25);
      uv = mod(uv * segments * 0.5, 1.0) - 0.5;
      return abs(uv);
    } else if (mode < 5.5) {
      // Mode 5: HexGrid
      uv = rotate2d(uv, angleOffset);
      vec2 r = vec2(1.0, 1.732);
      vec2 h = r * 0.5;
      vec2 a = mod(uv, r) - h;
      vec2 b = mod(uv - h, r) - h;
      uv = dot(a, a) < dot(b, b) ? a : b;
      return abs(uv) * (1.0 + segments * 0.1);
    } else if (mode < 6.5) {
      // Mode 6: Zoom
      uv = rotate2d(uv, angleOffset);
      float s = 1.0 + sin(uTime * 0.5) * 0.2;
      for(int i=0; i<4; i++) {
        uv = abs(uv) * 1.15 - 0.5 * s;
        uv = rotate2d(uv, 0.45);
      }
      return uv;
    } else if (mode < 7.5) {
      // Mode 7: Fractal
      uv = rotate2d(uv, angleOffset);
      for(int i=0; i<5; i++) {
        uv = abs(uv - 0.25) - abs(uv + 0.25);
        uv *= 1.25;
        uv = rotate2d(uv, segments * 0.1);
      }
      return uv * 0.5;
    } else if (mode < 8.5) {
      // Mode 8: Polka
      uv = rotate2d(uv, angleOffset);
      uv *= segments * 1.5;
      vec2 g = fract(uv) - 0.5;
      return vec2(length(g));
    } else {
      // Mode 9: Ribbon
      uv = rotate2d(uv, angleOffset);
      float a = atan(uv.y, uv.x);
      float r = length(uv);
      r += sin(a * floor(segments) + uTime) * 0.15;
      return vec2(cos(a), sin(a)) * r;
    }
  }

  float fbm(vec2 p, float q) {
    float v = 0.0;
    float a = 0.52;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      if (fi > mix(1.0, 3.0, clamp(q, 0.0, 1.0))) break;
      v += a * noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 baseUv = (vUv - 0.5) * 2.0;
    baseUv.x *= uResolution.x / uResolution.y;

    float mouseDist = length(baseUv - uMouse * 0.8);
    float mouseWarp = 0.085 / (mouseDist + 0.32);
    baseUv += (baseUv - uMouse * 0.8) * mouseWarp * 0.07;

    float bassN = pow(clamp(uBass, 0.0, 1.0), 1.55);
    float midN = pow(clamp(uMid, 0.0, 1.0), 1.3);
    float highN = pow(clamp(uHigh, 0.0, 1.0), 1.25);
    float chaosCtrl = smoothstep(0.0, 1.0, uChaosAmount);

    baseUv *= (1.0 - bassN * 0.12);

    vec2 uv = baseUv;
    float kSegments = mix(1.0, 12.0, uKaleidoscope) + bassN * 5.0;
    if (uKaleidoscope > 0.01) {
      vec2 k1 = kaleidoscope(uv, kSegments, uKaleidoscopeMode, uKaleidoscopeAngle * TAU);
      if (uKaleidoscopeFade < 1.0) {
        vec2 k2 = kaleidoscope(uv, kSegments, uKaleidoscopeModePrevious, uKaleidoscopeAngle * TAU);
        uv = mix(k2, k1, smoothstep(0.0, 1.0, uKaleidoscopeFade));
      } else {
        uv = k1;
      }
    }

    float radius = max(length(uv), 0.001);
    float angle = atan(uv.y, uv.x);

    float bassPulse = 1.0 + bassN * (0.42 + 0.24 * sin(uTime * 5.0 + bassN * 9.0));
    uv *= bassPulse;

    vec2 warp = vec2(
      fbm(uv * 5.4 + vec2(uTime * 3.3, -uTime * 2.7), uQuality),
      fbm(uv * 5.9 + vec2(-uTime * 2.5, uTime * 3.5), uQuality)
    ) - 0.5;
    uv += warp * ((0.02 + 0.07 * chaosCtrl) * (0.35 + highN));

    radius = max(length(uv), 0.001);
    angle = atan(uv.y, uv.x);

    float centerWeight = pow(clamp(1.0 / (1.0 + radius * 2.5), 0.0, 1.0), 2.0);
    float spiralTwist = centerWeight * (2.2 + bassN * 5.8 + midN * 1.9) * (0.4 + uTwistAmount * 1.3);
    spiralTwist += sin(uTime * 0.5 + radius * 7.0) * 0.18;
    angle += spiralTwist;

    float rotChaos = (fbm(vec2(angle * 2.2, radius * 6.2 + uTime * 1.1), uQuality) - 0.5) * midN * (0.8 + 1.8 * chaosCtrl);
    angle += rotChaos;

    float radialPerspective = pow(radius, 0.75 + 0.14 * midN);
    float depth = 1.0 / (radialPerspective + 0.04);

    float tunnelSpeed = uTime * uSpeed * (1.0 + bassN * 1.05);
    float tunnelZ = depth * (2.4 + 0.5 * midN) + tunnelSpeed;
    float tunnelU = angle / PI;
    float tunnelV = tunnelZ;

    float dist = uDistortion * (1.0 + pow(midN, 1.25) * 2.2);
    float flow = fbm(vec2(tunnelU * 2.3, tunnelV * 0.45) + uTime * vec2(0.1, 0.07), uQuality);
    float noiseVal = fbm(vec2(tunnelU * 2.9, tunnelV * 0.5) + uTime * 0.1, uQuality);
    tunnelU += (noiseVal - 0.5) * dist * (0.36 + 0.38 * chaosCtrl);
    tunnelV += (flow - 0.5) * dist * (0.28 + 0.24 * chaosCtrl);

    float waveAmt = uWaveIntensity * (0.72 + midN * 0.95 + bassN * 0.42);
    float waveA = sin(tunnelV * 0.85 + uTime * 1.1 + tunnelU * 2.8);
    float waveB = sin(tunnelV * 1.65 - uTime * 1.35 + tunnelU * 4.7);
    tunnelU += (waveA * 0.2 + waveB * 0.11) * waveAmt;
    tunnelV += waveA * 0.2 * waveAmt;

    vec2 adv = rotate2d(vec2(tunnelU, tunnelV * 0.11), 0.18 * sin(uTime * 0.42 + tunnelV * 0.18));
    tunnelU = adv.x;
    tunnelV += adv.y * 0.05;

    float fractalPattern = 0.0;
    float scale = 1.0;
    float w = 1.0;
    for (int i = 0; i < 3; i++) {
      vec2 fp = vec2(tunnelU * scale * 4.2, tunnelV * scale * 0.9);
      fp = fract(fp) - 0.5;
      float n = 1.0 - length(fp * vec2(1.0, 1.5));
      n += (noise(fp * 8.4 + float(i) * 1.31) - 0.5) * 0.34;
      fractalPattern += smoothstep(-0.22, 0.9, n) * w;
      scale *= 1.9;
      w *= 0.58;
    }
    fractalPattern *= (uFractalDepth * 1.15);

    float rings = sin(tunnelV * (6.8 + midN * 3.2) + flow * 1.9) * 0.5 + 0.5;
    float spirals = sin(tunnelU * (8.8 + midN * 6.2) + tunnelV * 3.0 + uTime * 0.58) * 0.5 + 0.5;

    float pattern = mix(rings, spirals, 0.55 + midN * 0.26);
    pattern += fractalPattern * 0.36;
    pattern = smoothstep(0.14, 0.92, pattern);
    pattern = pow(pattern, 0.8);

    float hueBase = fract(
      uTime * (uColorShiftSpeed * 0.16 + 0.05) +
      tunnelV * 0.028 +
      tunnelU * 0.07 +
      highN * 0.8
    );
    float hueRapid = fract(hueBase + highN * (0.22 + 0.22 * sin(uTime * 4.0)));
    float sat = clamp(0.64 + 0.45 * highN + 0.1 * fractalPattern, 0.0, 1.0);

    vec3 hueA = hsl2rgb(vec3(hueRapid, sat, 0.52 + 0.06 * sin(tunnelV * 0.23)));
    vec3 hueB = hsl2rgb(vec3(fract(hueRapid + 0.23), clamp(sat + 0.08, 0.0, 1.0), 0.5));

    float gradMix = 0.5 + 0.5 * sin(tunnelU * 2.5 + tunnelV * 0.2 + uTime * 0.8);
    gradMix = mix(gradMix, fractalPattern, 0.3);
    vec3 themeMix = mix(uColor1, uColor2, gradMix);
    vec3 tunnelColor = mix(hueA, hueB, gradMix) * 0.72 + themeMix * 0.62;

    float depthGlow = smoothstep(0.0, 3.3, depth);
    depthGlow = pow(depthGlow, 0.52);

    float brightness = pattern * depthGlow;
    brightness *= (0.72 + bassN * 0.9);

    vec3 color = tunnelColor * brightness;
    color = pow(max(color, 0.0), vec3(0.9));
    color *= 1.03 + fractalPattern * 0.18;

    float vignette = 1.0 - smoothstep(0.32, 1.85, radius);
    color *= vignette;

    float glowStr = uGlowIntensity * (1.0 + highN * 1.8);
    vec3 glow = tunnelColor * depthGlow * glowStr * 0.24;
    glow *= smoothstep(0.5, 0.0, radius);
    color += glow;

    float centerLight = smoothstep(0.15, 0.0, radius);
    centerLight *= (0.76 + bassN * 0.7);
    vec3 centerColor = mix(tunnelColor, vec3(1.0), 0.58);
    color += centerColor * centerLight * 0.72;

    color = mix(color, uBgColor, smoothstep(0.52, 2.0, radius) * 0.54);

    float chrAb = 0.017 * (1.0 + bassN * 0.25 + highN * 0.12 + chaosCtrl * 0.16);
    float rShift = radius * chrAb;
    color.r *= 1.0 + sin(angle * 3.0 + uTime) * rShift;
    color.b *= 1.0 + cos(angle * 3.0 + uTime * 1.25) * rShift;

    color = clamp(color, 0.0, 1.35);
    
    // Apply Glow Intensity
    color *= (1.0 + uGlowIntensity * clamp(brightness, 0.0, 1.0));
    
    // Beat Kick - Kaleidoscope Flash
    color += uKaleidoscopeFlash * 0.55 * vec3(1.0, 1.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
