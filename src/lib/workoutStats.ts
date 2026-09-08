import type { ExerciseLog, WorkoutLog } from '../types';

/** 1RM stimato con la formula di Epley: peso * (1 + rip/30) */
export function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function bestSetEpley(log: ExerciseLog): number {
  return log.sets.reduce((max, s) => Math.max(max, epley1RM(s.weightKg, s.reps)), 0);
}

export function exerciseVolume(log: ExerciseLog): number {
  return log.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

export function exerciseMaxWeight(log: ExerciseLog): number {
  return log.sets.reduce((max, s) => Math.max(max, s.weightKg), 0);
}

export function workoutVolume(log: WorkoutLog): number {
  return log.exerciseLogs.reduce((sum, ex) => sum + exerciseVolume(ex), 0);
}

export function workoutDurationMinutes(log: WorkoutLog): number | undefined {
  if (!log.completedAt) return undefined;
  const ms = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

/**
 * Trova l'ultimo log completato di un esercizio (per pre-compilare i valori
 * e mostrare "ultima volta"), scorrendo le sedute completate dalla più recente,
 * escludendo opzionalmente la seduta corrente.
 */
export function findLastExerciseLog(
  workoutLogs: WorkoutLog[],
  exerciseTemplateId: string,
  excludeWorkoutLogId?: string,
): ExerciseLog | undefined {
  const completed = workoutLogs
    .filter((w) => w.status === 'completed' && w.id !== excludeWorkoutLogId)
    .sort((a, b) => new Date(b.completedAt ?? b.startedAt).getTime() - new Date(a.completedAt ?? a.startedAt).getTime());

  for (const w of completed) {
    const match = w.exerciseLogs.find((e) => e.exerciseTemplateId === exerciseTemplateId && !e.skipped && e.sets.length > 0);
    if (match) return match;
  }
  return undefined;
}

export function formatLastTime(log: ExerciseLog | undefined): string {
  if (!log || log.sets.length === 0) return 'ultima volta: nessun dato';
  const parts = log.sets
    .slice()
    .sort((a, b) => a.setNumber - b.setNumber)
    .map((s) => `${formatWeight(s.weightKg)}x${s.reps}`);
  return `ultima volta: ${parts.join(', ')}`;
}

export function formatWeight(kg: number): string {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(2).replace(/\.?0+$/, '');
}
