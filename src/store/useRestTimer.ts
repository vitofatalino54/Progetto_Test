import { create } from 'zustand';

/**
 * Timer di recupero globale. Basato su un timestamp di fine (non su un countdown
 * ingenuo) così il tempo rimanente si ricalcola sempre come endTimestamp - Date.now():
 * resta corretto anche se il tab va in background o la UI viene rimontata navigando
 * tra le schermate. La UI completa (barra, +30/-30/salta, vibrazione, suono) arriva
 * nello step "Timer di recupero".
 */
interface RestTimerState {
  endTimestamp?: number;
  totalSeconds?: number;
  label?: string;
  start: (seconds: number, label?: string) => void;
  clear: () => void;
}

export const useRestTimer = create<RestTimerState>((set) => ({
  endTimestamp: undefined,
  totalSeconds: undefined,
  label: undefined,
  start: (seconds, label) =>
    set({ endTimestamp: Date.now() + seconds * 1000, totalSeconds: seconds, label }),
  clear: () => set({ endTimestamp: undefined, totalSeconds: undefined, label: undefined }),
}));
