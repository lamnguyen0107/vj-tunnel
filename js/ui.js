/* ======================================================
   ui.js â€” Control panel bindings
   ====================================================== */

export class UIController {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this._isPlaying = false;
    this._currentLanguage = 'vi';

    this.els = {
      upload: document.getElementById('audio-upload'),
      uploadText: document.getElementById('upload-text'),
      modelUpload: document.getElementById('model-upload'),
      modelUploadText: document.getElementById('model-upload-text'),
      objectToggle: document.getElementById('object-toggle'),
      cloneCountLabel: document.getElementById('label-clone-count'),
      cloneCountSlider: document.getElementById('clone-count-slider'),
      cloneCountValue: document.getElementById('clone-count-value'),
      objectSizeLabel: document.getElementById('label-object-size'),
      objectSizeSlider: document.getElementById('object-size-slider'),
      objectSizeValue: document.getElementById('object-size-value'),
      cloneFreeFlyLabel: document.getElementById('label-clone-freefly'),
      cloneFreeFlyToggle: document.getElementById('clone-freefly-toggle'),
      labelObjectGap: document.getElementById('label-object-gap'),
      objectGapSlider: document.getElementById('object-gap-slider'),
      objectGapValue: document.getElementById('object-gap-value'),
      labelAudio: document.getElementById('label-audio'),
      labelControls: document.getElementById('label-controls'),
      labelSpeed: document.getElementById('label-speed'),
      labelSensitivity: document.getElementById('label-sensitivity'),
      labelKaleidoscope: document.getElementById('label-kaleidoscope'),
      labelKaleidoscopeAuto: document.getElementById('label-kaleidoscope-auto'),
      labelWave: document.getElementById('label-wave'),
      labelTwist: document.getElementById('label-twist'),
      labelChaos: document.getElementById('label-chaos'),
      labelPrimaryColor: document.getElementById('label-primary-color'),
      labelSecondaryColor: document.getElementById('label-secondary-color'),
      labelBgColor: document.getElementById('label-bg-color'),
      labelTheme: document.getElementById('label-theme'),
      randomizeText: document.getElementById('randomize-text'),
      langToggle: document.getElementById('lang-toggle'),
      labelVolume: document.getElementById('label-volume'),
      playBtn: document.getElementById('play-pause-btn'),
      playIcon: document.getElementById('play-icon'),
      pauseIcon: document.getElementById('pause-icon'),
      volumeSlider: document.getElementById('volume-slider'),
      volumeValue: document.getElementById('volume-value'),
      speedSlider: document.getElementById('speed-slider'),
      speedValue: document.getElementById('speed-value'),
      sensitivitySlider: document.getElementById('sensitivity-slider'),
      sensitivityValue: document.getElementById('sensitivity-value'),
      kaleidoscopeSlider: document.getElementById('kaleidoscope-slider'),
      kaleidoscopeValue: document.getElementById('kaleidoscope-value'),
      kaleidoscopeAutoToggle: document.getElementById('kaleidoscope-auto-toggle'),
      kaleidoscopeItems: document.querySelectorAll('.k-item'),
      waveSlider: document.getElementById('wave-slider'),
      waveValue: document.getElementById('wave-value'),
      twistSlider: document.getElementById('twist-slider'),
      twistValue: document.getElementById('twist-value'),
      chaosSlider: document.getElementById('chaos-slider'),
      chaosValue: document.getElementById('chaos-value'),
      primaryColor: document.getElementById('primary-color'),
      secondaryColor: document.getElementById('secondary-color'),
      bgColor: document.getElementById('bg-color'),
      themeSelector: document.getElementById('theme-selector'),
      randomizeBtn: document.getElementById('randomize-btn'),
      togglePanel: document.getElementById('toggle-panel'),
      panel: document.getElementById('ui-panel'),
      fpsCounter: document.getElementById('fps-counter'),
      themeNeonCyberpunk: document.getElementById('theme-neonCyberpunk'),
      themePsychedelicRainbow: document.getElementById('theme-psychedelicRainbow'),
      themeLavaCore: document.getElementById('theme-lavaCore'),
      themeDeepOcean: document.getElementById('theme-deepOcean'),
      themeGoldenEmerald: document.getElementById('theme-goldenEmerald'),
      themeAcidTechno: document.getElementById('theme-acidTechno'),
      themeSunsetHorizon: document.getElementById('theme-sunsetHorizon'),
      themeVintageVapor: document.getElementById('theme-vintageVapor'),
    };

    this._fpsFrames = 0;
    this._fpsTime = performance.now();
    this._accentColor = '#39ff14';
    this._translations = {
      vi: {
        htmlLang: 'vi',
        pageTitle: 'Tunnel VJ - Trình diễn âm thanh cực chill',
        pageDescription: 'Welcome! Hãy chơi bản nhạc bạn thích và tận hưởng hành trình Tunnel VJ đầy màu sắc.',
        welcome: 'Welcome! Hãy cho bản nhạc bạn thích vào đây và cùng tận hưởng một chuyến đi ánh sáng thật đã mắt, thật đã tai nhé.',
        sectionAudio: 'ÂM THANH',
        sectionControls: 'ĐIỀU CHỈNH',
        sectionObjectSub: 'Object Floating',
        sectionColor: 'MÀU SẮC',
        sectionTunnelColorSub: 'Tunnel Background',
        sectionObjectColorSub: 'Object Floating',
        sectionTheme: 'CHỦ ĐỀ',
        sectionLiveSet: 'LIVE SET',
        upload: 'Thêm nhạc',
        uploadModel: 'Thêm 3D (.glb)',
        cloneCount: 'Số clone',
        objectSize: 'Size object',
        objectRotX: 'Góc X',
        objectRotY: 'Góc Y',
        objectRotZ: 'Góc Z',
        cloneFreeFly: 'Clone bay tự do',
        randomize: 'Trộn ngẫu nhiên',
        volume: 'Âm lượng',
        speed: 'Tốc độ',
        sensitivity: 'Độ nhạy',
        kaleidoscope: 'Kaleidoscope',
        wave: 'Lượn sóng',
        twist: 'Xoắn',
        particle: 'Hạt sáng',
        objectBoost: 'Object Boost',
        chaos: 'Hỗn loạn',
        particleShape: 'Shape hạt',
        objectDistance: 'Khoảng cách',
        automix: 'Trộn ngẫu nhiên',
        kaleidoscopeAuto: 'AUTO MIX KALEIDOSCOPE',
        cooldown: 'Switch Cooldown (ms)',
        kaleidoscopeModes: [
          'Radial', 'Mirror', 'Triangle', 'Spiral', 'Diamond',
          'HexGrid', 'Zoom', 'Fractal', 'Polka', 'Ribbon'
        ],
        objectEnabled: 'Hiện object',
        colorMode: 'Chế độ màu',
        modeTheme: 'Theo chủ đề',
        modeCustom: 'Tùy chỉnh',
        primaryColor: 'Màu chính',
        secondaryColor: 'Màu phụ',
        backgroundColor: 'Màu nền',
        objectColorMode: 'Màu object',
        objectColorModeAuto: 'Auto nổi bật',
        objectColorModeCustom: 'Tùy chỉnh',
        objectColor: 'Màu object',
        toggleTitle: 'Thu gọn/Mở rộng bảng điều khiển',
        langTitle: 'Chuyển ngôn ngữ',
        langBtn: 'VI',
        theme: {
          neonCyberpunk: 'Neon Cyberpunk',
          psychedelicRainbow: 'Cầu vồng Psychedelic',
          lavaCore: 'Lửa địa ngục (Lava Core)',
          deepOcean: 'Đại dương sâu (Deep Ocean)',
          goldenEmerald: 'Xanh lục bảo vàng (Golden Emerald)',
          acidTechno: 'Công nghệ ảo (Acid Techno)',
          sunsetHorizon: 'Chân trời hoàng hôn',
          vintageVapor: 'Hoài niệm Vapor',
        },
        preset: {
          drop: 'Drop',
          breakdown: 'Breakdown',
          buildUp: 'Build-up',
        },
        shape: {
          mix: 'Mix',
          sphere: 'Cầu',
          box: 'Khối',
          cylinder: 'Trụ',
          torus: 'Vành',
        },
        distance: {
          near: 'Gần',
          mid: 'Vừa',
          far: 'Xa',
        },
      },
      en: {
        htmlLang: 'en',
        pageTitle: 'Tunnel VJ - Audio Reactive Visual Experience',
        pageDescription: 'Welcome! Drop in your favorite track and enjoy this immersive tunnel VJ journey.',
        welcome: 'Welcome! Drop in your favorite track and enjoy this colorful audiovisual tunnel ride.',
        sectionAudio: 'AUDIO',
        sectionControls: 'CONTROLS',
        sectionObjectSub: 'Object Floating',
        sectionColor: 'COLOR',
        sectionTunnelColorSub: 'Tunnel Background',
        sectionObjectColorSub: 'Object Floating',
        sectionTheme: 'THEME',
        sectionLiveSet: 'LIVE SET',
        upload: 'Upload Audio',
        uploadModel: 'Upload 3D (.glb)',
        cloneCount: 'Clone Count',
        objectSize: 'Object Size',
        objectRotX: 'Angle X',
        objectRotY: 'Angle Y',
        objectRotZ: 'Angle Z',
        cloneFreeFly: 'Free-Fly Clones',
        randomize: 'Randomize',
        volume: 'Volume',
        speed: 'Speed',
        sensitivity: 'Sensitivity',
        kaleidoscope: 'Kaleidoscope',
        wave: 'Wave',
        twist: 'Twist',
        particle: 'Particles',
        objectBoost: 'Object Boost',
        chaos: 'Chaos',
        particleShape: 'Particle Shape',
        objectDistance: 'Object Distance',
        automix: 'Random Mix',
        kaleidoscopeAuto: 'AUTO MIX KALEIDOSCOPE',
        cooldown: 'Switch Cooldown (ms)',
        kaleidoscopeModes: [
          'Radial', 'Mirror', 'Triangle', 'Spiral', 'Diamond',
          'HexGrid', 'Zoom', 'Fractal', 'Polka', 'Ribbon'
        ],
        objectEnabled: 'Show Object',
        colorMode: 'Color Mode',
        modeTheme: 'Theme Colors',
        modeCustom: 'Custom Colors',
        primaryColor: 'Primary',
        secondaryColor: 'Secondary',
        backgroundColor: 'Background',
        objectColorMode: 'Object Color',
        objectColorModeAuto: 'Auto Pop',
        objectColorModeCustom: 'Custom',
        objectColor: 'Object Color',
        toggleTitle: 'Collapse/Expand control panel',
        langTitle: 'Switch language',
        langBtn: 'EN',
        theme: {
          neonCyberpunk: 'Neon Cyberpunk',
          psychedelicRainbow: 'Psychedelic Rainbow',
          lavaCore: 'Lava Core',
          deepOcean: 'Deep Ocean',
          goldenEmerald: 'Golden Emerald',
          acidTechno: 'Acid Techno',
          sunsetHorizon: 'Sunset Horizon',
          vintageVapor: 'Vintage Vapor',
        },
        preset: {
          drop: 'Drop',
          breakdown: 'Breakdown',
          buildUp: 'Build-up',
        },
        shape: {
          mix: 'Mix',
          sphere: 'Sphere',
          box: 'Box',
          cylinder: 'Cylinder',
          torus: 'Torus',
        },
        distance: {
          near: 'Near',
          mid: 'Mid',
          far: 'Far',
        },
      },
    };

    this._bindEvents();
    this.applyLanguage(this._currentLanguage);
  }

  _bindEvents() {
    // File upload
    this.els.upload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const label = this.els.uploadText;
      label.textContent = 'Decoding...';
      this.els.playBtn.disabled = true;
      this.resetPlaybackUI();

      await this.callbacks.onFileLoad(file);

      label.textContent = file.name.length > 18
        ? file.name.slice(0, 16) + '...' : file.name;
      this.els.playBtn.disabled = false;
    });

    this.els.modelUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.els.modelUploadText.textContent = file.name.length > 16
        ? file.name.slice(0, 14) + '...' : file.name;
      await this.callbacks.onModelLoad(file);
    });
    this.els.objectToggle.addEventListener('change', e => this.callbacks.onObjectToggle(e.target.checked));
    this._bindSlider('objectSizeSlider', 'objectSizeValue', v => this.callbacks.onObjectSizeChange(v / 100));
    this._bindSlider('cloneCountSlider', 'cloneCountValue', v => this.callbacks.onCloneCountChange(v));
    this._bindSlider('objectGapSlider', 'objectGapValue', v => this.callbacks.onObjectGapChange(v / 100));
    this.els.cloneFreeFlyToggle.addEventListener('change', e => {
      this.callbacks.onCloneFreeFlyChange(e.target.checked);
      this._updateGapSliderState(e.target.checked);
    });

    // Play/Pause
    this.els.playBtn.addEventListener('click', () => {
      this._isPlaying = !this._isPlaying;
      this.els.playIcon.style.display = this._isPlaying ? 'none' : 'block';
      this.els.pauseIcon.style.display = this._isPlaying ? 'block' : 'none';
      this.callbacks.onPlayPause(this._isPlaying);
    });
    this._bindSlider('volumeSlider', 'volumeValue', v => this.callbacks.onVolumeChange(v / 100));

    // Kaleidoscope UI
    if (this.els.kaleidoscopeAutoToggle) {
      this.els.kaleidoscopeAutoToggle.addEventListener('change', e => {
        if (this.callbacks.onKaleidoscopeAutoModeChange) {
          this.callbacks.onKaleidoscopeAutoModeChange(e.target.checked);
        }
      });
    }
    if (this.els.kaleidoscopeItems) {
      this.els.kaleidoscopeItems.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const mode = parseInt(e.currentTarget.getAttribute('data-mode'));
          if (this.callbacks.onKaleidoscopeModeChange) {
            this.callbacks.onKaleidoscopeModeChange(mode);
          }
          this.setKaleidoscopeMode(mode);

          if (this.els.kaleidoscopeAutoToggle && this.els.kaleidoscopeAutoToggle.checked) {
            this.els.kaleidoscopeAutoToggle.checked = false;
            if (this.callbacks.onKaleidoscopeAutoModeChange) {
              this.callbacks.onKaleidoscopeAutoModeChange(false);
            }
          }
        });
      });
    }

    // Sliders
    this._bindSlider('speedSlider', 'speedValue', v => this.callbacks.onSpeedChange(v / 100));
    this._bindSlider('sensitivitySlider', 'sensitivityValue', v => this.callbacks.onSensitivityChange(v / 50));
    this._bindSlider('kaleidoscopeSlider', 'kaleidoscopeValue', v => this.callbacks.onKaleidoscopeChange(v / 100));
    this._bindSlider('waveSlider', 'waveValue', v => this.callbacks.onWaveChange(v / 100));
    this._bindSlider('twistSlider', 'twistValue', v => this.callbacks.onTwistChange(v / 100));
    this._bindSlider('chaosSlider', 'chaosValue', v => this.callbacks.onChaosChange(v / 100));
    // Explicit bind for cooldown (doesn't normalize)
    if (this.els.cooldownSlider) {
      this.els.cooldownSlider.addEventListener('input', e => {
        const v = parseInt(e.target.value);
        this.els.cooldownValue.textContent = v;
        if (this.callbacks.onCooldownChange) this.callbacks.onCooldownChange(v);
      });
    }

    // Color
    this.els.primaryColor.addEventListener('input', e => {
      this._accentColor = e.target.value;
      this.callbacks.onPrimaryColorChange(e.target.value);
    });
    this.els.secondaryColor.addEventListener('input', e => this.callbacks.onSecondaryColorChange(e.target.value));
    this.els.bgColor.addEventListener('input', e => this.callbacks.onBgColorChange(e.target.value));

    // Theme
    this.els.themeSelector.addEventListener('change', e => this.callbacks.onThemeChange(e.target.value));

    // Randomize
    this.els.randomizeBtn.addEventListener('click', () => this.callbacks.onRandomize());

    // Language toggle
    this.els.langToggle.addEventListener('click', () => {
      const next = this._currentLanguage === 'vi' ? 'en' : 'vi';
      this.applyLanguage(next);
    });

    // Panel toggle
    this.els.togglePanel.addEventListener('click', () => {
      this.els.panel.classList.toggle('collapsed');
    });
  }

  resetPlaybackUI() {
    this._isPlaying = false;
    this.els.playIcon.style.display = 'block';
    this.els.pauseIcon.style.display = 'none';
  }

  _bindSlider(sliderId, valueId, callback) {
    const slider = this.els[sliderId];
    const valueEl = this.els[valueId];
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value);
      valueEl.textContent = v;
      callback(v);
    });
  }

  setTheme(key) { this.els.themeSelector.value = key; }

  setObjectToggle(enabled) {
    this.els.objectToggle.checked = Boolean(enabled);
  }

  setCloneCount(count) {
    const c = Math.max(1, Math.min(10, Number(count) || 6));
    this.els.cloneCountSlider.value = String(c);
    this.els.cloneCountValue.textContent = String(c);
  }

  setObjectSize(scaleNorm) {
    const v = Math.max(2, Math.min(60, Math.round((Number(scaleNorm) || 0.3) * 100)));
    this.els.objectSizeSlider.value = String(v);
    this.els.objectSizeValue.textContent = String(v);
  }

  setObjectRotation(rotationDeg) {
    const x = Math.max(-180, Math.min(180, Math.round(Number(rotationDeg?.x) || 0)));
    const y = Math.max(-180, Math.min(180, Math.round(Number(rotationDeg?.y) || 0)));
    const z = Math.max(-180, Math.min(180, Math.round(Number(rotationDeg?.z) || 0)));
    this.els.objectRotXSlider.value = String(x);
    this.els.objectRotXValue.textContent = String(x);
    this.els.objectRotYSlider.value = String(y);
    this.els.objectRotYValue.textContent = String(y);
    this.els.objectRotZSlider.value = String(z);
    this.els.objectRotZValue.textContent = String(z);
  }

  setCloneFreeFly(enabled) {
    this.els.cloneFreeFlyToggle.checked = Boolean(enabled);
    this._updateGapSliderState(enabled);
  }

  setObjectGap(scaleNorm) {
    this._setSlider('objectGapSlider', 'objectGapValue', scaleNorm);
  }

  _updateGapSliderState(freeFlyEnabled) {
    if (!this.els.objectGapSlider) return;
    this.els.objectGapSlider.disabled = Boolean(freeFlyEnabled);
    const group = this.els.objectGapSlider.closest('.slider-group');
    if (group) group.style.opacity = freeFlyEnabled ? '0.4' : '1.0';
  }

  setPrimaryColor(hexColor) {
    this.els.primaryColor.value = hexColor;
    this._accentColor = hexColor;
  }

  setSecondaryColor(hexColor) {
    this.els.secondaryColor.value = hexColor;
  }

  setBackgroundColor(hexColor) {
    this.els.bgColor.value = hexColor;
  }

  setColorMode() { /* removed, using theme mode only */ }

  setKaleidoscopeMode(mode) {
    if (!this.els.kaleidoscopeItems) return;
    this.els.kaleidoscopeItems.forEach(btn => {
      const btnMode = parseInt(btn.getAttribute('data-mode'));
      if (btnMode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  setKaleidoscopeAutoMode(enabled) {
    if (this.els.kaleidoscopeAutoToggle) {
      this.els.kaleidoscopeAutoToggle.checked = Boolean(enabled);
    }
  }

  setLivePreset() { /* removed */ }
  setAutoMix() { /* removed */ }
  setObjectEnabled() { /* removed */ }
  setParticleShape() { /* removed */ }
  setObjectColorMode() { /* removed */ }
  setObjectDistance() { /* removed */ }
  setObjectColor() { /* removed */ }

  setCoreControls(values) {
    if (typeof values.speed === 'number') this._setSlider('speedSlider', 'speedValue', values.speed);
    if (typeof values.kaleidoscope === 'number') this._setSlider('kaleidoscopeSlider', 'kaleidoscopeValue', values.kaleidoscope);
  }

  applyLanguage(lang) {
    const t = this._translations[lang] || this._translations.vi;
    this._currentLanguage = lang;

    document.documentElement.lang = t.htmlLang;
    document.title = t.pageTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', t.pageDescription);

    this.els.labelAudio.textContent = t.sectionAudio;
    this.els.labelControls.textContent = t.sectionControls;
    this.els.labelTheme.textContent = t.sectionTheme;
    this.els.labelVolume.textContent = t.volume;
    this.els.labelSpeed.textContent = t.speed;
    this.els.labelSensitivity.textContent = t.sensitivity;
    this.els.labelKaleidoscope.textContent = t.kaleidoscope;
    if (this.els.labelKaleidoscopeAuto) this.els.labelKaleidoscopeAuto.textContent = t.kaleidoscopeAuto || t.autoMode;

    this.els.labelWave.textContent = t.wave;
    this.els.labelTwist.textContent = t.twist;
    this.els.labelChaos.textContent = t.chaos;
    this.els.labelPrimaryColor.textContent = t.primaryColor;
    this.els.labelSecondaryColor.textContent = t.secondaryColor;
    this.els.labelBgColor.textContent = t.backgroundColor;
    this.els.objectSizeLabel.textContent = t.objectSize;
    this.els.cloneCountLabel.textContent = t.cloneCount;
    this.els.cloneFreeFlyLabel.textContent = t.cloneFreeFly;
    if (this.els.labelObjectGap) this.els.labelObjectGap.textContent = t.objectGap || 'Khoảng cách';
    this.els.randomizeText.textContent = t.randomize;
    this.els.togglePanel.title = t.toggleTitle;
    this.els.langToggle.title = t.langTitle;
    this.els.langToggle.textContent = t.langBtn;

    if (!this.els.upload.files || this.els.upload.files.length === 0) {
      this.els.uploadText.textContent = t.upload;
    }
    if (!this.els.modelUpload.files || this.els.modelUpload.files.length === 0) {
      this.els.modelUploadText.textContent = t.uploadModel;
    }

    this.els.themeNeonCyberpunk.textContent = t.theme.neonCyberpunk;
    this.els.themePsychedelicRainbow.textContent = t.theme.psychedelicRainbow;
    this.els.themeLavaCore.textContent = t.theme.lavaCore;
    this.els.themeDeepOcean.textContent = t.theme.deepOcean;
    this.els.themeGoldenEmerald.textContent = t.theme.goldenEmerald;
    this.els.themeAcidTechno.textContent = t.theme.acidTechno;
    this.els.themeSunsetHorizon.textContent = t.theme.sunsetHorizon;
    this.els.themeVintageVapor.textContent = t.theme.vintageVapor;
  }

  setTunnelControls(values) {
    this._setSlider('waveSlider', 'waveValue', values.wave);
    this._setSlider('twistSlider', 'twistValue', values.twist);
    this._setSlider('chaosSlider', 'chaosValue', values.chaos);
  }

  setObjectControls(values) {
    this._setSlider('particleSlider', 'particleValue', values.particle);
    this._setSlider('objectBoostSlider', 'objectBoostValue', values.objectBoost);
  }

  _setSlider(sliderId, valueId, normalizedValue) {
    const slider = this.els[sliderId];
    const valueEl = this.els[valueId];
    if (!slider || !valueEl) return;

    const minVal = slider.hasAttribute('min') ? parseInt(slider.min) : 0;
    const maxVal = slider.hasAttribute('max') ? parseInt(slider.max) : 100;
    const v = Math.max(minVal, Math.min(maxVal, Math.round(normalizedValue * 100)));

    slider.value = String(v);
    valueEl.textContent = String(v);
  }

  drawVisualizer(frequencyData) {
    const now = performance.now();
    if (now - this._vizLastTime < 33) return; // cap UI visualizer to ~30 FPS
    this._vizLastTime = now;

    const ctx = this._vizCtx;
    const canvas = this.els.visualizerCanvas;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!frequencyData) return;

    const barCount = 64;
    const step = Math.floor(frequencyData.length / barCount);
    const barW = w / barCount;

    for (let i = 0; i < barCount; i++) {
      const val = frequencyData[i * step] / 255;
      const barH = val * h;
      ctx.fillStyle = this._accentColor + '88';
      ctx.fillRect(i * barW, h - barH, barW - 1, barH);
    }
  }

  updateFPS() {
    this._fpsFrames++;
    const now = performance.now();
    if (now - this._fpsTime >= 1000) {
      const fps = Math.round((this._fpsFrames * 1000) / (now - this._fpsTime));
      this.els.fpsCounter.textContent = `${fps} FPS`;
      this._fpsFrames = 0;
      this._fpsTime = now;
    }
  }
}

