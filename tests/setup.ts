import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
    onvoiceschanged: null,
  },
  writable: true,
});

// Mock SpeechRecognition
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: '',
  onresult: null,
  onerror: null,
  onend: null,
}));

Object.defineProperty(window, 'SpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock Audio
Object.defineProperty(window, 'Audio', {
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    currentTime: 0,
    volume: 1,
  })),
  writable: true,
});
