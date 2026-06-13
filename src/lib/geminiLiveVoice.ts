import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";

type LiveToken = {
  token: string;
  model: string;
  voice: string;
};

function base64ToBytes(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export class GeminiLiveVoice {
  private session: Session | null = null;
  private audioContext: AudioContext | null = null;
  private nextAudioTime = 0;
  private activeSources = new Set<AudioBufferSourceNode>();
  private inputContext: AudioContext | null = null;
  private inputStream: MediaStream | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private transcribing = false;
  private transcript = "";
  private onTranscript: ((text: string, finished: boolean) => void) | null = null;
  private turnResolve: (() => void) | null = null;
  private turnReject: ((reason: Error) => void) | null = null;

  async connect(config: LiveToken) {
    if (this.session) return;

    const ai = new GoogleGenAI({
      apiKey: config.token,
      httpOptions: { apiVersion: "v1alpha" },
    });
    this.audioContext = new AudioContext({ sampleRate: 24_000 });
    this.session = await ai.live.connect({
      model: config.model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        temperature: 0.1,
        speechConfig: {
          languageCode: "vi-VN",
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.voice },
          },
        },
        systemInstruction: {
          parts: [{
            text: [
              "Bạn là người phỏng vấn nói tiếng Việt.",
              "Khi nhận được yêu cầu đọc câu hỏi, chỉ đọc đúng nguyên văn câu hỏi bằng tiếng Việt.",
              "Không dịch sang tiếng Anh, không thêm lời chào, giải thích hoặc nhận xét.",
              "Phát âm các thuật ngữ kỹ thuật tiếng Anh tự nhiên trong câu tiếng Việt.",
              "Khi nhận audio từ ứng viên, không nói và không trả lời; chỉ chờ yêu cầu tiếp theo.",
            ].join(" "),
          }],
        },
      },
      callbacks: {
        onmessage: (message) => this.handleMessage(message),
        onerror: () => this.failTurn(new Error("Kết nối Gemini Live gặp lỗi.")),
        onclose: () => {
          this.session = null;
          this.failTurn(new Error("Kết nối Gemini Live đã đóng."));
        },
      },
    });
  }

  async speak(question: string) {
    if (!this.session || !this.audioContext) {
      throw new Error("Gemini Live chưa được kết nối.");
    }

    this.stopAudio();
    await this.audioContext.resume();
    const completed = new Promise<void>((resolve, reject) => {
      this.turnResolve = resolve;
      this.turnReject = reject;
    });
    this.session.sendClientContent({
      turns: [{
        role: "user",
        parts: [{
          text: `Đọc nguyên văn câu hỏi sau bằng tiếng Việt, không thêm nội dung khác:\n${question}`,
        }],
      }],
      turnComplete: true,
    });
    await completed;
  }

  stopAudio() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // The source may already have finished.
      }
    }
    this.activeSources.clear();
    this.nextAudioTime = this.audioContext?.currentTime ?? 0;
  }

  async startTranscription(onTranscript: (text: string, finished: boolean) => void) {
    if (!this.session || this.transcribing) return;
    this.stopAudio();
    this.transcript = "";
    this.onTranscript = onTranscript;
    this.inputStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.inputContext = new AudioContext();
    await this.inputContext.resume();
    const source = this.inputContext.createMediaStreamSource(this.inputStream);
    const processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    const silentGain = this.inputContext.createGain();
    silentGain.gain.value = 0;
    processor.onaudioprocess = (event) => {
      if (!this.transcribing || !this.session) return;
      const input = event.inputBuffer.getChannelData(0);
      const pcm = this.toPcm16(input, this.inputContext?.sampleRate ?? 48_000, 16_000);
      this.session.sendRealtimeInput({
        audio: {
          data: this.bytesToBase64(new Uint8Array(pcm.buffer)),
          mimeType: "audio/pcm;rate=16000",
        },
      });
    };
    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(this.inputContext.destination);
    this.inputProcessor = processor;
    this.transcribing = true;
  }

  stopTranscription() {
    if (!this.transcribing) return;
    this.transcribing = false;
    this.inputProcessor?.disconnect();
    this.inputProcessor = null;
    for (const track of this.inputStream?.getTracks() ?? []) track.stop();
    this.inputStream = null;
    void this.inputContext?.close();
    this.inputContext = null;
    this.session?.sendRealtimeInput({ audioStreamEnd: true });
  }

  close() {
    this.stopTranscription();
    this.stopAudio();
    this.session?.close();
    this.session = null;
    void this.audioContext?.close();
    this.audioContext = null;
  }

  private handleMessage(message: LiveServerMessage) {
    const content = message.serverContent;
    const inputTranscription = content?.inputTranscription;
    if (inputTranscription?.text) {
      this.transcript += inputTranscription.text;
      this.onTranscript?.(this.transcript.trim(), Boolean(inputTranscription.finished));
    }
    for (const part of content?.modelTurn?.parts ?? []) {
      const inlineData = part.inlineData;
      if (inlineData?.data && !this.transcribing) this.queuePcmAudio(inlineData.data);
    }
    if (content?.interrupted) this.stopAudio();
    if (content?.turnComplete) {
      this.turnResolve?.();
      this.turnResolve = null;
      this.turnReject = null;
    }
  }

  private queuePcmAudio(base64: string) {
    if (!this.audioContext) return;
    const bytes = base64ToBytes(base64);
    const samples = new Float32Array(Math.floor(bytes.length / 2));
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = view.getInt16(index * 2, true) / 32768;
    }

    const buffer = this.audioContext.createBuffer(1, samples.length, 24_000);
    buffer.copyToChannel(samples, 0);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    const startAt = Math.max(this.audioContext.currentTime, this.nextAudioTime);
    source.start(startAt);
    this.nextAudioTime = startAt + buffer.duration;
    this.activeSources.add(source);
    source.onended = () => this.activeSources.delete(source);
  }

  private failTurn(error: Error) {
    this.turnReject?.(error);
    this.turnResolve = null;
    this.turnReject = null;
  }

  private toPcm16(input: Float32Array, sourceRate: number, targetRate: number) {
    const ratio = sourceRate / targetRate;
    const length = Math.max(1, Math.round(input.length / ratio));
    const output = new Int16Array(length);
    for (let index = 0; index < length; index += 1) {
      const start = Math.floor(index * ratio);
      const end = Math.min(input.length, Math.floor((index + 1) * ratio));
      let sum = 0;
      for (let sourceIndex = start; sourceIndex < end; sourceIndex += 1) {
        sum += input[sourceIndex];
      }
      const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
      output[index] = sample < 0 ? sample * 32768 : sample * 32767;
    }
    return output;
  }

  private bytesToBase64(bytes: Uint8Array) {
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return window.btoa(binary);
  }
}
