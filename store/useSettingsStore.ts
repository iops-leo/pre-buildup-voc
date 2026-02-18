import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
    enabled: boolean;
    time: string; // HH:mm format
    lastNotificationDate: string | null;
}

interface SettingsState {
    notification: NotificationSettings;
    soundEnabled: boolean;

    // Actions
    setNotificationEnabled: (enabled: boolean) => void;
    setNotificationTime: (time: string) => void;
    setLastNotificationDate: (date: string) => void;
    setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            notification: {
                enabled: false,
                time: '20:00',
                lastNotificationDate: null,
            },
            soundEnabled: true,

            setNotificationEnabled: (enabled) =>
                set((state) => ({
                    notification: { ...state.notification, enabled },
                })),

            setNotificationTime: (time) =>
                set((state) => ({
                    notification: { ...state.notification, time },
                })),

            setLastNotificationDate: (date) =>
                set((state) => ({
                    notification: { ...state.notification, lastNotificationDate: date },
                })),

            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
        }),
        {
            name: 'settings-storage',
        }
    )
);

// Notification helper functions
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'study-reminder',
        });
    }
};

export const scheduleNotification = (time: string, onTrigger: () => void) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    return setTimeout(() => {
        onTrigger();
        // Reschedule for next day
        scheduleNotification(time, onTrigger);
    }, delay);
};
