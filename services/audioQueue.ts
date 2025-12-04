export class AudioQueue {
  private queue: string[] = [];
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public addToQueue(base64Data: string) {
    this.queue.push(base64Data);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isPlaying || this.queue.length === 0 || !this.audioContext) return;

    this.isPlaying = true;
    const base64 = this.queue.shift();

    if (base64) {
      try {
        const audioBuffer = await this.decodeAudio(base64);
        this.playBuffer(audioBuffer);
      } catch (error) {
        console.error("Error decoding audio", error);
        this.isPlaying = false;
        this.processQueue();
      }
    }
  }

  private playBuffer(buffer: AudioBuffer) {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    source.onended = () => {
      this.isPlaying = false;
      this.processQueue();
    };

    source.start(0);
  }

  private async decodeAudio(base64: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("AudioContext not initialized");

    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // We must copy the buffer because decodeAudioData detaches it
    return await this.audioContext.decodeAudioData(bytes.buffer.slice(0));
  }
}

export const audioQueueService = new AudioQueue();