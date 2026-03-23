/* ======================================================
   renderer.js — Tunnel + interactive floating 3D object
   ====================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { vertexShader, fragmentShader } from './shaders.js';

export class TunnelRenderer {
  constructor(canvas) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.physicallyCorrectLights = true;

    this.isMobile = window.matchMedia('(max-width: 900px)').matches || window.matchMedia('(pointer: coarse)').matches;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 0.9 : 1));
    this.renderer.autoClear = false;
    this.renderer.useLegacyLights = false;

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.tunnelTarget = new THREE.WebGLRenderTarget(w, h, {
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.tunnelTarget.texture.colorSpace = THREE.SRGBColorSpace;
    this.tunnelTarget.texture.mapping = THREE.EquirectangularReflectionMapping;

    // Scene 1: fullscreen shader tunnel
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:            { value: 0 },
        uSpeed:           { value: 0.5 },
        uBass:            { value: 0 },
        uMid:             { value: 0 },
        uHigh:            { value: 0 },
        uKaleidoscope:    { value: 0.5 },
        uDistortion:      { value: 0.35 },
        uGlowIntensity:   { value: 1.6 },
        uColor1:          { value: new THREE.Vector3(0, 1, 1) },
        uColor2:          { value: new THREE.Vector3(1, 0, 1) },
        uBgColor:         { value: new THREE.Vector3(0, 0.02, 0.06) },
        uMouse:           { value: new THREE.Vector2(0, 0) },
        uResolution:      { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uColorShiftSpeed: { value: 0.3 },
        uFractalDepth:    { value: 0.5 },
        uWaveIntensity:   { value: 0.6 },
        uTwistAmount:     { value: 0.7 },
        uChaosAmount:     { value: 0.55 },
        uQuality:         { value: 1.0 },
      },
    });

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.quad);

    // Blit scene: draws tunnel render target to screen
    this.blitScene = new THREE.Scene();
    this.blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.blitMaterial = new THREE.MeshBasicMaterial({ map: this.tunnelTarget.texture });
    this.blitQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blitMaterial);
    this.blitScene.add(this.blitQuad);

    // Scene 2: interactive floating object
    this.objectScene = new THREE.Scene();
    this.objectCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
    this.objectCamera.position.set(0, 0, 3.8);

    this.objectGroup = new THREE.Group();
    this.objectGroup.position.set(0, 0, 0);
    this.objectScene.add(this.objectGroup);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.keyLight = new THREE.PointLight(0x66ffcc, 1.2, 12, 2);
    this.keyLight.position.set(1.2, 1.1, 2.8);
    this.fillLight = new THREE.PointLight(0xff44dd, 0.7, 10, 2);
    this.fillLight.position.set(-1.5, -0.4, 2.2);
    this.objectScene.add(this.ambientLight, this.keyLight, this.fillLight);

    this.objectRoot = this._createDefaultObject();
    this._baseModelQuaternion = new THREE.Quaternion();
    this._tmpTargetQuat = new THREE.Quaternion();
    this._lockedViewQuat = new THREE.Quaternion();
    this._tmpEuler = new THREE.Euler(0, 0, 0, 'XYZ');
    this._tiltUpQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(THREE.MathUtils.degToRad(-68), 0, 0, 'XYZ')
    );
    this._headingFlipQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, Math.PI, 0, 'XYZ')
    );
    this._faceUpQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, Math.PI, 'XYZ')
    );
    this._tmpLookTarget = new THREE.Vector3(0, 0, 0);
    this._inScreenTarget = new THREE.Vector3(0, 0, -2.8);
    this._origin = new THREE.Vector3(0, 0, 0);
    this.objectNodes = [];
    this.objectNodeMeta = [];
    this._baseModelQuaternion.copy(this.objectRoot.quaternion);
    this._setEnvMapForObject(this.objectRoot);
    this._setObjectNodes([this.objectRoot], []);

    this.raycaster = new THREE.Raycaster();
    this.mouseNdc = new THREE.Vector2(0, 0);
    this.hoverMix = 0;
    this.objectTargetPos = new THREE.Vector3();
    this.objectVelocity = new THREE.Vector3();
    this.objectAngularVelocity = new THREE.Vector3();
    this.objectBounds = { x: 1.3, y: 0.86 };
    this._lastPhysicsTime = performance.now();
    this._lastBassKickTime = 0;

    this._mouseTarget = { x: 0, y: 0 };
    this._mouseCurrent = { x: 0, y: 0 };

    this._loader = new GLTFLoader();
    this._objectBaseScale = 1;
    this.objectScale = 1;
    this.objectRotationDeg = { x: 180, y: 180, z: 180 };
    this._isCustomModel = false;
    this._customModelTemplate = null;
    this.cloneCount = 1;
    this.cloneFreeFly = false;

    window.addEventListener('mousemove', (e) => {
      this._mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      this._mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
      this.mouseNdc.set(this._mouseTarget.x, this._mouseTarget.y);
    });

    window.addEventListener('resize', () => this._onResize());
  }

  _createDefaultObject() {
    // No geometric fallback: robot model is the intended default object.
    return new THREE.Group();
  }

  _disposeObject(node) {
    if (!node) return;
    node.traverse((child) => {
      if (!child.isMesh) return;
      if (child.geometry) child.geometry.dispose();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => m && m.dispose());
    });
  }

  _setEnvMapForObject(node) {
    if (!node) return;
    node.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (mat.envMap !== undefined) {
          mat.envMap = this.tunnelTarget.texture;
          mat.envMapIntensity = Math.max(mat.envMapIntensity ?? 0.8, 1.1);
          mat.needsUpdate = true;
        }
      });
    });
  }

  _setObjectNodes(nodes, meta = []) {
    for (const node of this.objectNodes) {
      this.objectGroup.remove(node);
    }
    this.objectNodes = nodes;
    this.objectNodeMeta = meta;
    for (const node of this.objectNodes) {
      this.objectGroup.add(node);
    }
    this.objectRoot = this.objectNodes[0] || null;
  }

  _buildCustomRing(baseModel, count) {
    const radius = count === 1 ? 0.0 : 0.98;
    const yScale = 1.0;
    const nodes = [];
    const meta = [];

    for (let i = 0; i < count; i++) {
      const node = i === 0 ? baseModel : baseModel.clone(true);
      const angle = (i / count) * Math.PI * 2.0 - Math.PI * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * yScale;
      node.position.set(x, y, 0.0);
      node.quaternion.copy(this._lockedViewQuat);
      nodes.push(node);
      meta.push({
        angle,
        radius,
        yScale,
        phase: Math.random() * Math.PI * 2.0,
        speedX: 0.45 + Math.random() * 0.5,
        speedY: 0.45 + Math.random() * 0.5,
      });
    }

    return { nodes, meta };
  }

  _forEachObjectMaterial(fn) {
    for (const node of this.objectNodes) {
      if (!node) continue;
      node.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) fn(mat, child);
      });
    }
  }

  setCloneOptions(count, freeFly) {
    this.cloneCount = Math.max(1, Math.min(10, Number(count) || 6));
    this.cloneFreeFly = Boolean(freeFly);
    if (this._isCustomModel && this._customModelTemplate) {
      const ring = this._buildCustomRing(this._customModelTemplate, this.cloneCount);
      this._setObjectNodes(ring.nodes, ring.meta);
      for (const node of this.objectNodes) {
        this._setEnvMapForObject(node);
      }
      this._updateLockedViewQuat();
    }
  }

  setObjectScale(scale) {
    this.objectScale = Math.max(0.02, Math.min(0.6, Number(scale) || 0.3));
  }

  setObjectRotation(xDeg, yDeg, zDeg) {
    this.objectRotationDeg.x = Math.max(-180, Math.min(180, Number(xDeg) || 0));
    this.objectRotationDeg.y = Math.max(-180, Math.min(180, Number(yDeg) || 0));
    this.objectRotationDeg.z = Math.max(-180, Math.min(180, Number(zDeg) || 0));
    if (this._isCustomModel && this.objectRoot) {
      this._updateLockedViewQuat();
    }
  }

  _updateLockedViewQuat() {
    this._tmpEuler.set(
      THREE.MathUtils.degToRad(this.objectRotationDeg.x),
      THREE.MathUtils.degToRad(this.objectRotationDeg.y),
      THREE.MathUtils.degToRad(this.objectRotationDeg.z)
    );
    this._lockedViewQuat.setFromEuler(this._tmpEuler).multiply(this._baseModelQuaternion);
  }

  async loadObjectUrl(url) {
    const gltf = await this._loader.loadAsync(url);
    await this._applyLoadedModel(gltf.scene);
  }

  async loadObjectFile(file) {
    const url = URL.createObjectURL(file);
    try {
      const gltf = await this._loader.loadAsync(url);
      await this._applyLoadedModel(gltf.scene);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async _applyLoadedModel(model) {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const targetSize = 1.2;
    const scale = targetSize / maxDim;
    model.scale.setScalar(scale);

    const centeredBounds = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    centeredBounds.getCenter(center);
    model.position.sub(center);

    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          // Keep original textures/materials; only apply lightweight enhancement.
          if (mat.emissiveIntensity !== undefined) {
            mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 0.25);
          }
          if (mat.roughness !== undefined) {
            mat.roughness = Math.min(mat.roughness, 0.55);
          }
          if (mat.metalness !== undefined) {
            mat.metalness = Math.max(mat.metalness, 0.08);
          }
          mat.needsUpdate = true;
        });
      }
    });

    for (const node of this.objectNodes) {
      this.objectGroup.remove(node);
    }
    if (this._customModelTemplate) {
      this._disposeObject(this._customModelTemplate);
      this._customModelTemplate = null;
    } else if (this.objectRoot) {
      this._disposeObject(this.objectRoot);
    }

    this._customModelTemplate = model;
    this._baseModelQuaternion.copy(this._customModelTemplate.quaternion);
    const ring = this._buildCustomRing(this._customModelTemplate, this.cloneCount);
    this._setObjectNodes(ring.nodes, ring.meta);
    for (const node of this.objectNodes) {
      this._setEnvMapForObject(node);
    }
    this._objectBaseScale = 1;
    this._isCustomModel = true;
    this._updateLockedViewQuat();
    this.objectAngularVelocity.set(0, 0, 0);
  }

  _applyBoundaryBounce() {
    const restitution = 0.46;
    const friction = 0.9;

    if (this.objectGroup.position.x < -this.objectBounds.x) {
      this.objectGroup.position.x = -this.objectBounds.x;
      this.objectVelocity.x = Math.abs(this.objectVelocity.x) * restitution;
      this.objectVelocity.y *= friction;
    } else if (this.objectGroup.position.x > this.objectBounds.x) {
      this.objectGroup.position.x = this.objectBounds.x;
      this.objectVelocity.x = -Math.abs(this.objectVelocity.x) * restitution;
      this.objectVelocity.y *= friction;
    }

    if (this.objectGroup.position.y < -this.objectBounds.y) {
      this.objectGroup.position.y = -this.objectBounds.y;
      this.objectVelocity.y = Math.abs(this.objectVelocity.y) * restitution;
      this.objectVelocity.x *= friction;
    } else if (this.objectGroup.position.y > this.objectBounds.y) {
      this.objectGroup.position.y = this.objectBounds.y;
      this.objectVelocity.y = -Math.abs(this.objectVelocity.y) * restitution;
      this.objectVelocity.x *= friction;
    }
  }

  _updateObjectInteraction(time, audioData, settings) {
    if (!settings.objectEnabled || !this.objectRoot) return;

    const bass = Math.max(0, Math.min(1, audioData.bass));
    const mid = Math.max(0, Math.min(1, audioData.mid));
    const high = Math.max(0, Math.min(1, audioData.high));
    const now = performance.now();
    const dt = Math.min((now - this._lastPhysicsTime) / 1000, 0.033);
    this._lastPhysicsTime = now;
    this.hoverMix = 0.0;

    const bassPulse = bass > 0.1 ? (bass - 0.1) * 0.15 : 0.0;
    // Base pulsates subtly + minor bass sync
    const flicker = Math.sin(time * 15.0) * 0.015;
    const baseScale = 1.0 + flicker + bassPulse; 
    const finalScale = this._objectBaseScale * this.objectScale * baseScale;
    this.objectRoot.scale.setScalar(finalScale);
    
    // Increased floating range and speed ("scroll more")
    this.objectTargetPos.x = Math.sin(time * 0.65) * (0.35 + mid * 0.15);
    this.objectTargetPos.y = Math.cos(time * 0.92) * (0.28 + high * 0.12);

    const spring = 0.78;
    const damping = 0.95;
    const ax = (this.objectTargetPos.x - this.objectGroup.position.x) * spring;
    const ay = (this.objectTargetPos.y - this.objectGroup.position.y) * spring;
    this.objectVelocity.x = (this.objectVelocity.x + ax * dt * 60.0) * damping;
    this.objectVelocity.y = (this.objectVelocity.y + ay * dt * 60.0) * damping;

    // Bass-only directional kicks
    if (bass > 0.74 && (now - this._lastBassKickTime) > 150) {
      const kick = (bass - 0.74) * 1.5; // Slightly increased for visibility
      const dirAngle = time * 4.4 + Math.sin(time * 1.7) * 1.2;
      const dirX = Math.cos(dirAngle);
      const dirY = Math.sin(dirAngle);
      this.objectVelocity.x += dirX * kick;
      this.objectVelocity.y += dirY * kick;
      this.objectAngularVelocity.y += dirX * kick * 0.35;
      this.objectAngularVelocity.x += dirY * kick * 0.35;
      this._lastBassKickTime = now;
    }

    this.objectGroup.position.x += this.objectVelocity.x * dt * 60.0;
    this.objectGroup.position.y += this.objectVelocity.y * dt * 60.0;
    this._applyBoundaryBounce();

    if (this._isCustomModel) {
      // Reduced centering force to allow more "scrolling/drifting"
      this.objectGroup.position.lerp(this._origin, 0.035); 
      const ringSpin = time * 0.16;
      const radiusPulse = 1.0 + bassPulse * 0.15; // Slightly reduced
      
      // Auto-rotation over time like a globe (faster now)
      const globeTime = time * 1.1; // Increased rotation speed
      this._tmpEuler.set(
        THREE.MathUtils.degToRad(this.objectRotationDeg.x) + globeTime * 0.45,
        THREE.MathUtils.degToRad(this.objectRotationDeg.y) + globeTime * 0.9,
        THREE.MathUtils.degToRad(this.objectRotationDeg.z) + globeTime * 0.15
      );
      this._tmpTargetQuat.setFromEuler(this._tmpEuler).multiply(this._baseModelQuaternion);

      for (let i = 0; i < this.objectNodes.length; i++) {
        const node = this.objectNodes[i];
        const m = this.objectNodeMeta[i];
        if (!node || !m) continue;
        const a = m.angle + ringSpin;
        if (this.cloneFreeFly) {
          const driftAmp = 0.2 + bassPulse * 0.16;
          node.position.x =
            Math.cos(a) * m.radius * 0.72 * radiusPulse +
            Math.sin(time * m.speedX + m.phase) * driftAmp;
          node.position.y =
            Math.sin(a) * m.radius * m.yScale * 0.72 * radiusPulse +
            Math.cos(time * m.speedY + m.phase * 1.37) * driftAmp * 0.82;
        } else {
          node.position.x = Math.cos(a) * m.radius * radiusPulse;
          node.position.y = Math.sin(a) * m.radius * m.yScale * radiusPulse;
        }
        node.position.z = 0.0;
        node.quaternion.copy(this._tmpTargetQuat); // Use rotating quat instead of locked
        node.scale.setScalar(finalScale);
      }
      this.objectAngularVelocity.multiplyScalar(0.75);
    } else {
      this.objectAngularVelocity.x += (0.006 + bassPulse * 0.05) * dt * 60.0;
      this.objectAngularVelocity.y += (0.008 + bassPulse * 0.07) * dt * 60.0;
      this.objectAngularVelocity.z += (Math.sin(time * 1.4) * 0.002) * dt * 60.0;
      this.objectAngularVelocity.multiplyScalar(0.97);

      this.objectRoot.rotation.x += this.objectAngularVelocity.x * dt;
      this.objectRoot.rotation.y += this.objectAngularVelocity.y * dt;
      this.objectRoot.rotation.z += this.objectAngularVelocity.z * dt;
    }

    const keyCol = new THREE.Color().setHSL((0.34 + bass * 0.14 + time * 0.025) % 1, 0.9, 0.6);
    const fillCol = new THREE.Color().setHSL((0.82 + bass * 0.16 - time * 0.02) % 1, 0.9, 0.58);
    this.keyLight.color.copy(keyCol);
    this.fillLight.color.copy(fillCol);
    this.keyLight.intensity = 0.8 + bassPulse * 1.8;
    this.fillLight.intensity = 0.5 + bassPulse * 1.0;

    this._forEachObjectMaterial((mat, child) => {
      if (mat.emissiveIntensity !== undefined) {
        const baseE = child.userData.baseEmissiveIntensity ?? 0.75;
        mat.emissiveIntensity = baseE + bassPulse * 1.4;
      }
      if (mat.transmission !== undefined) {
        mat.roughness = 0.05 + (1.0 - bassPulse) * 0.02;
        mat.ior = 1.2;
        mat.thickness = 0.92 + bassPulse * 0.6;
      }
    });
  }

  render(time, audioData, settings) {
    const u = this.material.uniforms;

    u.uTime.value = time;
    u.uSpeed.value = settings.speed;
    u.uBass.value = audioData.bass;
    u.uMid.value = audioData.mid;
    u.uHigh.value = audioData.high;
    u.uKaleidoscope.value = settings.kaleidoscope;
    u.uDistortion.value = settings.distortion;
    u.uGlowIntensity.value = settings.glowIntensity;
    u.uColorShiftSpeed.value = settings.colorShiftSpeed;
    u.uFractalDepth.value = settings.fractalDepth;
    u.uWaveIntensity.value = settings.waveIntensity;
    u.uTwistAmount.value = settings.twistAmount;
    u.uChaosAmount.value = settings.chaosAmount;
    u.uQuality.value = settings.quality;

    u.uColor1.value.set(settings.color1[0], settings.color1[1], settings.color1[2]);
    u.uColor2.value.set(settings.color2[0], settings.color2[1], settings.color2[2]);
    u.uBgColor.value.set(settings.bgColor[0], settings.bgColor[1], settings.bgColor[2]);

    this._mouseCurrent.x += (this._mouseTarget.x - this._mouseCurrent.x) * 0.05;
    this._mouseCurrent.y += (this._mouseTarget.y - this._mouseCurrent.y) * 0.05;
    u.uMouse.value.set(this._mouseCurrent.x, this._mouseCurrent.y);

    // Pass 1: render tunnel to texture (also used as dynamic reflection source)
    this.renderer.setRenderTarget(this.tunnelTarget);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // Pass 2: draw tunnel texture to screen
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.blitScene, this.blitCamera);

    if (settings.objectEnabled) {
      this._updateObjectInteraction(time, audioData, settings);
      this.renderer.clearDepth();
      this.renderer.render(this.objectScene, this.objectCamera);
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.tunnelTarget.setSize(w, h);
    this.material.uniforms.uResolution.value.set(w, h);
    this.objectCamera.aspect = w / h;
    this.objectCamera.updateProjectionMatrix();
  }

  dispose() {
    if (this._customModelTemplate) {
      this._disposeObject(this._customModelTemplate);
    } else {
      this._disposeObject(this.objectRoot);
    }
    this.tunnelTarget.dispose();
    this.blitMaterial.dispose();
    this.blitQuad.geometry.dispose();
    this.renderer.dispose();
    this.material.dispose();
  }
}
