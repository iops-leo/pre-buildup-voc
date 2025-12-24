import { useCallback, useEffect, useRef } from 'react';

export const useSound = () => {
    const correctAudio = useRef<HTMLAudioElement | null>(null);
    const wrongAudio = useRef<HTMLAudioElement | null>(null);
    const clickAudio = useRef<HTMLAudioElement | null>(null);
    const levelUpAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            correctAudio.current = new Audio('/media/sounds/correct.ogg');
            wrongAudio.current = new Audio('/media/sounds/wrong.ogg');
            clickAudio.current = new Audio('/media/sounds/click.ogg');
            levelUpAudio.current = new Audio('/media/sounds/level_up.ogg');

            // Preload
            correctAudio.current.load();
            wrongAudio.current.load();
            clickAudio.current.load();
            levelUpAudio.current.load();
        }
    }, []);

    const playAudio = (audio: HTMLAudioElement | null) => {
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch((e) => console.log("Audio play failed (user interaction needed likely)", e));
        }
    };

    const playCorrect = useCallback(() => playAudio(correctAudio.current), []);
    const playWrong = useCallback(() => playAudio(wrongAudio.current), []);
    const playClick = useCallback(() => playAudio(clickAudio.current), []);
    const playLevelUp = useCallback(() => playAudio(levelUpAudio.current), []);

    return { playCorrect, playWrong, playClick, playLevelUp };
};
