/**
 * Procedural 8-bit Sound Synthesizer & Coastal Chiptune BGM using Web Audio API
 * Generates continuous smooth road-rolling whir, retro audio effects, and
 * a cheerful, nostalgic GBA coastal cycling background melody (BGM) with
 * smooth dynamic acoustic ducking during portfolio overlay browsing.
 */
class PixelSoundManager {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private stepToggle = false;
  private soundEnabled = true;

  // Continuous Bicycle Rolling Audio Nodes
  private bikeNoiseSource: AudioBufferSourceNode | null = null;
  private bikeNoiseFilter: BiquadFilterNode | null = null;
  private bikeNoiseGain: GainNode | null = null;
  private bikeOsc: OscillatorNode | null = null;
  private bikeOscFilter: BiquadFilterNode | null = null;
  private bikeOscGain: GainNode | null = null;
  private bikeIsRolling = false;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;

  // 8-bit Coastal Chiptune BGM Engine
  private bgmMasterGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private bgmSchedulerTimer: ReturnType<typeof setInterval> | null = null;
  private bgmStartTime = 0;
  private bgmScheduledBeat = 0;
  private bgmIsPlaying = false;
  private bgmDucked = false;

  // Continuous Ambient Ocean Wave Wash Nodes
  private oceanSource: AudioBufferSourceNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanLFO: OscillatorNode | null = null;
  private oceanLFOGain: GainNode | null = null;
  private seagullTimer: ReturnType<typeof setTimeout> | null = null;

  // BPM: 122 BPM -> 0.4918s per beat, 0.12295s per 16th note
  private readonly SECONDS_PER_BEAT = 60 / 122;
  private readonly TOTAL_BEATS = 64; // 16 bars * 4 beats = 64 beats = ~31.5s loop

  constructor() {
    // Lazy initialize on first user interaction
    if (typeof window !== 'undefined') {
      const initAudio = () => {
        this.ensureContext();
        window.removeEventListener('keydown', initAudio);
        window.removeEventListener('pointerdown', initAudio);
        window.removeEventListener('touchstart', initAudio);
      };
      window.addEventListener('keydown', initAudio, { once: true });
      window.addEventListener('pointerdown', initAudio, { once: true });
      window.addEventListener('touchstart', initAudio, { once: true });
    }
  }

  /**
   * Explicitly activate audio on start button click
   */
  public startAudio() {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (this.isEnabled() && !this.bgmIsPlaying && ctx) {
      this.startBGMScheduler();
    }
  }

  /**
   * Connect world store updates cleanly without circular module import
   */
  public connectStore(store: {
    getState: () => { soundEnabled: boolean; isOverlayOpen: boolean; currentView: string };
    subscribe: (listener: (state: any, prevState: any) => void) => () => void;
  }): () => void {
    if (!store) return () => {};
    const initialState = store.getState();
    this.setSoundEnabled(initialState.soundEnabled);
    const initialDucked = initialState.isOverlayOpen || initialState.currentView !== 'game';
    this.updateBGMDucking(initialDucked);

    return store.subscribe((state, prevState) => {
      if (state.soundEnabled !== prevState.soundEnabled) {
        this.setSoundEnabled(state.soundEnabled);
      }
      const isDucked = state.isOverlayOpen || state.currentView !== 'game';
      const wasDucked = prevState.isOverlayOpen || prevState.currentView !== 'game';
      if (isDucked !== wasDucked) {
        this.updateBGMDucking(isDucked);
      }
    });
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.setBGMEnabled(enabled);
    if (this.oceanGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.oceanGain.gain.setTargetAtTime(enabled ? 0.045 : 0.0001, now, 0.1);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.generateNoiseBuffer();
        this.initBGM(this.ctx);
        this.initOceanWaves(this.ctx);
        this.startSeagullLoop();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isEnabled(): boolean {
    return this.soundEnabled;
  }

  private generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of smooth noise
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pink/Brown noise filtered for smooth road texture
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
  }

  // =========================================================================
  // 1. PROCEDURAL OCEAN WAVE AMBIENCE (海浪潮汐声)
  // =========================================================================

  private initOceanWaves(ctx: AudioContext) {
    if (this.oceanGain || !this.noiseBuffer) return;

    // Loop noise buffer continuously for sea wash
    this.oceanSource = ctx.createBufferSource();
    this.oceanSource.buffer = this.noiseBuffer;
    this.oceanSource.loop = true;

    // Resonant lowpass filter to mimic surging coastal tide
    this.oceanFilter = ctx.createBiquadFilter();
    this.oceanFilter.type = 'lowpass';
    this.oceanFilter.frequency.setValueAtTime(320, ctx.currentTime);
    this.oceanFilter.Q.setValueAtTime(2.2, ctx.currentTime);

    // Ocean Gain
    this.oceanGain = ctx.createGain();
    const initVol = this.isEnabled() ? 0.045 : 0.0001;
    this.oceanGain.gain.setValueAtTime(initVol, ctx.currentTime);

    // LFO gently sweeping the filter cutoff between 160Hz and 620Hz every 7.5 seconds
    this.oceanLFO = ctx.createOscillator();
    this.oceanLFO.type = 'sine';
    this.oceanLFO.frequency.setValueAtTime(0.133, ctx.currentTime); // ~7.5s cycle

    this.oceanLFOGain = ctx.createGain();
    this.oceanLFOGain.gain.setValueAtTime(230, ctx.currentTime);

    this.oceanLFO.connect(this.oceanLFOGain);
    this.oceanLFOGain.connect(this.oceanFilter.frequency);

    // Connect audio chain
    this.oceanSource.connect(this.oceanFilter);
    this.oceanFilter.connect(this.oceanGain);
    this.oceanGain.connect(ctx.destination);

    this.oceanSource.start();
    this.oceanLFO.start();
  }

  // =========================================================================
  // 2. PROCEDURAL SEAGULL CALLS (海鸥鸣叫)
  // =========================================================================

  private startSeagullLoop() {
    if (this.seagullTimer) return;
    const scheduleNext = () => {
      // Random interval between 14s and 26s
      const delay = (14 + Math.random() * 12) * 1000;
      this.seagullTimer = setTimeout(() => {
        if (this.isEnabled() && !this.bgmDucked) {
          this.playSeagullChirp();
        }
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }

  /**
   * Procedural coastal seagull chirp ("kwee-kwee!")
   */
  public playSeagullChirp() {
    if (!this.isEnabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chirps = [
      { startOffset: 0, duration: 0.26, baseFreq: 2100, peakFreq: 2750, endFreq: 2200 },
      { startOffset: 0.28, duration: 0.32, baseFreq: 2250, peakFreq: 3050, endFreq: 2350 }
    ];

    chirps.forEach((c) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const t = now + c.startOffset;

      osc.frequency.setValueAtTime(c.baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(c.peakFreq, t + c.duration * 0.35);
      osc.frequency.exponentialRampToValueAtTime(c.endFreq, t + c.duration);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.038, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + c.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + c.duration + 0.02);
    });
  }

  // =========================================================================
  // 3. PROCEDURAL CAT MEOW (小镇猫咪叫声与呼噜声)
  // =========================================================================

  /**
   * Procedural 8-bit cute cat meow ("m-ee-oo-ww~" with throaty purr)
   */
  public playCatMeow() {
    if (!this.isEnabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Primary vocal tone (triangle, melodic meow contour: 580Hz -> 1020Hz -> 640Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.linearRampToValueAtTime(620, now + 0.04);
    osc1.frequency.exponentialRampToValueAtTime(1020, now + 0.16);
    osc1.frequency.exponentialRampToValueAtTime(640, now + 0.46);

    // 2. Harmonic overtone (sine, adds cute formant clarity)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1160, now);
    osc2.frequency.exponentialRampToValueAtTime(1920, now + 0.16);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.46);

    // 3. Throaty purr vibrato LFO
    const purrLFO = ctx.createOscillator();
    const purrLFOGain = ctx.createGain();
    purrLFO.type = 'sine';
    purrLFO.frequency.setValueAtTime(22, now); // 22Hz purr flutter
    purrLFOGain.gain.setValueAtTime(28, now);
    purrLFO.connect(purrLFOGain);
    purrLFOGain.connect(osc1.frequency);
    purrLFO.start(now + 0.08);
    purrLFO.stop(now + 0.48);

    // Volume envelopes (audible & warm, gain ~0.22)
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain1.gain.setValueAtTime(0.20, now + 0.22);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.50);

    osc2.start(now);
    osc2.stop(now + 0.46);

    // 4. Subtle warm chest purr (low 85Hz hum with gentle tremolo)
    const purrChest = ctx.createOscillator();
    const purrGain = ctx.createGain();
    purrChest.type = 'triangle';
    purrChest.frequency.setValueAtTime(85, now);

    const tremolo = ctx.createOscillator();
    const tremoloGain = ctx.createGain();
    tremolo.type = 'sine';
    tremolo.frequency.setValueAtTime(20, now);
    tremoloGain.gain.setValueAtTime(0.04, now);
    tremolo.connect(tremoloGain);
    tremoloGain.connect(purrGain.gain);

    purrGain.gain.setValueAtTime(0.0001, now + 0.1);
    purrGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    purrGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    purrChest.connect(purrGain);
    purrGain.connect(ctx.destination);

    tremolo.start(now + 0.1);
    tremolo.stop(now + 0.66);
    purrChest.start(now + 0.1);
    purrChest.stop(now + 0.66);
  }

  // =========================================================================
  // 4. 8-BIT COASTAL CHIPTUNE BGM SYNTHESIS
  // =========================================================================

  private initBGM(ctx: AudioContext) {
    if (this.bgmMasterGain) return;

    // Filter node allows warm low-pass ducking when reading portfolio case studies
    this.bgmFilter = ctx.createBiquadFilter();
    this.bgmFilter.type = 'lowpass';
    this.bgmFilter.frequency.setValueAtTime(2200, ctx.currentTime);

    this.bgmMasterGain = ctx.createGain();
    const targetGain = this.isEnabled() ? 0.15 : 0.0001;
    this.bgmMasterGain.gain.setValueAtTime(targetGain, ctx.currentTime);

    this.bgmFilter.connect(this.bgmMasterGain);
    this.bgmMasterGain.connect(ctx.destination);

    this.startBGMScheduler();
  }

  private startBGMScheduler() {
    if (this.bgmSchedulerTimer || !this.ctx) return;

    this.bgmStartTime = this.ctx.currentTime + 0.1;
    this.bgmScheduledBeat = 0;
    this.bgmIsPlaying = true;

    // Lookahead scheduler runs every 40ms, scheduling 250ms into the future
    this.bgmSchedulerTimer = setInterval(() => {
      this.processBGMSchedule();
    }, 40);
  }

  private processBGMSchedule() {
    if (!this.ctx || !this.bgmIsPlaying) return;

    const currentTime = this.ctx.currentTime;
    const lookaheadTime = currentTime + 0.35; // 350ms schedule horizon

    while (true) {
      const beatTime = this.bgmStartTime + this.bgmScheduledBeat * this.SECONDS_PER_BEAT;
      if (beatTime > lookaheadTime) break;

      // Wrap-around modulo 64 beats (16 bars)
      const loopBeat = this.bgmScheduledBeat % this.TOTAL_BEATS;

      // Schedule all musical voices on this beat
      this.scheduleMusicalStep(this.ctx, loopBeat, beatTime);

      this.bgmScheduledBeat++;
    }
  }

  /**
   * Schedules Bass, Sunlight Arpeggio chords, and Breezy Lead Melody
   */
  private scheduleMusicalStep(ctx: AudioContext, beat: number, time: number) {
    if (!this.bgmFilter) return;

    const bar = Math.floor(beat / 4);
    const beatInBar = beat % 4;

    // -----------------------------------------------------------------------
    // Voice 1: Warm Triangle Walking Bassline (Key: C / G / Am / F)
    // -----------------------------------------------------------------------
    // Bass note roots per bar
    const bassRoots = [
      130.81, // Bar 0: C3
      164.81, // Bar 1: E3
      174.61, // Bar 2: F3
      196.00, // Bar 3: G3
      110.00, // Bar 4: A2
      164.81, // Bar 5: E3
      174.61, // Bar 6: F3
      196.00, // Bar 7: G3
      174.61, // Bar 8: F3
      196.00, // Bar 9: G3
      164.81, // Bar 10: E3
      110.00, // Bar 11: A2
      146.83, // Bar 12: D3
      164.81, // Bar 13: E3
      174.61, // Bar 14: F3
      196.00  // Bar 15: G3 (resolves to C3)
    ];

    const rootFreq = bassRoots[bar] || 130.81;

    // Bouncy syncopated bass on beat 0 and beat 2.5
    if (beatInBar === 0) {
      this.playSynthTone(ctx, 'triangle', rootFreq, time, this.SECONDS_PER_BEAT * 0.9, 0.12);
    } else if (beatInBar === 2) {
      this.playSynthTone(ctx, 'triangle', rootFreq * 1.5, time + this.SECONDS_PER_BEAT * 0.5, this.SECONDS_PER_BEAT * 0.45, 0.095);
    }

    // -----------------------------------------------------------------------
    // Voice 2: Sunlight Arpeggio Chords (Shimmering ocean surface broken chords)
    // -----------------------------------------------------------------------
    const chordPitches: Record<number, number[]> = {
      0: [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      1: [329.63, 392.00, 493.88, 587.33], // Em7 (E4, G4, B4, D5)
      2: [349.23, 440.00, 523.25, 659.25], // Fmaj7 (F4, A4, C5, E5)
      3: [392.00, 493.88, 587.33, 698.46], // G7 (G4, B4, D5, F5)
      4: [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      5: [329.63, 392.00, 493.88, 659.25], // Em7 (E4, G4, B4, E5)
      6: [349.23, 440.00, 523.25, 698.46], // F (F4, A4, C5, F5)
      7: [392.00, 523.25, 587.33, 783.99], // Gsus4 -> G
      8: [349.23, 440.00, 523.25, 659.25], // Fmaj7
      9: [392.00, 493.88, 587.33, 783.99], // G
      10: [329.63, 392.00, 493.88, 659.25], // Em7
      11: [220.00, 261.63, 329.63, 440.00], // Am
      12: [293.66, 349.23, 440.00, 523.25], // Dm7
      13: [329.63, 392.00, 493.88, 587.33], // Em7
      14: [349.23, 440.00, 523.25, 659.25], // Fmaj7
      15: [392.00, 493.88, 587.33, 783.99]  // G
    };

    const chord = chordPitches[bar] || [261.63, 329.63, 392.00, 523.25];
    const sixteenth = this.SECONDS_PER_BEAT / 4;

    // 4 notes per beat (16th note rolling arpeggio)
    for (let sub = 0; sub < 4; sub++) {
      const noteIdx = (beatInBar * 4 + sub) % 4;
      const arpFreq = chord[noteIdx];
      const arpTime = time + sub * sixteenth;
      this.playSynthTone(ctx, 'square', arpFreq * 1.0, arpTime, sixteenth * 0.75, 0.038);
    }

    // -----------------------------------------------------------------------
    // Voice 3: Breezy Coastal Lead Melody (GBA Style Square Wave)
    // -----------------------------------------------------------------------
    const melodyEvents: Array<{ beat: number; freq: number; dur: number }> = [
      // Phrase 1 (Bars 0-3): Riding along the promenade
      { beat: 0, freq: 659.25, dur: 1.0 },   // E5
      { beat: 1, freq: 783.99, dur: 0.5 },   // G5
      { beat: 2, freq: 880.00, dur: 1.0 },   // A5
      { beat: 3, freq: 783.99, dur: 0.8 },   // G5
      { beat: 4, freq: 659.25, dur: 1.0 },   // E5
      { beat: 5, freq: 587.33, dur: 0.5 },   // D5
      { beat: 6, freq: 523.25, dur: 1.8 },   // C5
      { beat: 8, freq: 392.00, dur: 0.5 },   // G4
      { beat: 8.5, freq: 493.88, dur: 0.5 }, // B4
      { beat: 9, freq: 587.33, dur: 1.0 },   // D5
      { beat: 10, freq: 659.25, dur: 1.0 },  // E5
      { beat: 11, freq: 587.33, dur: 0.8 },  // D5
      { beat: 12, freq: 493.88, dur: 1.5 },  // B4
      { beat: 14, freq: 440.00, dur: 0.5 },  // A4
      { beat: 14.5, freq: 493.88, dur: 0.5 },// B4
      { beat: 15, freq: 392.00, dur: 0.9 },  // G4

      // Phrase 2 (Bars 4-7): Joyful pedaling through the town square
      { beat: 16, freq: 523.25, dur: 1.0 },  // C5
      { beat: 17, freq: 587.33, dur: 0.5 },  // D5
      { beat: 18, freq: 659.25, dur: 1.0 },  // E5
      { beat: 19, freq: 783.99, dur: 0.8 },  // G5
      { beat: 20, freq: 880.00, dur: 1.5 },  // A5
      { beat: 22, freq: 783.99, dur: 1.0 },  // G5
      { beat: 23, freq: 659.25, dur: 0.8 },  // E5
      { beat: 24, freq: 587.33, dur: 1.0 },  // D5
      { beat: 25, freq: 659.25, dur: 0.5 },  // E5
      { beat: 26, freq: 698.46, dur: 1.0 },  // F5
      { beat: 27, freq: 659.25, dur: 0.5 },  // E5
      { beat: 27.5, freq: 587.33, dur: 0.5 },// D5
      { beat: 28, freq: 523.25, dur: 2.0 },  // C5
      { beat: 30.5, freq: 587.33, dur: 0.5 },// D5
      { beat: 31, freq: 659.25, dur: 0.9 },  // E5

      // Phrase 3 (Bars 8-11): Soaring ocean view toward the future hill
      { beat: 32, freq: 698.46, dur: 1.0 },  // F5
      { beat: 33, freq: 880.00, dur: 0.5 },  // A5
      { beat: 34, freq: 1046.50, dur: 1.5 }, // C6
      { beat: 35.5, freq: 987.77, dur: 0.5 },// B5
      { beat: 36, freq: 783.99, dur: 1.5 },  // G5
      { beat: 38, freq: 659.25, dur: 1.0 },  // E5
      { beat: 39, freq: 587.33, dur: 0.8 },  // D5
      { beat: 40, freq: 659.25, dur: 1.0 },  // E5
      { beat: 41, freq: 783.99, dur: 0.5 },  // G5
      { beat: 42, freq: 987.77, dur: 1.5 },  // B5
      { beat: 43.5, freq: 880.00, dur: 0.5 },// A5
      { beat: 44, freq: 1046.50, dur: 2.0 }, // C6
      { beat: 46.5, freq: 987.77, dur: 0.5 },// B5
      { beat: 47, freq: 880.00, dur: 0.9 },  // A5

      // Phrase 4 (Bars 12-15): Summit triumph & return to start
      { beat: 48, freq: 698.46, dur: 1.0 },  // F5
      { beat: 49, freq: 880.00, dur: 0.5 },  // A5
      { beat: 50, freq: 1174.66, dur: 1.5 }, // D6
      { beat: 51.5, freq: 1046.50, dur: 0.5 },// C6
      { beat: 52, freq: 987.77, dur: 1.5 },  // B5
      { beat: 54, freq: 783.99, dur: 1.0 },  // G5
      { beat: 55, freq: 659.25, dur: 0.8 },  // E5
      { beat: 56, freq: 698.46, dur: 1.0 },  // F5
      { beat: 57, freq: 783.99, dur: 0.5 },  // G5
      { beat: 58, freq: 880.00, dur: 1.0 },  // A5
      { beat: 59, freq: 987.77, dur: 0.8 },  // B5
      { beat: 60, freq: 1046.50, dur: 2.0 }, // C6
      { beat: 62, freq: 1174.66, dur: 0.5 }, // D6
      { beat: 62.5, freq: 987.77, dur: 0.5 },// B5
      { beat: 63, freq: 783.99, dur: 0.9 }   // G5 (resolves into E5)
    ];

    // Find if a melody note triggers on this beat
    for (const ev of melodyEvents) {
      if (Math.abs(ev.beat - beat) < 0.05) {
        const noteDuration = ev.dur * this.SECONDS_PER_BEAT;
        this.playSynthTone(ctx, 'square', ev.freq, time, noteDuration, 0.12, true);
      }
    }
  }

  private playSynthTone(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    startTime: number,
    duration: number,
    gainVal: number,
    withVibrato = false
  ) {
    if (!this.bgmFilter) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    if (withVibrato) {
      // Subtle retro pitch vibrato after 0.15s
      osc.frequency.setTargetAtTime(freq * 1.006, startTime + 0.15, 0.04);
    }

    // Soft ADSR envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.bgmFilter);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /**
   * Smoothly ducks BGM filter & volume when viewing project details
   */
  public updateBGMDucking(isDucked: boolean) {
    this.bgmDucked = isDucked;
    if (!this.ctx || !this.bgmFilter || !this.bgmMasterGain) return;

    const now = this.ctx.currentTime;
    if (isDucked) {
      // Warm, cozy low-pass acoustic muffling (like viewing through glass)
      this.bgmFilter.frequency.setTargetAtTime(450, now, 0.12);
      if (this.isEnabled()) {
        this.bgmMasterGain.gain.setTargetAtTime(0.038, now, 0.12);
        if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(0.015, now, 0.12);
      }
    } else {
      // Restore crisp bright open-air coastal sunshine
      this.bgmFilter.frequency.setTargetAtTime(2200, now, 0.15);
      if (this.isEnabled()) {
        this.bgmMasterGain.gain.setTargetAtTime(0.15, now, 0.15);
        if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(0.045, now, 0.15);
      }
    }
  }

  public setBGMEnabled(enabled: boolean) {
    if (!this.ctx || !this.bgmMasterGain) return;
    const now = this.ctx.currentTime;
    if (enabled) {
      const targetGain = this.bgmDucked ? 0.038 : 0.15;
      this.bgmMasterGain.gain.setTargetAtTime(targetGain, now, 0.08);
      if (this.oceanGain) {
        this.oceanGain.gain.setTargetAtTime(this.bgmDucked ? 0.015 : 0.045, now, 0.08);
      }
      if (!this.bgmIsPlaying) {
        this.startBGMScheduler();
      }
    } else {
      this.bgmMasterGain.gain.setTargetAtTime(0.0001, now, 0.05);
      if (this.oceanGain) {
        this.oceanGain.gain.setTargetAtTime(0.0001, now, 0.05);
      }
    }
  }

  // =========================================================================
  // 2. TIRE NOISE, MECHANICAL CHAIN & FOUL WEATHER WHEEL NOISE
  // =========================================================================

  /**
   * Continuous smooth bicycle rolling & chain purr
   * Dynamically tracks speed ratio (0.0 to 1.0) with smooth acceleration/deceleration.
   */
  public updateBikeRoll(speedRatio: number) {
    if (!this.isEnabled() || speedRatio < 0.05) {
      this.stopBikeRoll();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    const now = ctx.currentTime;
    const clampedSpeed = Math.min(1.0, Math.max(0.05, speedRatio));

    // Target parameters based on cycling speed
    const roadFilterFreq = 220 + clampedSpeed * 380; // 220Hz - 600Hz smooth road tire purr
    const roadGainVal = 0.025 + clampedSpeed * 0.025;
    const chainFreq = 42 + clampedSpeed * 48; // 42Hz - 90Hz soft gear rotation
    const chainGainVal = 0.02 + clampedSpeed * 0.02;

    if (!this.bikeIsRolling || !this.bikeNoiseSource || !this.bikeOsc) {
      // Start continuous audio nodes
      this.startBikeNodes(ctx, roadFilterFreq, roadGainVal, chainFreq, chainGainVal);
    } else {
      // Smooth continuous adjustment
      if (this.bikeNoiseFilter) {
        this.bikeNoiseFilter.frequency.setTargetAtTime(roadFilterFreq, now, 0.08);
      }
      if (this.bikeNoiseGain) {
        this.bikeNoiseGain.gain.setTargetAtTime(roadGainVal, now, 0.08);
      }
      if (this.bikeOsc) {
        this.bikeOsc.frequency.setTargetAtTime(chainFreq, now, 0.08);
      }
      if (this.bikeOscGain) {
        this.bikeOscGain.gain.setTargetAtTime(chainGainVal, now, 0.08);
      }
    }
  }

  private startBikeNodes(
    ctx: AudioContext,
    filterFreq: number,
    noiseGain: number,
    oscFreq: number,
    oscGainVal: number
  ) {
    if (!this.noiseBuffer) return;
    const now = ctx.currentTime;

    // 1. Smooth Road Tire Noise Layer
    this.bikeNoiseSource = ctx.createBufferSource();
    this.bikeNoiseSource.buffer = this.noiseBuffer;
    this.bikeNoiseSource.loop = true;

    this.bikeNoiseFilter = ctx.createBiquadFilter();
    this.bikeNoiseFilter.type = 'lowpass';
    this.bikeNoiseFilter.frequency.setValueAtTime(filterFreq, now);

    this.bikeNoiseGain = ctx.createGain();
    this.bikeNoiseGain.gain.setValueAtTime(0.001, now);
    this.bikeNoiseGain.gain.exponentialRampToValueAtTime(Math.max(0.001, noiseGain), now + 0.1);

    this.bikeNoiseSource.connect(this.bikeNoiseFilter);
    this.bikeNoiseFilter.connect(this.bikeNoiseGain);
    this.bikeNoiseGain.connect(ctx.destination);
    this.bikeNoiseSource.start(now);

    // 2. Mechanical Gear & Chain Purr Layer
    this.bikeOsc = ctx.createOscillator();
    this.bikeOsc.type = 'triangle';
    this.bikeOsc.frequency.setValueAtTime(oscFreq, now);

    this.bikeOscFilter = ctx.createBiquadFilter();
    this.bikeOscFilter.type = 'lowpass';
    this.bikeOscFilter.frequency.setValueAtTime(160, now);

    this.bikeOscGain = ctx.createGain();
    this.bikeOscGain.gain.setValueAtTime(0.001, now);
    this.bikeOscGain.gain.exponentialRampToValueAtTime(Math.max(0.001, oscGainVal), now + 0.1);

    this.bikeOsc.connect(this.bikeOscFilter);
    this.bikeOscFilter.connect(this.bikeOscGain);
    this.bikeOscGain.connect(ctx.destination);
    this.bikeOsc.start(now);

    this.bikeIsRolling = true;
  }

  public stopBikeRoll() {
    if (!this.bikeIsRolling || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.bikeNoiseGain) {
      this.bikeNoiseGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
    if (this.bikeOscGain) {
      this.bikeOscGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }

    if (!this.stopTimer) {
      this.stopTimer = setTimeout(() => {
        try {
          if (this.bikeNoiseSource) {
            this.bikeNoiseSource.stop();
            this.bikeNoiseSource.disconnect();
            this.bikeNoiseSource = null;
          }
          if (this.bikeOsc) {
            this.bikeOsc.stop();
            this.bikeOsc.disconnect();
            this.bikeOsc = null;
          }
        } catch (_) {}
        this.bikeIsRolling = false;
        this.stopTimer = null;
      }, 120);
    }
  }

  // =========================================================================
  // 3. RETRO INTERACTION SOUND EFFECTS
  // =========================================================================

  /**
   * Character footstep sound on stone pavement
   * Alternates subtle pitch for left/right footsteps
   */
  public playFootstep() {
    if (!this.isEnabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    this.stepToggle = !this.stepToggle;
    const baseFreq = this.stepToggle ? 130 : 110;

    // 1. Soft Footstep Thud (Triangle wave)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

    gain.gain.setValueAtTime(0.038, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);

    // 2. Subtle stone contact texture
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.025, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.025);
    }
  }

  /**
   * Mounting the bicycle (bouncy 8-bit upward hop)
   */
  public playMount() {
    if (!this.isEnabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.09);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Parking / Dismounting bicycle (retro hop down)
   */
  public playDismount() {
    if (!this.isEnabled()) return;
    this.stopBikeRoll();
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // =========================================================================
  // UNIFIED RETRO UI SOUND SYSTEM (选择、确认、取消)
  // =========================================================================

  /**
   * 1. 选择音效 (Select / Cursor hover / Option switch)
   * Crisp, high-pitched retro 8-bit blip
   */
  public playSelect() {
    if (!this.isEnabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.032); // E6

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.032);
  }

  /**
   * 2. 确认音效 (Confirm / Submit / Enter / Start)
   * Classic Mario/Nintendo ascending 3-note confirmation arpeggio (E5 -> A5 -> E6)
   */
  public playConfirm() {
    if (!this.isEnabled()) return;
    this.stopBikeRoll();
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [659.25, 880.0, 1318.51]; // E5, A5, E6
    const noteDuration = 0.042;
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * noteDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  }

  /**
   * 3. 取消音效 (Cancel / Back / Close / Quit)
   * Classic descending 2-tone rejection/back blip (B4 -> E4)
   */
  public playCancel() {
    if (!this.isEnabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [493.88, 329.63]; // B4, E4
    const noteDuration = 0.048;
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * noteDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  }

  /**
   * Landmark interaction / Enter building (delegates to playConfirm)
   */
  public playInteract() {
    this.playConfirm();
  }

  /**
   * Modal close / Back button sound (delegates to playCancel)
   */
  public playClose() {
    this.playCancel();
  }
}

export const pixelSound = new PixelSoundManager();
