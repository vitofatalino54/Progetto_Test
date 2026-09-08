import { create } from 'zustand';

/**
 * Timer di recupero globale. Basato su un timestamp di fine (non su un countdown
 * ingenuo) così il tempo rimanente si ricalcola sempre come endTimestamp - Date.now():
 * resta corretto anche se il tab va in background o la UI viene rimontata navigando
 * tra le schermate. Vivendo in uno store globale (non in uno screen component),
 * continua a girare mentre l'utente naviga in Storico/Progressi/Programma.
 */
interface RestTimerState {
  endTimestamp?: number;
  totalSeconds?: number;
  label?: string;
  start: (seconds: number, label?: string) => void;
  adjust: (deltaSeconds: number) => void;
  skip: () => void;
}

export const useRestTimer = create<RestTimerState>((set, get) => ({
  endTimestamp: undefined,
  totalSeconds: undefined,
  label: undefined,
  start: (seconds, label) =>
    set({ endTimestamp: Date.now() + seconds * 1000, totalSeconds: seconds, label }),
  adjust: (deltaSeconds) => {
    const { endTimestamp } = get();
    if (endTimestamp === undefined) return;
    set({ endTimestamp: endTimestamp + deltaSeconds * 1000 });
  },
  skip: () => set({ endTimestamp: undefined, totalSeconds: undefined, label: undefined }),
}));
