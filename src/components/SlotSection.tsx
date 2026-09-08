import { ExerciseCard } from './ExerciseCard';
import type { ExerciseSlot, WorkoutLog } from '../types';

interface SlotSectionProps {
  slot: ExerciseSlot;
  workoutLog: WorkoutLog;
  onRestDue: (seconds: number, label: string) => void;
}

export function SlotSection({ slot, workoutLog, onRestDue }: SlotSectionProps) {
  const logs = slot.exercises.map((ex) => workoutLog.exerciseLogs.find((e) => e.exerciseTemplateId === ex.id)!);

  return (
    <div className="space-y-2">
      {slot.type === 'superset' && (
        <div className="px-1 text-xs font-semibold uppercase tracking-wide text-blue-400">Superserie</div>
      )}
      {slot.exercises.map((template, i) => {
        const log = logs[i];
        if (!log) return null;

        // In una superserie, l'esercizio i può registrare la sua prossima serie solo
        // se tutti quelli precedenti hanno già raggiunto lo stesso numero di serie.
        const nextSetNumber = log.sets.length + 1;
        let blockedBy: string | null = null;
        for (let j = 0; j < i; j++) {
          if (logs[j].sets.length < nextSetNumber && !logs[j].skipped) {
            blockedBy = slot.exercises[j].name;
            break;
          }
        }

        const isLastInSlot = i === slot.exercises.length - 1;

        return (
          <ExerciseCard
            key={log.id}
            workoutLog={workoutLog}
            exerciseLog={log}
            template={template}
            blockedUntilPartnerCatchesUp={blockedBy}
            onSetLogged={() => {
              if (isLastInSlot) onRestDue(slot.restSeconds, slot.exercises.map((e) => e.name).join(' + '));
            }}
          />
        );
      })}
    </div>
  );
}
