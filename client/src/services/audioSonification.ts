/**
 * Web Audio API Sonification Service for Diagram & Linked List State
 * Provides accessible, semantic audio cues for node traversal, pointer mutation,
 * and list operations. Playback is strictly user-initiated.
 */

// Major pentatonic frequencies for harmonic, pleasant node tones
const PENTATONIC_SCALE = [
  261.63, // C4 (Node 1 / Head)
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00  // A5
];

export interface SonificationEvent {
  frequency: number;
  label: string;
  type: 'node' | 'mutation' | 'reset' | 'traverse';
}

class AudioSonificationService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = false;
  private volume: number = 0.3; // Default 30% volume

  /**
   * Check if Web Audio API is supported in this browser
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  /**
   * Initialize or resume the AudioContext on user gesture
   */
  public async ensureContext(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (enable) {
      this.ensureContext();
    } else {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Calculate semantic frequency for a node based on its position in the linked list
   */
  public getFrequencyForNode(index: number, total: number): number {
    if (total <= 0) return PENTATONIC_SCALE[0];
    const scaleIndex = Math.min(index, PENTATONIC_SCALE.length - 1);
    return PENTATONIC_SCALE[scaleIndex];
  }

  /**
   * Play an accessible tone representing a node state
   */
  public playNodeTone(
    nodeIndex: number,
    totalNodes: number,
    isMutated: boolean = false
  ): SonificationEvent | null {
    if (!this.enabled || !this.ctx || !this.masterGain) return null;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const freq = this.getFrequencyForNode(nodeIndex, totalNodes);
      const now = this.ctx.currentTime;

      if (isMutated) {
        // Dual-tone ascending chime for pointer mutation
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 1.25, now + 0.08); // Major third interval

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc1.connect(noteGain);
        osc2.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);

        return {
          frequency: Math.round(freq),
          label: `Mutating node ${nodeIndex + 1} at ${Math.round(freq)} Hz`,
          type: 'mutation'
        };
      } else {
        // Clean single tone for node traversal
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.24);

        return {
          frequency: Math.round(freq),
          label: `Visiting node ${nodeIndex + 1} at ${Math.round(freq)} Hz`,
          type: 'node'
        };
      }
    } catch {
      return null;
    }
  }

  /**
   * Reset tone (descending sweep)
   */
  public playResetTone(): SonificationEvent | null {
    if (!this.enabled || !this.ctx || !this.masterGain) return null;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.25);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.28);

      return {
        frequency: 261,
        label: 'Diagram reset to beginning',
        type: 'reset'
      };
    } catch {
      return null;
    }
  }

  /**
   * Stop all active sonification immediately
   */
  public stop() {
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        // Restore volume after small delay
        setTimeout(() => {
          if (this.ctx && this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
          }
        }, 50);
      } catch {
        /* Ignore audio stop errors */
      }
    }
  }
}

export const diagramSonifier = new AudioSonificationService();
