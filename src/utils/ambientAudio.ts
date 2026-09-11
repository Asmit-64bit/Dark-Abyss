// Synthesized subterranean ambient sci-fi soundscape using Web Audio API

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscNodes: OscillatorNode[] = [];
  private lfoNode: OscillatorNode | null = null;

  public start() {
    if (this.isPlaying) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master gain for subtle 7% volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.07, this.ctx.currentTime + 2);
      this.masterGain.connect(this.ctx.destination);

      // Low frequency drone 1 (55Hz - A1 deep subterranean hum)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Lowpass filter to muffle the saw wave into a deep dark rumble
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter1.Q.setValueAtTime(4, this.ctx.currentTime);

      osc1.connect(filter1);
      filter1.connect(this.masterGain);
      osc1.start();
      this.oscNodes.push(osc1);

      // Drone 2 (54.2Hz - slight detuning for unsettling binaural beating)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(54.3, this.ctx.currentTime);
      osc2.connect(this.masterGain);
      osc2.start();
      this.oscNodes.push(osc2);

      // High frequency mysterious electrical resonance (220Hz filtered sine)
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(220, this.ctx.currentTime);
      const gain3 = this.ctx.createGain();
      gain3.gain.setValueAtTime(0.02, this.ctx.currentTime);
      osc3.connect(gain3);
      gain3.connect(this.masterGain);
      osc3.start();
      this.oscNodes.push(osc3);

      // LFO modulation on filter frequency for breathing atmospheric effect
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = 'sine';
      this.lfoNode.frequency.setValueAtTime(0.12, this.ctx.currentTime); // very slow cycle (8s)
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(30, this.ctx.currentTime);
      this.lfoNode.connect(lfoGain);
      lfoGain.connect(filter1.frequency);
      this.lfoNode.start();

      this.isPlaying = true;
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);

      setTimeout(() => {
        this.oscNodes.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        this.oscNodes = [];

        if (this.lfoNode) {
          try { this.lfoNode.stop(); this.lfoNode.disconnect(); } catch {}
          this.lfoNode = null;
        }

        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close();
          this.ctx = null;
        }

        this.isPlaying = false;
      }, 550);
    } catch {
      this.isPlaying = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
