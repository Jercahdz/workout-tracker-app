import { create } from "zustand";

interface Stats {
  currentStreak: number;
  bestStreak: number;
  totalSessions: number;
  totalXp: number;
  level: number;
  levelName: string;
  shields: number;
  xpForNextLevel: number | null;
  xpProgress: number | null;
  xpRequired: number | null;
}

interface StatsState {
  stats: Stats | null;
  setStats: (stats: Stats) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));