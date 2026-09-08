import { makeId } from './id';
import type { ExerciseTemplate, Program, SessionTemplate } from '../types';

function mapSession(program: Program, sessionId: string, fn: (s: SessionTemplate) => SessionTemplate): Program {
  return { ...program, sessions: program.sessions.map((s) => (s.id === sessionId ? fn(s) : s)) };
}

export function addSession(program: Program): Program {
  const order = program.sessions.length;
  const newSession: SessionTemplate = {
    id: makeId('session'),
    name: `Nuova seduta ${String.fromCharCode(65 + order)}`,
    order,
    slots: [],
  };
  return { ...program, sessions: [...program.sessions, newSession] };
}

export function removeSession(program: Program, sessionId: string): Program {
  return {
    ...program,
    sessions: program.sessions.filter((s) => s.id !== sessionId).map((s, i) => ({ ...s, order: i })),
  };
}

export function moveSession(program: Program, sessionId: string, direction: -1 | 1): Program {
  const sorted = [...program.sessions].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((s) => s.id === sessionId);
  const swapWith = idx + direction;
  if (idx < 0 || swapWith < 0 || swapWith >= sorted.length) return program;
  [sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]];
  return { ...program, sessions: sorted.map((s, i) => ({ ...s, order: i })) };
}

export function updateSessionName(program: Program, sessionId: string, name: string): Program {
  return mapSession(program, sessionId, (s) => ({ ...s, name }));
}

export function addSlot(program: Program, sessionId: string): Program {
  return mapSession(program, sessionId, (s) => ({
    ...s,
    slots: [
      ...s.slots,
      {
        id: makeId('slot'),
        type: 'single',
        restSeconds: 90,
        exercises: [
          {
            id: makeId('ex'),
            name: 'Nuovo esercizio',
            targetSets: 3,
            targetReps: 10,
            loadStep: { small: 2.5, large: 5 },
          },
        ],
      },
    ],
  }));
}

export function removeSlot(program: Program, sessionId: string, slotId: string): Program {
  return mapSession(program, sessionId, (s) => ({ ...s, slots: s.slots.filter((sl) => sl.id !== slotId) }));
}

export function moveSlot(program: Program, sessionId: string, slotId: string, direction: -1 | 1): Program {
  return mapSession(program, sessionId, (s) => {
    const slots = [...s.slots];
    const idx = slots.findIndex((sl) => sl.id === slotId);
    const swapWith = idx + direction;
    if (idx < 0 || swapWith < 0 || swapWith >= slots.length) return s;
    [slots[idx], slots[swapWith]] = [slots[swapWith], slots[idx]];
    return { ...s, slots };
  });
}

export function updateSlotRest(program: Program, sessionId: string, slotId: string, restSeconds: number): Program {
  return mapSession(program, sessionId, (s) => ({
    ...s,
    slots: s.slots.map((sl) => (sl.id === slotId ? { ...sl, restSeconds } : sl)),
  }));
}

export function addExerciseToSlot(program: Program, sessionId: string, slotId: string): Program {
  return mapSession(program, sessionId, (s) => ({
    ...s,
    slots: s.slots.map((sl) => {
      if (sl.id !== slotId) return sl;
      const newEx: ExerciseTemplate = {
        id: makeId('ex'),
        name: 'Nuovo esercizio',
        targetSets: 3,
        targetReps: 10,
        loadStep: { small: 2.5, large: 5 },
      };
      return { ...sl, type: 'superset', exercises: [...sl.exercises, newEx] };
    }),
  }));
}

export function removeExerciseFromSlot(program: Program, sessionId: string, slotId: string, exerciseId: string): Program {
  return mapSession(program, sessionId, (s) => ({
    ...s,
    slots: s.slots
      .map((sl) => {
        if (sl.id !== slotId) return sl;
        const exercises = sl.exercises.filter((e) => e.id !== exerciseId);
        return { ...sl, exercises, type: exercises.length > 1 ? ('superset' as const) : ('single' as const) };
      })
      .filter((sl) => sl.exercises.length > 0),
  }));
}

export function updateExercise(
  program: Program,
  sessionId: string,
  slotId: string,
  exerciseId: string,
  patch: Partial<ExerciseTemplate>,
): Program {
  return mapSession(program, sessionId, (s) => ({
    ...s,
    slots: s.slots.map((sl) =>
      sl.id !== slotId
        ? sl
        : { ...sl, exercises: sl.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)) },
    ),
  }));
}
