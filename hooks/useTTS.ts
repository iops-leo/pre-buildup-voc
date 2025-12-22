'use client';

import { useCallback, useEffect, useState } from 'react';

export const useTTS = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Clean text: remove parentheses content like (v.), (adj.) etc.
        const cleanText = text.replace(/\s*\(.*?\)/g, '').trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return { speak, stop, isSpeaking, isSupported };
};
