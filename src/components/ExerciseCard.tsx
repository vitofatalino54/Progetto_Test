import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Stepper } from './Stepper';
import { findLastExerciseLog, formatLastTime, formatWeight } from '../lib/workoutStats';
import type { ExerciseLog, ExerciseTemplate, WorkoutLog } from '../types';

interface ExerciseCardProps {
  workoutLog: WorkoutLog;
  exerciseLog: ExerciseLog;
  template: ExerciseTemplate;
  /** true se questo esercizio, nella superserie, deve aspettare che il precedente completi la stessa serie */
  blockedUntilPartnerCatchesUp: string | null;
  onSetLogged: () => void;
}

export function ExerciseCard({
  workoutLog,
  exerciseLog,
  template,
  blockedUntilPartnerCatchesUp,
  onSetLogged,
}: ExerciseCardProps) {
  const workoutLogs = useStore((s) => s.workoutLogs);
  const logSet = useStore((s) => s.logSet);
  const skipExercise = useStore((s) => s.skipExercise);
  const setExerciseNotes = useStore((s) => s.setExerciseNotes);
  const removeSet = useStore((s) => s.removeSet);
  const updateSet = useStore((s) => s.updateSet);

  const lastLog = findLastExerciseLog(workoutLogs, exerciseLog.exerciseTemplateId, workoutLog.id);
  const nextSetNumber = exerciseLog.sets.length + 1;
  const isExtraRound = nextSetNumber > exerciseLog.targetSets;

  const prefill = (): { weightKg: number; reps: number } => {
    // Se ho già registrato serie oggi, riparto dall'ultima appena fatta (di solito il peso resta uguale)
    const todayLast = exerciseLog.sets[exerciseLog.sets.length - 1];
    if (todayLast) return { weightKg: todayLast.weightKg, reps: todayLast.reps };
    if (lastLog) {
      const sameSet = lastLog.sets.find((s) => s.setNumber === nextSetNumber);
      const fallback = lastLog.sets[lastLog.sets.length - 1];
      const src = sameSet ?? fallback;
      if (src) return { weightKg: src.weightKg, reps: src.reps };
    }
    return { weightKg: 0, reps: exerciseLog.targetReps };
  };

  const [draft, setDraft] = useState(prefill);
  const [notesOpen, setNotesOpen] = useState(false);
  const [showExtraDraft, setShowExtraDraft] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ weightKg: number; reps: number } | null>(null);

  // Ricalcola il draft ogni volta che passo alla prossima serie da registrare
  useEffect(() => {
    setDraft(prefill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseLog.sets.length]);

  if (exerciseLog.skipped) {
    return (
      <div className="rounded-2xl bg-neutral-900/60 p-4 opacity-70">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-neutral-300">{exerciseLog.name}</div>
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">Saltato</span>
        </div>
        <button
          type="button"
          onClick={() => skipExercise(workoutLog.id, exerciseLog.id, false)}
          className="mt-3 min-h-11 rounded-xl bg-neutral-800 px-4 text-sm text-neutral-200 active:bg-neutral-700"
        >
          Annulla salto
        </button>
      </div>
    );
  }

  const readyForNext = nextSetNumber <= exerciseLog.targetSets || showExtraDraft;

  const doLog = () => {
    logSet(workoutLog.id, exerciseLog.id, { weightKg: draft.weightKg, reps: draft.reps });
    setShowExtraDraft(false);
    onSetLogged();
  };

  return (
    <div className="rounded-2xl bg-neutral-900 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-white">{template.name}</div>
          <div className="text-sm text-neutral-400">
            {exerciseLog.targetSets}x{exerciseLog.targetReps}
          </div>
        </div>
        {exerciseLog.sets.length === 0 && (
          <button
            type="button"
            onClick={() => skipExercise(workoutLog.id, exerciseLog.id, true)}
            className="min-h-9 shrink-0 rounded-lg px-2 text-xs text-neutral-500 active:bg-neutral-800"
          >
            Salta
          </button>
        )}
      </div>

      {/* "Ultima volta" sempre visibile senza tap */}
      <p className="mt-1 text-sm text-amber-400/90">{formatLastTime(lastLog)}</p>

      <div className="mt-3 space-y-2">
        {exerciseLog.sets.map((s) => (
          <div key={s.id} className="rounded-xl bg-neutral-800/60 px-3 py-2">
            {editingSetId === s.id && editDraft ? (
              <div className="space-y-2">
                <Stepper
                  value={editDraft.weightKg}
                  unit="kg"
                  decrements={[-template.loadStep.large, -template.loadStep.small]}
                  increments={[template.loadStep.small, template.loadStep.large]}
                  onChange={(v) => setEditDraft({ ...editDraft, weightKg: v })}
                />
                <Stepper
                  value={editDraft.reps}
                  unit="rip"
                  decrements={[-1]}
                  increments={[1]}
                  onChange={(v) => setEditDraft({ ...editDraft, reps: v })}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateSet(workoutLog.id, exerciseLog.id, s.id, editDraft);
                      setEditingSetId(null);
                    }}
                    className="min-h-11 flex-1 rounded-xl bg-blue-600 text-sm font-semibold active:bg-blue-500"
                  >
                    Salva
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSet(workoutLog.id, exerciseLog.id, s.id)}
                    className="min-h-11 rounded-xl bg-neutral-700 px-4 text-sm active:bg-neutral-600"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingSetId(s.id);
                  setEditDraft({ weightKg: s.weightKg, reps: s.reps });
                }}
                className="flex min-h-11 w-full items-center justify-between text-left"
              >
                <span className="text-neutral-200">
                  Serie {s.setNumber}
                  {s.isExtra ? ' (extra)' : ''}
                </span>
                <span className="font-semibold text-white">
                  {formatWeight(s.weightKg)}kg x {s.reps}
                  <span className="ml-2 text-green-400">✓</span>
                </span>
              </button>
            )}
          </div>
        ))}

        {readyForNext &&
          (blockedUntilPartnerCatchesUp ? (
            <div className="rounded-xl bg-neutral-800/40 px-3 py-3 text-sm text-neutral-500">
              Prima completa: {blockedUntilPartnerCatchesUp}
            </div>
          ) : (
            <div className="space-y-2 rounded-xl bg-neutral-800/40 p-3">
              <div className="text-sm text-neutral-400">
                Serie {nextSetNumber}
                {isExtraRound ? ' (extra)' : ''}
              </div>
              <Stepper
                value={draft.weightKg}
                unit="kg"
                decrements={[-template.loadStep.large, -template.loadStep.small]}
                increments={[template.loadStep.small, template.loadStep.large]}
                onChange={(v) => setDraft({ ...draft, weightKg: v })}
              />
              <Stepper
                value={draft.reps}
                unit="rip"
                decrements={[-1]}
                increments={[1]}
                onChange={(v) => setDraft({ ...draft, reps: v })}
              />
              <button
                type="button"
                onClick={doLog}
                className="min-h-14 w-full rounded-xl bg-green-600 text-lg font-bold text-white active:bg-green-500"
              >
                Serie completata ✓
              </button>
            </div>
          ))}

        {!readyForNext && (
          <button
            type="button"
            onClick={() => setShowExtraDraft(true)}
            className="min-h-11 w-full rounded-xl border border-dashed border-neutral-700 text-sm text-neutral-400 active:bg-neutral-800"
          >
            + Aggiungi serie extra
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setNotesOpen((v) => !v)}
        className="mt-3 min-h-9 text-sm text-neutral-500 underline underline-offset-2"
      >
        {notesOpen ? 'Nascondi note' : exerciseLog.notes ? 'Modifica note' : '+ Nota esercizio'}
      </button>
      {notesOpen && (
        <textarea
          value={exerciseLog.notes}
          onChange={(e) => setExerciseNotes(workoutLog.id, exerciseLog.id, e.target.value)}
          placeholder="Es. tecnica, fastidi, sensazioni..."
          className="mt-2 min-h-20 w-full rounded-xl bg-neutral-800 p-3 text-sm text-white outline-none"
        />
      )}
    </div>
  );
}
