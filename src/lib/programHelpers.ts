import type { ExerciseTemplate, Program } from '../types';

export interface ExerciseRef {
  template: ExerciseTemplate;
  sessionName: string;
}

/** Elenco di tutti gli esercizi del programma, con la seduta di appartenenza. */
export function listAllExercises(program: Program): ExerciseRef[] {
  const refs: ExerciseRef[] = [];
  for (const session of program.sessions) {
    for (const slot of session.slots) {
      for (const ex of slot.exercises) {
        refs.push({ template: ex, sessionName: session.name });
      }
    }
  }
  return refs;
}
