'use client';

import React, { useState } from 'react';
import { ArrowLeft, Bell, BellOff, Volume2, VolumeX, Trash2, AlertTriangle } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useQuizStore } from '@/store/useQuizStore';
import { useSound } from '@/hooks/useSound';
import clsx from 'clsx';

interface SettingsViewProps {
    onBack: () => void;
}

export const SettingsView = ({ onBack }: SettingsViewProps) => {
    const { playClick } = useSound();
    const { soundEnabled, setSoundEnabled } = useSettingsStore();
    const { clearHistory, clearReviewList } = useQuizStore();
    const {
        isEnabled: notificationEnabled,
        notificationTime,
        enableNotifications,
        disableNotifications,
        setNotificationTime,
    } = useNotification();

    const [showConfirmClear, setShowConfirmClear] = useState<'history' | 'review' | null>(null);

    const handleToggleNotification = async () => {
        playClick();
        if (notificationEnabled) {
            disableNotifications();
        } else {
            const success = await enableNotifications();
            if (!success) {
                alert('알림 권한이 필요합니다. 브라우저 설정에서 알림을 허용해주세요.');
            }
        }
    };

    const handleToggleSound = () => {
        playClick();
        setSoundEnabled(!soundEnabled);
    };

    const handleClearHistory = () => {
        clearHistory();
        setShowConfirmClear(null);
        playClick();
    };

    const handleClearReview = () => {
        clearReviewList();
        setShowConfirmClear(null);
        playClick();
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => { playClick(); onBack(); }}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">설정</h1>
                    <p className="text-slate-400 text-sm">앱 설정을 관리하세요</p>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Bell size={18} className="text-slate-400" />
                        알림 설정
                    </h2>
                </div>

                <div className="p-4 space-y-4">
                    {/* Enable/Disable */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">학습 알림</p>
                            <p className="text-xs text-slate-500">매일 설정한 시간에 알림을 받아요</p>
                        </div>
                        <button
                            onClick={handleToggleNotification}
                            className={clsx(
                                "relative w-14 h-8 rounded-full transition-colors",
                                notificationEnabled ? "bg-blue-600" : "bg-slate-700"
                            )}
                        >
                            <div
                                className={clsx(
                                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all",
                                    notificationEnabled ? "left-7" : "left-1"
                                )}
                            />
                        </button>
                    </div>

                    {/* Time Picker */}
                    {notificationEnabled && (
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <p className="font-medium text-white">알림 시간</p>
                                <p className="text-xs text-slate-500">스트릭을 유지하려면 이 시간 전에 학습하세요</p>
                            </div>
                            <input
                                type="time"
                                value={notificationTime}
                                onChange={(e) => setNotificationTime(e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Sound Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Volume2 size={18} className="text-slate-400" />
                        소리 설정
                    </h2>
                </div>

                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">효과음</p>
                            <p className="text-xs text-slate-500">정답/오답 효과음 재생</p>
                        </div>
                        <button
                            onClick={handleToggleSound}
                            className={clsx(
                                "relative w-14 h-8 rounded-full transition-colors",
                                soundEnabled ? "bg-blue-600" : "bg-slate-700"
                            )}
                        >
                            <div
                                className={clsx(
                                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all",
                                    soundEnabled ? "left-7" : "left-1"
                                )}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Trash2 size={18} className="text-slate-400" />
                        데이터 관리
                    </h2>
                </div>

                <div className="p-4 space-y-3">
                    <button
                        onClick={() => setShowConfirmClear('review')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                        <div className="text-left">
                            <p className="font-medium text-white">복습 목록 초기화</p>
                            <p className="text-xs text-slate-500">틀린 단어 목록을 비웁니다</p>
                        </div>
                        <Trash2 size={18} className="text-slate-500" />
                    </button>

                    <button
                        onClick={() => setShowConfirmClear('history')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                        <div className="text-left">
                            <p className="font-medium text-white">학습 기록 초기화</p>
                            <p className="text-xs text-slate-500">퀴즈 히스토리를 삭제합니다</p>
                        </div>
                        <Trash2 size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Version Info */}
            <div className="text-center text-slate-600 text-sm">
                <p>Pre-Build Up Voca v1.0.0</p>
            </div>

            {/* Confirm Dialog */}
            {showConfirmClear && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
                        <div className="flex items-center gap-3 text-amber-500">
                            <AlertTriangle size={24} />
                            <h3 className="font-bold text-white text-lg">정말 삭제하시겠습니까?</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            {showConfirmClear === 'history'
                                ? '학습 기록이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'
                                : '복습 목록의 모든 단어가 삭제됩니다.'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowConfirmClear(null)}
                                className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={showConfirmClear === 'history' ? handleClearHistory : handleClearReview}
                                className="py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
