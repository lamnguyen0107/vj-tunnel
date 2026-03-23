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
      objectRotXLabel: document.getElementById('label-object-rot-x'),
      objectRotXSlider: document.getElementById('object-rot-x-slider'),
      objectRotXValue: document.getElementById('object-rot-x-value'),
      objectRotYLabel: document.getElementById('label-object-rot-y'),
      objectRotYSlider: document.getElementById('object-rot-y-slider'),
      objectRotYValue: document.getElementById('object-rot-y-value'),
      objectRotZLabel: document.getElementById('label-object-rot-z'),
      objectRotZSlider: document.getElementById('object-rot-z-slider'),
      objectRotZValue: document.getElementById('object-rot-z-value'),
      objectSizeLabel: document.getElementById('label-object-size'),
      objectSizeSlider: document.getElementById('object-size-slider'),
      objectSizeValue: document.getElementById('object-size-value'),
      cloneFreeFlyLabel: document.getElementById('label-clone-freefly'),
      cloneFreeFlyToggle: document.getElementById('clone-freefly-toggle'),
      welcomeCopy: document.getElementById('welcome-copy'),
      labelAudio: document.getElementById('label-audio'),
      labelControls: document.getElementById('label-controls'),
      labelObjectSub: document.getElementById('label-object-sub'),
      labelSpeed: document.getElementById('label-speed'),
      labelSensitivity: document.getElementById('label-sensitivity'),
      labelKaleidoscope: document.getElementById('label-kaleidoscope'),
      labelKaleidoscopeAuto: document.getElementById('label-kaleidoscope-auto'),
      kaleidoscopeModeName: document.getElementById('label-kaleidoscope-mode-name'),
      labelWave: document.getElementById('label-wave'),
      labelTwist: document.getElementById('label-twist'),
      labelParticle: document.getElementById('label-particle'),
      labelObjectBoost: document.getElementById('label-object-boost'),
      labelChaos: document.getElementById('label-chaos'),
      labelParticleShape: document.getElementById('label-particle-shape'),
      labelObjectDistance: document.getElementById('label-object-distance'),
      labelAutomix: document.getElementById('label-automix'),
      labelObjectEnabled: document.getElementById('label-object-enabled'),
      labelColor: document.getElementById('label-color'),
      labelTunnelColorSub: document.getElementById('label-tunnel-color-sub'),
      labelObjectColorSub: document.getElementById('label-object-color-sub'),
      labelColorMode: document.getElementById('label-color-mode'),
      labelPrimaryColor: document.getElementById('label-primary-color'),
      labelSecondaryColor: document.getElementById('label-secondary-color'),
      labelBgColor: document.getElementById('label-bg-color'),
      labelObjectColorMode: document.getElementById('label-object-color-mode'),
      labelObjectColor: document.getElementById('label-object-color'),
      labelTheme: document.getElementById('label-theme'),
      labelLiveSet: document.getElementById('label-live-set'),
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
      waveSlider: document.getElementById('wave-slider'),
      waveValue: document.getElementById('wave-value'),
      twistSlider: document.getElementById('twist-slider'),
      twistValue: document.getElementById('twist-value'),
      particleSlider: document.getElementById('particle-slider'),
      particleValue: document.getElementById('particle-value'),
      objectBoostSlider: document.getElementById('object-boost-slider'),
      objectBoostValue: document.getElementById('object-boost-value'),
      chaosSlider: document.getElementById('chaos-slider'),
      chaosValue: document.getElementById('chaos-value'),
      particleShapeSelect: document.getElementById('particle-shape-select'),
      objectDistanceSelect: document.getElementById('object-distance-select'),
      automixToggle: document.getElementById('automix-toggle'),
      kaleidoscopeAutoToggle: document.getElementById('kaleidoscope-auto-toggle'),
      kaleidoscopeItems: document.querySelectorAll('.k-item'),
      objectEnabledToggle: document.getElementById('object-enabled-toggle'),
      colorModeSelect: document.getElementById('color-mode-select'),
      objectColorModeSelect: document.getElementById('object-color-mode-select'),
      primaryColor: document.getElementById('primary-color'),
      secondaryColor: document.getElementById('secondary-color'),
      bgColor: document.getElementById('bg-color'),
      objectColor: document.getElementById('object-color'),
      themeSelector: document.getElementById('theme-selector'),
      presetDrop: document.getElementById('preset-drop'),
      presetBreakdown: document.getElementById('preset-breakdown'),
      presetBuildUp: document.getElementById('preset-build-up'),
      randomizeBtn: document.getElementById('randomize-btn'),
      togglePanel: document.getElementById('toggle-panel'),
      panel: document.getElementById('ui-panel'),
      fpsCounter: document.getElementById('fps-counter'),
      visualizerCanvas: document.getElementById('visualizer-canvas'),
      themeNeonCyberpunk: document.getElementById('theme-neonCyberpunk'),
      themePsychedelicRainbow: document.getElementById('theme-psychedelicRainbow'),
      themeDarkIndustrial: document.getElementById('theme-darkIndustrial'),
      themeGalaxyWarp: document.getElementById('theme-galaxyWarp'),
      shapeMix: document.getElementById('shape-mix'),
      shapeSphere: document.getElementById('shape-sphere'),
      shapeBox: document.getElementById('shape-box'),
      shapeCylinder: document.getElementById('shape-cylinder'),
      shapeTorus: document.getElementById('shape-torus'),
      distanceNear: document.getElementById('distance-near'),
      distanceMid: document.getElementById('distance-mid'),
      distanceFar: document.getElementById('distance-far'),
      objectColorModeAuto: document.getElementById('object-color-mode-auto'),
      objectColorModeCustom: document.getElementById('object-color-mode-custom'),
    };

    this._vizCtx = this.els.visualizerCanvas.getContext('2d');
    this._vizLastTime = 0;
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
          darkIndustrial: 'Công nghiệp bóng tối',
          galaxyWarp: 'Xuyên ngân hà',
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
          darkIndustrial: 'Dark Industrial',
          galaxyWarp: 'Galaxy Warp',
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
    this._bindSlider('objectRotXSlider', 'objectRotXValue', v => this.callbacks.onObjectRotXChange(v));
    this._bindSlider('objectRotYSlider', 'objectRotYValue', v => this.callbacks.onObjectRotYChange(v));
    this._bindSlider('objectRotZSlider', 'objectRotZValue', v => this.callbacks.onObjectRotZChange(v));
    this.els.cloneFreeFlyToggle.addEventListener('change', e => this.callbacks.onCloneFreeFlyChange(e.target.checked));

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
    this._bindSlider('particleSlider', 'particleValue', v => this.callbacks.onParticleChange(v / 100));
    this._bindSlider('objectBoostSlider', 'objectBoostValue', v => this.callbacks.onObjectBoostChange(v / 100));
    this._bindSlider('chaosSlider', 'chaosValue', v => this.callbacks.onChaosChange(v / 100));
    this.els.particleShapeSelect.addEventListener('change', e => this.callbacks.onParticleShapeChange(e.target.value));
    this.els.objectDistanceSelect.addEventListener('change', e => this.callbacks.onObjectDistanceChange(e.target.value));
    this.els.automixToggle.addEventListener('change', e => this.callbacks.onAutoMixChange(e.target.checked));
    this.els.objectEnabledToggle.addEventListener('change', e => this.callbacks.onObjectEnabledChange(e.target.checked));

    // Color
    this.els.primaryColor.addEventListener('input', e => {
      this._accentColor = e.target.value;
      this.callbacks.onPrimaryColorChange(e.target.value);
    });
    this.els.secondaryColor.addEventListener('input', e => this.callbacks.onSecondaryColorChange(e.target.value));
    this.els.bgColor.addEventListener('input', e => this.callbacks.onBgColorChange(e.target.value));
    this.els.objectColor.addEventListener('input', e => this.callbacks.onObjectColorChange(e.target.value));
    this.els.colorModeSelect.addEventListener('change', e => this.callbacks.onColorModeChange(e.target.value));
    this.els.objectColorModeSelect.addEventListener('change', e => this.callbacks.onObjectColorModeChange(e.target.value));

    // Theme
    this.els.themeSelector.addEventListener('change', e => this.callbacks.onThemeChange(e.target.value));

    // Randomize
    this.els.randomizeBtn.addEventListener('click', () => this.callbacks.onRandomize());

    // Live preset bank
    this.els.presetDrop.addEventListener('click', () => this.callbacks.onLivePresetChange('drop'));
    this.els.presetBreakdown.addEventListener('click', () => this.callbacks.onLivePresetChange('breakdown'));
    this.els.presetBuildUp.addEventListener('click', () => this.callbacks.onLivePresetChange('buildUp'));

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

  setObjectColor(hexColor) {
    this.els.objectColor.value = hexColor;
  }

  setColorMode(mode) {
    const value = mode === 'custom' ? 'custom' : 'theme';
    this.els.colorModeSelect.value = value;
    const disable = value === 'theme';
    this.els.primaryColor.disabled = disable;
    this.els.secondaryColor.disabled = disable;
    this.els.bgColor.disabled = disable;
  }

  setKaleidoscopeMode(mode) {
    if (!this.els.kaleidoscopeItems) return;
    this.els.kaleidoscopeItems.forEach(btn => {
      const btnMode = parseInt(btn.getAttribute('data-mode'));
      if (btnMode === mode) {
        btn.classList.add('active');
        // Update label
        const modeNames = this._translations[this._currentLanguage]?.kaleidoscopeModes;
        if (this.els.kaleidoscopeModeName && modeNames && modeNames[mode]) {
          this.els.kaleidoscopeModeName.textContent = modeNames[mode];
        }
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

  setLivePreset(presetKey) {
    const btns = [
      this.els.presetDrop,
      this.els.presetBreakdown,
      this.els.presetBuildUp,
    ];
    btns.forEach(btn => btn.classList.remove('preset-btn-active'));
    if (presetKey === 'drop') this.els.presetDrop.classList.add('preset-btn-active');
    if (presetKey === 'breakdown') this.els.presetBreakdown.classList.add('preset-btn-active');
    if (presetKey === 'buildUp') this.els.presetBuildUp.classList.add('preset-btn-active');
  }

  setAutoMix(enabled) {
    this.els.automixToggle.checked = Boolean(enabled);
  }

  setObjectEnabled(enabled) {
    this.els.objectEnabledToggle.checked = Boolean(enabled);
  }

  setParticleShape(shapeKey) {
    this.els.particleShapeSelect.value = shapeKey || 'mix';
  }

  setObjectColorMode(mode) {
    const value = mode === 'custom' ? 'custom' : 'auto';
    this.els.objectColorModeSelect.value = value;
    this.els.objectColor.disabled = value !== 'custom';
  }

  setObjectDistance(distanceKey) {
    this.els.objectDistanceSelect.value = distanceKey || 'mid';
  }

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

    this.els.welcomeCopy.textContent = t.welcome;
    this.els.labelAudio.textContent = t.sectionAudio;
    this.els.labelControls.textContent = t.sectionControls;
    this.els.labelObjectSub.textContent = t.sectionObjectSub;
    this.els.labelColor.textContent = t.sectionColor;
    this.els.labelTunnelColorSub.textContent = t.sectionTunnelColorSub;
    this.els.labelObjectColorSub.textContent = t.sectionObjectColorSub;
    this.els.labelColorMode.textContent = t.colorMode;
    this.els.labelTheme.textContent = t.sectionTheme;
    this.els.labelLiveSet.textContent = t.sectionLiveSet;
    this.els.labelVolume.textContent = t.volume;
    this.els.labelSpeed.textContent = t.speed;
    this.els.labelSensitivity.textContent = t.sensitivity;
    this.els.labelKaleidoscope.textContent = t.kaleidoscope;
    if (this.els.labelKaleidoscopeAuto) this.els.labelKaleidoscopeAuto.textContent = t.kaleidoscopeAuto;

    this.els.labelWave.textContent = t.wave;
    this.els.labelTwist.textContent = t.twist;
    this.els.labelParticle.textContent = t.particle;
    this.els.labelObjectBoost.textContent = t.objectBoost;
    this.els.labelChaos.textContent = t.chaos;
    this.els.labelParticleShape.textContent = t.particleShape;
    this.els.labelObjectDistance.textContent = t.objectDistance;
    this.els.labelAutomix.textContent = t.automix;
    this.els.labelObjectEnabled.textContent = t.objectEnabled;
    this.els.labelPrimaryColor.textContent = t.primaryColor;
    this.els.labelSecondaryColor.textContent = t.secondaryColor;
    this.els.labelBgColor.textContent = t.backgroundColor;
    this.els.labelObjectColorMode.textContent = t.objectColorMode;
    this.els.labelObjectColor.textContent = t.objectColor;
    this.els.objectSizeLabel.textContent = t.objectSize;
    this.els.objectRotXLabel.textContent = t.objectRotX;
    this.els.objectRotYLabel.textContent = t.objectRotY;
    this.els.objectRotZLabel.textContent = t.objectRotZ;
    this.els.cloneCountLabel.textContent = t.cloneCount;
    this.els.cloneFreeFlyLabel.textContent = t.cloneFreeFly;
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
    this.els.themeDarkIndustrial.textContent = t.theme.darkIndustrial;
    this.els.themeGalaxyWarp.textContent = t.theme.galaxyWarp;
    this.els.presetDrop.textContent = t.preset.drop;
    this.els.presetBreakdown.textContent = t.preset.breakdown;
    this.els.presetBuildUp.textContent = t.preset.buildUp;
    this.els.shapeMix.textContent = t.shape.mix;
    this.els.shapeSphere.textContent = t.shape.sphere;
    this.els.shapeBox.textContent = t.shape.box;
    this.els.shapeCylinder.textContent = t.shape.cylinder;
    this.els.shapeTorus.textContent = t.shape.torus;
    this.els.distanceNear.textContent = t.distance.near;
    this.els.distanceMid.textContent = t.distance.mid;
    this.els.distanceFar.textContent = t.distance.far;
    const modeTheme = document.getElementById('color-mode-theme');
    const modeCustom = document.getElementById('color-mode-custom');
    if (modeTheme) modeTheme.textContent = t.modeTheme;
    if (modeCustom) modeCustom.textContent = t.modeCustom;
    this.els.objectColorModeAuto.textContent = t.objectColorModeAuto;
    this.els.objectColorModeCustom.textContent = t.objectColorModeCustom;
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
    const v = Math.max(0, Math.min(100, Math.round(normalizedValue * 100)));
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

