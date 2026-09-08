import { useState } from 'react';
import { useStore } from '../store/useStore';
import { exerciseVolume, formatWeight, workoutDurationMinutes, workoutVolume } from '../lib/workoutStats';
import type { WorkoutLog } from '../types';

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function History() {
  const workoutLogs = useStore((s) => s.workoutLogs);
  const deleteWorkoutLog = useStore((s) => s.deleteWorkoutLog);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const completed = workoutLogs
    .filter((w) => w.status === 'completed')
    .sort((a, b) => new Date(b.completedAt ?? b.startedAt).getTime() - new Date(a.completedAt ?? a.startedAt).getTime());

  const selected = completed.find((w) => w.id === selectedId);

  if (selected) {
    return <WorkoutDetail workout={selected} onBack={() => setSelectedId(null)} onDelete={() => { deleteWorkoutLog(selected.id); setSelectedId(null); }} />;
  }

  return (
    <div className="p-4 pb-40">
      <h1 className="text-2xl font-bold">Storico</h1>

      {completed.length === 0 ? (
        <p className="mt-4 text-neutral-400">Nessuna seduta completata ancora.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {completed.map((w) => {
            const duration = workoutDurationMinutes(w);
            const volume = workoutVolume(w);
            return (
              <li key={w.id}>
                <button
                  onClick={() => setSelectedId(w.id)}
                  className="block min-h-20 w-full rounded-2xl bg-neutral-900 p-4 text-left active:bg-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{w.sessionName}</span>
                    <span className="text-sm text-neutral-400">{formatDate(w.startedAt)}</span>
                  </div>
                  <div className="mt-1 flex gap-4 text-sm text-neutral-400">
                    {duration !== undefined && <span>{duration} min</span>}
                    <span>{formatWeight(volume)} kg totali</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WorkoutDetail({ workout, onBack, onDelete }: { workout: WorkoutLog; onBack: () => void; onDelete: () => void }) {
  const duration = workoutDurationMinutes(workout);
  const volume = workoutVolume(workout);

  return (
    <div className="p-4 pb-40">
      <button onClick={onBack} className="min-h-11 text-sm text-neutral-400">
        ← Storico
      </button>
      <h1 className="mt-2 text-2xl font-bold">{workout.sessionName}</h1>
      <div className="mt-1 text-sm text-neutral-400">
        {formatDate(workout.startedAt)} · {timeFmt.format(new Date(workout.startedAt))}
        {duration !== undefined && ` · ${duration} min`} · {formatWeight(volume)} kg totali
      </div>

      <div className="mt-4 space-y-3">
        {workout.exerciseLogs.map((ex) => (
          <div key={ex.id} className="rounded-2xl bg-neutral-900 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{ex.name}</span>
              {ex.skipped ? (
                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">Saltato</span>
              ) : (
                <span className="text-xs text-neutral-500">{formatWeight(exerciseVolume(ex))} kg</span>
              )}
            </div>
            {ex.sets.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {ex.sets.map((s) => (
                  <span key={s.id} className="rounded-lg bg-neutral-800 px-2 py-1 text-sm text-neutral-200">
                    {formatWeight(s.weightKg)}kg x {s.reps}
                    {s.isExtra ? ' *' : ''}
                  </span>
                ))}
              </div>
            )}
            {ex.notes && <p className="mt-2 text-sm text-neutral-400">📝 {ex.notes}</p>}
          </div>
        ))}
      </div>

      {workout.generalNotes && (
        <div className="mt-4 rounded-2xl bg-neutral-900 p-4">
          <div className="text-sm font-semibold text-neutral-300">Note di fine seduta</div>
          <p className="mt-1 text-sm text-neutral-400">{workout.generalNotes}</p>
        </div>
      )}

      <button
        onClick={() => {
          if (confirm('Eliminare definitivamente questa seduta dallo storico?')) onDelete();
        }}
        className="mt-6 min-h-11 rounded-xl px-4 text-sm text-red-400 active:bg-neutral-900"
      >
        Elimina seduta
      </button>
    </div>
  );
}
