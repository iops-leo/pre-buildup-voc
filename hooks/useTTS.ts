'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CLOUD_TTS_URL = 'https://opswfuiifkzpuqziqbkv.supabase.co/functions/v1/cloud-tts';
const CLOUD_TTS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc3dmdWlpZmt6cHVxemlxYmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODIwNjAsImV4cCI6MjA4MTU1ODA2MH0.etsEPBpdGMSFWlo3ADyp3wJVephRJe0Y4Ue_giDAmJI';

// 메모리 캐시 (base64 audio)
const audioCache = new Map<string, string>();

export const useTTS = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [useCloudTts, setUseCloudTts] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hasWebSpeech = 'speechSynthesis' in window;

        if (hasWebSpeech) {
            // Web Speech API가 있어도 실제 음성이 로드되는지 확인
            const checkVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                const hasEnglish = voices.some(v => v.lang.startsWith('en'));
                if (voices.length > 0 && hasEnglish) {
                    setIsSupported(true);
                    setUseCloudTts(false);
                } else if (voices.length > 0) {
                    // 음성은 있지만 영어 없음 → Cloud TTS
                    setIsSupported(true);
                    setUseCloudTts(true);
                } else {
                    // 음성 아직 안 로드됨 → Cloud TTS fallback 준비
                    setIsSupported(true);
                    setUseCloudTts(true);
                }
            };

            // 일부 브라우저는 getVoices()가 비동기
            if (window.speechSynthesis.getVoices().length > 0) {
                checkVoices();
            } else {
                window.speechSynthesis.onvoiceschanged = checkVoices;
                // 타임아웃: 1초 내 음성 로드 안 되면 Cloud TTS
                setTimeout(() => {
                    if (!isSupported) {
                        setIsSupported(true);
                        setUseCloudTts(true);
                    }
                }, 1000);
            }
        } else {
            // Web Speech API 자체가 없음 → Cloud TTS
            setIsSupported(true);
            setUseCloudTts(true);
        }
    }, []);

    const speakWithCloud = useCallback(async (text: string) => {
        try {
            setIsSpeaking(true);

            // 캐시 확인
            const cached = audioCache.get(text.toLowerCase());
            if (cached) {
                const audio = new Audio(`data:audio/mp3;base64,${cached}`);
                audioRef.current = audio;
                audio.onended = () => setIsSpeaking(false);
                audio.onerror = () => setIsSpeaking(false);
                await audio.play();
                return;
            }

            const response = await fetch(CLOUD_TTS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CLOUD_TTS_KEY}`,
                },
                body: JSON.stringify({
                    text,
                    languageCode: 'en-US',
                    voiceName: 'en-US-Standard-C',
                }),
            });

            if (!response.ok) {
                setIsSpeaking(false);
                return;
            }

            const data = await response.json();
            if (!data.success || !data.audioContent) {
                setIsSpeaking(false);
                return;
            }

            // 캐시 저장
            audioCache.set(text.toLowerCase(), data.audioContent);

            const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
            audioRef.current = audio;
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
        } catch {
            setIsSpeaking(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported) return;

        // Clean text: remove parentheses content like (v.), (adj.) etc.
        const cleanText = text.replace(/\s*\(.*?\)/g, '').trim();

        if (useCloudTts) {
            speakWithCloud(cleanText);
            return;
        }

        // Web Speech API
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported, useCloudTts, speakWithCloud]);

    const stop = useCallback(() => {
        if (useCloudTts) {
            audioRef.current?.pause();
            audioRef.current = null;
        } else {
            window.speechSynthesis?.cancel();
        }
        setIsSpeaking(false);
    }, [useCloudTts]);

    return { speak, stop, isSpeaking, isSupported };
};
