// Unified v3 AudioEngine: Speech (../audio/manifest.json + ../audio/words/ + speechSynthesis fallback),
// synthesized Web Audio SFX (including nitro, jump, overtake, shatter, powerups), and pitch-reactive music.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.engineGain = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;

    this.unlocked = false;
    this.manifest = {};
    this.voices = [];
    this.activeAudioEl = null;
    this.duckTimer = null;
    this.isSpeaking = false;
    this.nitroPitchActive = false;

    this.settings = {
      sound: true,
      music: true,
      voiceSpeed: 'normal'
    };

    this.musicTimer = null;
    this.musicStep = 0;
    this.nextNoteTime = 0;
    this.musicPlaying = false;

    this._loadManifest();
    this._initVoices();
  }

  async _loadManifest() {
    try {
      const url = new URL('../../audio/manifest.json', import.meta.url).href;
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          this.manifest = data;
        }
      }
    } catch {
      // Fallback to speechSynthesis if manifest is unavailable
    }
  }

  _initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.voices = [];
      }
    };
    load();
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  _pickVoice() {
    if (!this.voices.length && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.voices = [];
      }
    }
    const priorities = ['Google US English', 'Samantha', 'Aria', 'Jenny'];
    for (const target of priorities) {
      const match = this.voices.find((v) => v.name && v.name.includes(target));
      if (match) return match;
    }
    const enUS = this.voices.find(
      (v) => v.lang && (v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en_us')
    );
    if (enUS) return enUS;
    return this.voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) || null;
  }

  syncSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    if (this.sfxGain && this.ctx) {
      const targetSfx = this.settings.sound ? 0.85 : 0;
      this.sfxGain.gain.setTargetAtTime(targetSfx, this.ctx.currentTime, 0.03);
    }
    if (this.musicGain && this.ctx) {
      const targetMusic = this.settings.music ? (this.isSpeaking ? 0.05 : 0.16) : 0;
      this.musicGain.gain.setTargetAtTime(targetMusic, this.ctx.currentTime, 0.06);
    }
    if (this.settings.music && this.unlocked && !this.musicPlaying) {
      this.startMusic();
    } else if (!this.settings.music && this.musicPlaying) {
      this.stopMusic();
    }
  }

  unlock() {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx && !this.ctx) {
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.9;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.settings.sound ? 0.85 : 0;
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.settings.music ? 0.16 : 0;
        this.musicGain.connect(this.masterGain);

        this._setupEngineNodes();
      } catch {
        this.ctx = null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.unlocked) {
      this.unlocked = true;
      if ('speechSynthesis' in window) {
        try {
          this.voices = window.speechSynthesis.getVoices() || [];
        } catch {
          // ignore
        }
      }
      if (this.settings.music) {
        this.startMusic();
      }
    }
  }

  _setupEngineNodes() {
    if (!this.ctx) return;
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 180;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;

    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'triangle';
    this.engineOsc1.frequency.value = 65;

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'sawtooth';
    this.engineOsc2.frequency.value = 130;

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.25;

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(subGain);
    subGain.connect(this.engineFilter);

    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  setNitroPitch(active) {
    this.nitroPitchActive = Boolean(active);
  }

  updateEngine(speed, active, boosted, nitro = false) {
    if (!this.ctx || !this.engineGain || !this.engineOsc1 || !this.engineOsc2) return;
    if (this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    if (!active || !this.settings.sound) {
      this.engineGain.gain.setTargetAtTime(0, now, 0.08);
      return;
    }

    const baseFreq = 58 + speed * 38 + (boosted ? 22 : 0) + (nitro ? 42 : 0);
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.06);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.06);
    this.engineFilter.frequency.setTargetAtTime(nitro ? 540 : boosted ? 360 : 210, now, 0.06);
    this.engineGain.gain.setTargetAtTime(nitro ? 0.11 : boosted ? 0.085 : 0.055, now, 0.06);
  }

  _duckMusic(active) {
    this.isSpeaking = active;
    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
      this.duckTimer = null;
    }
    if (this.ctx && this.musicGain) {
      const target = this.settings.music ? (active ? 0.045 : 0.16) : 0;
      this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
    }
    if (active) {
      this.duckTimer = setTimeout(() => {
        this._duckMusic(false);
      }, 2600);
    }
  }

  speak(text) {
    if (!text) return;
    const clean = String(text).trim();
    if (!clean) return;

    if (this.activeAudioEl) {
      try {
        this.activeAudioEl.pause();
        this.activeAudioEl.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeAudioEl = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    const manifestFile = this.manifest[clean] || this.manifest[clean.toLowerCase()];
    if (manifestFile) {
      try {
        const clipUrl = new URL(`../../audio/words/${manifestFile}`, import.meta.url).href;
        const audio = new Audio(clipUrl);
        this.activeAudioEl = audio;
        this._duckMusic(true);
        audio.onended = () => this._duckMusic(false);
        audio.onerror = () => {
          this._duckMusic(false);
          this._speakFallback(clean);
        };
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            this._duckMusic(false);
            this._speakFallback(clean);
          });
        }
        return;
      } catch {
        this._duckMusic(false);
      }
    }

    this._speakFallback(clean);
  }

  _speakFallback(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      const voice = this._pickVoice();
      if (voice) utter.voice = voice;
      utter.rate = this.settings.voiceSpeed === 'slow' ? 0.7 : 0.9;
      utter.pitch = 1.05;
      this._duckMusic(true);
      utter.onend = () => this._duckMusic(false);
      utter.onerror = () => this._duckMusic(false);
      window.speechSynthesis.speak(utter);
    } catch {
      this._duckMusic(false);
    }
  }

  playSfx(type, comboLevel = 1) {
    if (!this.settings.sound || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'click':
        this._tone(560, 740, 0.06, 'sine', 0.14, now);
        break;
      case 'countdown':
        this._tone(523.25, 523.25, 0.13, 'triangle', 0.22, now);
        break;
      case 'go':
        this._tone(523.25, 783.99, 0.18, 'triangle', 0.24, now);
        this._tone(783.99, 1046.5, 0.25, 'sine', 0.22, now + 0.07);
        break;
      case 'coin': {
        const pitch = 1 + Math.min(0.3, (comboLevel - 1) * 0.06);
        this._tone(987.77 * pitch, 1318.51 * pitch, 0.1, 'sine', 0.16, now);
        this._tone(1318.51 * pitch, 1318.51 * pitch, 0.13, 'sine', 0.12, now + 0.06);
        break;
      }
      case 'correct': {
        const step = comboLevel >= 6 ? 1.25 : comboLevel >= 4 ? 1.12 : comboLevel >= 2 ? 1.06 : 1.0;
        this._tone(523.25 * step, 523.25 * step, 0.1, 'triangle', 0.2, now);
        this._tone(659.25 * step, 659.25 * step, 0.1, 'triangle', 0.2, now + 0.06);
        this._tone(783.99 * step, 1046.5 * step, 0.2, 'triangle', 0.22, now + 0.12);
        if (comboLevel >= 6) {
          this._tone(1318.51, 1567.98, 0.22, 'sine', 0.18, now + 0.18);
        }
        break;
      }
      case 'boost':
        this._noiseSweep(0.32, 300, 2200, 0.16, now);
        this._tone(240, 620, 0.26, 'sawtooth', 0.1, now);
        break;
      case 'nitro':
        this._noiseSweep(0.7, 240, 3600, 0.24, now);
        this._tone(180, 880, 0.45, 'sawtooth', 0.16, now);
        this._tone(440, 1174.66, 0.5, 'triangle', 0.18, now + 0.08);
        break;
      case 'jump':
        this._tone(260, 740, 0.28, 'sine', 0.2, now);
        this._tone(390, 980, 0.24, 'triangle', 0.14, now + 0.04);
        break;
      case 'land':
        this._tone(160, 80, 0.14, 'triangle', 0.22, now);
        this._noiseSweep(0.22, 400, 1800, 0.14, now + 0.04);
        break;
      case 'powerup':
        this._tone(587.33, 587.33, 0.08, 'sine', 0.18, now);
        this._tone(783.99, 783.99, 0.08, 'sine', 0.18, now + 0.06);
        this._tone(1046.5, 1318.51, 0.2, 'triangle', 0.2, now + 0.12);
        break;
      case 'shield':
        this._tone(659.25, 987.77, 0.18, 'sine', 0.2, now);
        this._tone(987.77, 659.25, 0.2, 'triangle', 0.16, now + 0.09);
        break;
      case 'nearmiss':
        this._noiseSweep(0.16, 1600, 500, 0.14, now);
        this._tone(880, 1174.66, 0.12, 'sine', 0.15, now);
        break;
      case 'overtake':
        this._tone(523.25, 783.99, 0.12, 'triangle', 0.22, now);
        this._tone(783.99, 1046.5, 0.22, 'triangle', 0.24, now + 0.09);
        break;
      case 'shatter':
        this._noiseSweep(0.16, 1800, 420, 0.16, now);
        this._tone(320, 160, 0.15, 'triangle', 0.18, now);
        break;
      case 'boss':
        this._tone(146.83, 130.81, 0.35, 'sawtooth', 0.14, now);
        this._tone(220.0, 293.66, 0.38, 'triangle', 0.18, now + 0.06);
        break;
      case 'wrong':
        this._tone(310, 220, 0.16, 'sine', 0.18, now);
        this._tone(220, 175, 0.22, 'sine', 0.16, now + 0.12);
        break;
      case 'obstacle':
        this._tone(190, 110, 0.18, 'triangle', 0.2, now);
        break;
      case 'star':
        this._tone(659.25, 880, 0.14, 'triangle', 0.2, now);
        this._tone(880, 1174.66, 0.2, 'sine', 0.18, now + 0.08);
        break;
      case 'confetti':
        this._noiseSweep(0.18, 900, 3200, 0.12, now);
        this._tone(523.25, 659.25, 0.12, 'triangle', 0.2, now);
        this._tone(659.25, 783.99, 0.12, 'triangle', 0.2, now + 0.08);
        this._tone(783.99, 1046.5, 0.28, 'sine', 0.22, now + 0.16);
        break;
      case 'unlock':
        this._tone(440, 554.37, 0.12, 'triangle', 0.2, now);
        this._tone(554.37, 659.25, 0.12, 'triangle', 0.2, now + 0.09);
        this._tone(659.25, 880, 0.24, 'sine', 0.22, now + 0.18);
        break;
      default:
        break;
    }
  }

  _tone(fStart, fEnd, duration, wave, volume, startTime) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(fStart, startTime);
    if (fEnd !== fStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), startTime + duration);
    }
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  _noiseSweep(duration, freqStart, freqEnd, volume, startTime) {
    if (!this.ctx || !this.sfxGain) return;
    const sampleCount = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, sampleCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.6;
    filter.frequency.setValueAtTime(freqStart, startTime);
    filter.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(startTime);
  }

  startMusic() {
    if (!this.ctx || !this.settings.music || this.musicPlaying) return;
    this.musicPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.musicTimer = setInterval(() => this._scheduleMusic(), 80);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  pauseAll() {
    this.updateEngine(0, false, false, false);
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  resumeAll() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  _scheduleMusic() {
    if (!this.ctx || !this.musicPlaying || this.ctx.state !== 'running') return;

    const melody = [
      523.25, 0, 659.25, 783.99, 659.25, 0, 523.25, 587.33,
      659.25, 0, 783.99, 880.0, 783.99, 659.25, 587.33, 0,
      523.25, 0, 659.25, 783.99, 1046.5, 0, 880.0, 783.99,
      659.25, 587.33, 523.25, 587.33, 659.25, 0, 523.25, 0
    ];
    const bass = [
      130.81, 0, 196.0, 0, 130.81, 0, 196.0, 0,
      146.83, 0, 220.0, 0, 196.0, 0, 146.83, 0,
      174.61, 0, 261.63, 0, 164.81, 0, 246.94, 0,
      146.83, 0, 196.0, 0, 130.81, 0, 196.0, 0
    ];

    const pitchMult = this.nitroPitchActive ? 1.189 : 1.0;
    const stepDur = this.nitroPitchActive ? 0.145 : 0.18;

    while (this.nextNoteTime < this.ctx.currentTime + 0.25) {
      const idx = this.musicStep % melody.length;
      const mFreq = melody[idx];
      const bFreq = bass[idx];

      if (mFreq > 0) {
        this._musicNote(mFreq * pitchMult, stepDur * 0.8, 'triangle', 0.22, this.nextNoteTime);
      }
      if (bFreq > 0) {
        this._musicNote(bFreq * pitchMult, stepDur * 0.9, 'sine', 0.26, this.nextNoteTime);
      }

      this.nextNoteTime += stepDur;
      this.musicStep++;
    }
  }

  _musicNote(freq, dur, wave, vol, when) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.001, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }
}
