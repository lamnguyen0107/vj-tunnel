/* ======================================================
   audio.js — Web Audio API analyzer
   
   Handles:
   - Audio file loading & decoding
   - Real-time FFT analysis
   - Frequency band extraction (bass, mid, high)
   - Smoothed output for visual easing
   ====================================================== */

export class AudioAnalyzer {
  constructor() {
    this.context = null;
    this.analyser = null;
    this.gainNode = null;
    this.source = null;
    this.buffer = null;
    this.dataArray = null;
    this.bufferLength = 0;

    // Smoothed band outputs (0–1)
    this.bass = 0;
    this.mid = 0;
    this.high = 0;
    this._prevBass = 0;
    this._prevMid = 0;
    this._prevHigh = 0;

    this.sensitivity = 1.0;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
  }

  /** Initialize AudioContext on first user gesture. */
  _ensureContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.52;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      
      this.gainNode = this.context.createGain();
      this.gainNode.gain.setValueAtTime(1.0, this.context.currentTime);
      
      // source -> analyser -> gainNode -> destination
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);
    }
  }

  setVolume(normalizedValue) {
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(normalizedValue, this.context.currentTime, 0.015);
    }
  }

  /** Load audio file. */
  async loadFile(file) {
    this._ensureContext();
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    this.stop();
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.context.decodeAudioData(arrayBuffer);
    this.pauseOffset = 0;
  }

  /** Start or resume playback. */
  async play() {
    this._ensureContext();
    if (!this.buffer || this.isPlaying) return;
    if (this.context.state === 'suspended') await this.context.resume();

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.analyser);
    this.source.loop = true;
    this.source.start(0, this.pauseOffset);
    this.startTime = this.context.currentTime - this.pauseOffset;
    this.isPlaying = true;
  }

  /** Pause playback. */
  pause() {
    if (!this.isPlaying || !this.source) return;
    this.source.stop();
    this.source.disconnect();
    this.source = null;
    this.pauseOffset = this.context.currentTime - this.startTime;
    this.isPlaying = false;
  }

  /** Stop fully. */
  stop() {
    if (this.source) {
      try { this.source.stop(); } catch (_) {}
      this.source.disconnect();
      this.source = null;
    }
    this.isPlaying = false;
    this.pauseOffset = 0;
  }

  setSensitivity(value) { this.sensitivity = value; }

  /** Call once per frame to extract band levels. */
  update() {
    if (!this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);

    const len = this.bufferLength;
    const bassEnd = Math.floor(len * 0.12);
    const midEnd = Math.floor(len * 0.45);

    let bassSum = 0, midSum = 0, highSum = 0;
    for (let i = 0; i < len; i++) {
      const v = this.dataArray[i] / 255;
      if (i < bassEnd) bassSum += v;
      else if (i < midEnd) midSum += v;
      else highSum += v;
    }

    const rawBass = (bassSum / bassEnd) * this.sensitivity;
    const rawMid = (midSum / (midEnd - bassEnd)) * this.sensitivity;
    const rawHigh = (highSum / (len - midEnd)) * this.sensitivity;

    // Asymmetric easing: fast attack, slow release
    this.bass = this._ease(this._prevBass, rawBass);
    this.mid = this._ease(this._prevMid, rawMid);
    this.high = this._ease(this._prevHigh, rawHigh);

    this._prevBass = this.bass;
    this._prevMid = this.mid;
    this._prevHigh = this.high;
  }

  _ease(prev, target) {
    // Slower attack (0.65 -> 0.45) and release (0.18 -> 0.12) for smoother tunnel motion
    const speed = target > prev ? 0.45 : 0.12; 
    return prev + (target - prev) * speed;
  }

  /** Get raw data for UI visualizer. */
  getFrequencyData() { return this.dataArray; }
}
