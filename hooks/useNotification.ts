'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSettingsStore, requestNotificationPermission, showNotification } from '@/store/useSettingsStore';
import { useQuizStore } from '@/store/useQuizStore';

export const useNotification = () => {
    const { notification, setNotificationEnabled, setLastNotificationDate } = useSettingsStore();
    const { streak, lastStudyDate } = useQuizStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const checkAndNotify = useCallback(() => {
        const today = new Date().toDateString();
        const lastStudy = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
        const lastNotif = notification.lastNotificationDate;

        // Don't notify if already studied today
        if (lastStudy === today) return;

        // Don't notify if already sent today
        if (lastNotif === today) return;

        // Send notification
        const message = streak > 0
            ? `🔥 ${streak}일 연속 학습 중! 오늘도 스트릭을 유지하세요!`
            : '📚 오늘의 영단어 학습을 시작해볼까요?';

        showNotification('Pre-Build Up Voca', message);
        setLastNotificationDate(today);
    }, [lastStudyDate, notification.lastNotificationDate, streak, setLastNotificationDate]);

    const scheduleNotification = useCallback(() => {
        if (!notification.enabled) return;

        const [hours, minutes] = notification.time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            checkAndNotify();
            // Reschedule for next day
            scheduleNotification();
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [notification.enabled, notification.time, checkAndNotify]);

    const enableNotifications = useCallback(async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setNotificationEnabled(true);
            return true;
        }
        return false;
    }, [setNotificationEnabled]);

    const disableNotifications = useCallback(() => {
        setNotificationEnabled(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, [setNotificationEnabled]);

    // Schedule notification on mount and when settings change
    useEffect(() => {
        if (notification.enabled) {
            const cleanup = scheduleNotification();
            return cleanup;
        }
    }, [notification.enabled, notification.time, scheduleNotification]);

    return {
        isEnabled: notification.enabled,
        notificationTime: notification.time,
        enableNotifications,
        disableNotifications,
        setNotificationTime: useSettingsStore.getState().setNotificationTime,
    };
};
