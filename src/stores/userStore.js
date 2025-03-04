import { create } from "zustand";
import { persist } from 'zustand/middleware'

export const useUserStore = create(
    persist(
        (set, get) => ({
            collectPopup: false,
            username: null,
            telegramId: null,
            frens: [],
            spin: 0,
            clickCount: 0,
            user: null,
            progress: 100,
            lastClickTime: null,
            lastProgressUpdate: Date.now(),
            earnSinceLastLogin: 0,
            userTasks: [],

            setCollectPopup: (collectPopup) => set({ collectPopup }),
            setUsername: (username) => set({ username }),
            setFrens: (frens) => set({ frens }),
            setTelegramId: (telegramId) => set({ telegramId }),
            setSpin: (spin) => set({ spin }),
            setClickCount: (clickCount) => set({ clickCount }),
            setUser: (user) => set({ user }),
            setProgress: (value) => {
                const currentTime = Date.now();
                set({
                    progress: typeof value === 'function' ? value(get().progress) : value,
                    lastProgressUpdate: currentTime
                });
            },
            setLastClickTime: (time) => set({ lastClickTime: time }),
            updateProgress: () => {
                const state = get();
                const currentTime = Date.now();
                const timeDiff = Math.floor((currentTime - state.lastProgressUpdate) / 1000);

                if (timeDiff > 0) {
                    const currentProgress = Math.max(0, state.progress);
                    const newProgress = Math.min(100, currentProgress + timeDiff);

                    set({
                        progress: newProgress,
                        lastProgressUpdate: currentTime
                    });
                }
            },
            setEarnSinceLastLogin: (value) => set({ earnSinceLastLogin: value }),
            setUserTasks: (userTasks) => set({ userTasks }),
        }),
        {
            name: 'user-storage',
        }
    )
)
