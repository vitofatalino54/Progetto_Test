import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import defaultProgramJson from '../data/program.default.json';
import { makeId } from '../lib/id';
import type {
  ExerciseLog,
  PersistedData,
  Program,
  SessionTemplate,
  SetLog,
  Settings,
  WorkoutLog,
} from '../types';

const defaultProgram = defaultProgramJson as Program;

export const STORAGE_KEY = 'gym-tracker-data';
export const SCHEMA_VERSION = 1;

const defaultSettings: Settings = {
  soundEnabled: true,
  vibrationEnabled: true,
};

interface StoreState extends PersistedData {
  // ---- Programma ----
  setProgram: (program: Program) => void;

  // ---- Sessione attiva ----
  /** Avvia una nuova seduta per il template indicato. Se una seduta è già in corso viene sostituita. */
  startSession: (sessionTemplateId: string) => string | undefined;
  logSet: (
    workoutLogId: string,
    exerciseLogId: string,
    set: { weightKg: number; reps: number; isExtra?: boolean },
  ) => void;
  updateSet: (
    workoutLogId: string,
    exerciseLogId: string,
    setId: string,
    patch: Partial<Pick<SetLog, 'weightKg' | 'reps'>>,
  ) => void;
  removeSet: (workoutLogId: string, exerciseLogId: string, setId: string) => void;
  skipExercise: (workoutLogId: string, exerciseLogId: string, skipped: boolean) => void;
  setExerciseNotes: (workoutLogId: string, exerciseLogId: string, notes: string) => void;
  setGeneralNotes: (workoutLogId: string, notes: string) => void;
  completeWorkout: (workoutLogId: string) => void;
  discardWorkout: (workoutLogId: string) => void;

  // ---- Storico ----
  deleteWorkoutLog: (workoutLogId: string) => void;

  // ---- Impostazioni ----
  updateSettings: (patch: Partial<Settings>) => void;

  // ---- Backup ----
  exportData: () => PersistedData;
  importData: (data: PersistedData) => void;
}

function buildExerciseLogsForSession(session: SessionTemplate): ExerciseLog[] {
  const logs: ExerciseLog[] = [];
  for (const slot of session.slots) {
    for (const ex of slot.exercises) {
      logs.push({
        id: makeId('exlog'),
        exerciseTemplateId: ex.id,
        slotId: slot.id,
        name: ex.name,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        skipped: false,
        notes: '',
        sets: [],
      });
    }
  }
  return logs;
}

function touchWorkout(
  state: StoreState,
  workoutLogId: string,
  fn: (w: WorkoutLog) => WorkoutLog,
): Pick<StoreState, 'workoutLogs'> {
  return {
    workoutLogs: state.workoutLogs.map((w) => (w.id === workoutLogId ? fn(w) : w)),
  };
}

function touchExerciseLog(w: WorkoutLog, exerciseLogId: string, fn: (e: ExerciseLog) => ExerciseLog): WorkoutLog {
  return {
    ...w,
    exerciseLogs: w.exerciseLogs.map((e) => (e.id === exerciseLogId ? fn(e) : e)),
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      version: SCHEMA_VERSION,
      program: defaultProgram,
      workoutLogs: [],
      activeWorkoutLogId: undefined,
      settings: defaultSettings,

      setProgram: (program) => set({ program }),

      startSession: (sessionTemplateId) => {
        const session = get().program.sessions.find((s) => s.id === sessionTemplateId);
        if (!session) return undefined;
        const newLog: WorkoutLog = {
          id: makeId('wlog'),
          sessionTemplateId: session.id,
          sessionName: session.name,
          startedAt: new Date().toISOString(),
          status: 'in_progress',
          exerciseLogs: buildExerciseLogsForSession(session),
          generalNotes: '',
        };
        set((state) => ({
          workoutLogs: [...state.workoutLogs, newLog],
          activeWorkoutLogId: newLog.id,
        }));
        return newLog.id;
      },

      logSet: (workoutLogId, exerciseLogId, s) =>
        set((state) =>
          touchWorkout(state, workoutLogId, (w) =>
            touchExerciseLog(w, exerciseLogId, (e) => {
              const setNumber = e.sets.length + 1;
              const newSet: SetLog = {
                id: makeId('set'),
                setNumber,
                weightKg: s.weightKg,
                reps: s.reps,
                isExtra: s.isExtra ?? setNumber > e.targetSets,
                completedAt: new Date().toISOString(),
              };
              return { ...e, sets: [...e.sets, newSet] };
            }),
          ),
        ),

      updateSet: (workoutLogId, exerciseLogId, setId, patch) =>
        set((state) =>
          touchWorkout(state, workoutLogId, (w) =>
            touchExerciseLog(w, exerciseLogId, (e) => ({
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            })),
          ),
        ),

      removeSet: (workoutLogId, exerciseLogId, setId) =>
        set((state) =>
          touchWorkout(state, workoutLogId, (w) =>
            touchExerciseLog(w, exerciseLogId, (e) => {
              const sets = e.sets
                .filter((s) => s.id !== setId)
                .map((s, i) => ({ ...s, setNumber: i + 1, isExtra: i + 1 > e.targetSets }));
              return { ...e, sets };
            }),
          ),
        ),

      skipExercise: (workoutLogId, exerciseLogId, skipped) =>
        set((state) =>
          touchWorkout(state, workoutLogId, (w) => touchExerciseLog(w, exerciseLogId, (e) => ({ ...e, skipped }))),
        ),

      setExerciseNotes: (workoutLogId, exerciseLogId, notes) =>
        set((state) =>
          touchWorkout(state, workoutLogId, (w) => touchExerciseLog(w, exerciseLogId, (e) => ({ ...e, notes }))),
        ),

      setGeneralNotes: (workoutLogId, notes) =>
        set((state) => touchWorkout(state, workoutLogId, (w) => ({ ...w, generalNotes: notes }))),

      completeWorkout: (workoutLogId) =>
        set((state) => ({
          ...touchWorkout(state, workoutLogId, (w) => ({
            ...w,
            status: 'completed',
            completedAt: new Date().toISOString(),
          })),
          activeWorkoutLogId: state.activeWorkoutLogId === workoutLogId ? undefined : state.activeWorkoutLogId,
        })),

      discardWorkout: (workoutLogId) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.filter((w) => w.id !== workoutLogId),
          activeWorkoutLogId: state.activeWorkoutLogId === workoutLogId ? undefined : state.activeWorkoutLogId,
        })),

      deleteWorkoutLog: (workoutLogId) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.filter((w) => w.id !== workoutLogId),
          activeWorkoutLogId: state.activeWorkoutLogId === workoutLogId ? undefined : state.activeWorkoutLogId,
        })),

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      exportData: () => {
        const { version, program, workoutLogs, activeWorkoutLogId, settings } = get();
        return { version, program, workoutLogs, activeWorkoutLogId, settings };
      },

      importData: (data) =>
        set({
          version: data.version ?? SCHEMA_VERSION,
          program: data.program ?? defaultProgram,
          workoutLogs: data.workoutLogs ?? [],
          activeWorkoutLogId: data.activeWorkoutLogId,
          settings: { ...defaultSettings, ...data.settings },
        }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
    },
  ),
);
