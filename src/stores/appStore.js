import { create } from 'zustand';


export const useAppStore = create((set) => ({
    loading: true,
    gameCards: [],
    miningCards: [],
    tasks: [],
    setLoading: (loading) => set({ loading }),
    setGameCards: (gameCards) => set({ gameCards }),
    setMiningCards: (miningCards) => set({ miningCards }),
    setTasks: (tasks) => set({ tasks }),
}));





