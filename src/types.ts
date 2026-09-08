// ---------------------------------------------------------------------------
// Modello dati dell'app. Vedi README per la spiegazione delle scelte.
// ---------------------------------------------------------------------------

export interface LoadStep {
  small: number; // es. 2.5 kg
  large: number; // es. 5 kg
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  loadStep: LoadStep;
  /** In evidenza nella schermata Progressi (panca / squat / stacco) */
  highlight?: boolean;
}

export interface ExerciseSlot {
  id: string;
  type: 'single' | 'superset';
  /** Recupero dopo lo slot: a fine esercizio (single) o a fine coppia (superset) */
  restSeconds: number;
  exercises: ExerciseTemplate[];
}

export interface SessionTemplate {
  id: string;
  name: string;
  order: number;
  slots: ExerciseSlot[];
}

export interface ReferenceMaxes {
  bench: number;
  squat: number;
  deadlift: number;
}

export interface Program {
  id: string;
  name: string;
  referenceMaxes: ReferenceMaxes;
  sessions: SessionTemplate[];
}

// ---------------------------------------------------------------------------
// Sedute svolte (log)
// ---------------------------------------------------------------------------

export interface SetLog {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isExtra: boolean;
  completedAt: string; // ISO
}

export interface ExerciseLog {
  id: string;
  exerciseTemplateId: string;
  slotId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  skipped: boolean;
  notes: string;
  sets: SetLog[];
}

export type WorkoutLogStatus = 'in_progress' | 'completed';

export interface WorkoutLog {
  id: string;
  sessionTemplateId: string;
  sessionName: string;
  startedAt: string; // ISO
  completedAt?: string; // ISO
  status: WorkoutLogStatus;
  exerciseLogs: ExerciseLog[];
  generalNotes: string;
}

export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PersistedData {
  version: number;
  program: Program;
  workoutLogs: WorkoutLog[];
  activeWorkoutLogId?: string;
  settings: Settings;
}
