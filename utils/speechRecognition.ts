/**
 * Speech Recognition utility for emergency word detection
 * Uses Web Speech API (built into browsers, no API keys needed)
 */

export interface SpeechRecognitionConfig {
  onEmergencyDetected: () => void;
  onError?: (error: string) => void;
  emergencyWords?: string[];
  continuous?: boolean;
  interimResults?: boolean;
}

export class EmergencySpeechRecognition {
  private recognition: any = null;
  private isListening: boolean = false;
  private config: SpeechRecognitionConfig;
  private defaultEmergencyWords = ['help', 'emergency', 'stop', 'ambulance', '911', 'nine one one'];

  constructor(config: SpeechRecognitionConfig) {
    this.config = {
      emergencyWords: this.defaultEmergencyWords,
      continuous: true,
      interimResults: true,
      ...config,
    };
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      this.config.onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.config.continuous ?? true;
    this.recognition.interimResults = this.config.interimResults ?? true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ')
        .toLowerCase();

      // Check for emergency words
      const emergencyWords = this.config.emergencyWords || this.defaultEmergencyWords;
      const detectedWord = emergencyWords.find(word => 
        transcript.includes(word.toLowerCase())
      );

      if (detectedWord) {
        console.log('Emergency word detected:', detectedWord);
        this.config.onEmergencyDetected();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.config.onError?.(event.error);
      
      // Restart recognition if it stops due to error
      if (this.isListening && event.error !== 'no-speech') {
        setTimeout(() => {
          if (this.isListening) {
            this.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      // Restart recognition if it ended but we're still supposed to be listening
      if (this.isListening) {
        setTimeout(() => {
          if (this.isListening) {
            this.start();
          }
        }, 100);
      }
    };
  }

  public start() {
    if (!this.recognition) {
      console.warn('Speech recognition not initialized');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Emergency speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // If already started, try to restart
      if (this.isListening) {
        this.stop();
        setTimeout(() => this.start(), 500);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        console.log('Emergency speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  public isActive(): boolean {
    return this.isListening;
  }

  public updateEmergencyWords(words: string[]) {
    this.config.emergencyWords = words;
  }
}

/**
 * Check if speech recognition is supported in the browser
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
};

/**
 * Request microphone permission
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

