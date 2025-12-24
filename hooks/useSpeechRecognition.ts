import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
    error: string | null;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use ref to keep the recognition instance
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                setIsSupported(true);
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US'; // English learning app

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);

                recognition.onresult = (event: any) => {
                    let finalTrans = '';
                    let interimTrans = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTrans += event.results[i][0].transcript;
                        } else {
                            interimTrans += event.results[i][0].transcript;
                        }
                    }

                    if (finalTrans) {
                        setTranscript(prev => prev + ' ' + finalTrans);
                    }
                    setInterimTranscript(interimTrans);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setError(event.error);
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript('');
                setInterimTranscript('');
                setError(null);
                recognitionRef.current.start();
            } catch (e) {
                console.error("Start error:", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript: transcript.trim(),
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported,
        error
    };
};
