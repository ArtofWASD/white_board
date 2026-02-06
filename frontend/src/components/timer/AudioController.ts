export class AudioController {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playBeep(frequency: number = 880, duration: number = 0.1, type: OscillatorType = 'sine') {
    this.init();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.context.currentTime);

    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  playStart() {
    // Высокий сигнал для старта
    this.playBeep(1046.5, 0.3, 'triangle'); // C6
  }

  playStop() {
    // Низкий сигнал для остановки
    this.playBeep(440, 0.3, 'sine'); // A4
  }

  playCountdown() {
    // Короткие тики для обратного отсчета
    this.playBeep(880, 0.1, 'square');
  }

  playRoundComplete() {
    // Двойной сигнал
    this.playBeep(1200, 0.1, 'sine');
    setTimeout(() => this.playBeep(1200, 0.1, 'sine'), 150);
  }
}

export const audioController = new AudioController();
