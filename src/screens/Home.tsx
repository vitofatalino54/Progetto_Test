import { useStore } from '../store/useStore';
import { SAFE_CONTENT_BOTTOM, SAFE_TOP, SAFE_X } from '../lib/safeArea';

interface HomeProps {
  onOpenSession: () => void;
  onOpenBackup: () => void;
}

export function Home({ onOpenSession, onOpenBackup }: HomeProps) {
  const program = useStore((s) => s.program);
  const workoutLogs = useStore((s) => s.workoutLogs);
  const activeWorkoutLogId = useStore((s) => s.activeWorkoutLogId);
  const startSession = useStore((s) => s.startSession);

  const activeWorkout = workoutLogs.find((w) => w.id === activeWorkoutLogId && w.status === 'in_progress');

  const handleStart = (sessionId: string) => {
    if (activeWorkout && activeWorkout.sessionTemplateId !== sessionId) {
      const ok = confirm(
        `Hai già "${activeWorkout.sessionName}" in corso. Iniziare una nuova seduta abbandonerà quella in corso. Continuare?`,
      );
      if (!ok) return;
    }
    if (activeWorkout && activeWorkout.sessionTemplateId === sessionId) {
      onOpenSession();
      return;
    }
    startSession(sessionId);
    onOpenSession();
  };

  return (
    <div className={`min-h-dvh ${SAFE_CONTENT_BOTTOM}`}>
      <div className={`sticky top-0 z-10 flex items-center justify-between bg-neutral-950 pb-4 ${SAFE_TOP} ${SAFE_X}`}>
        <h1 className="text-2xl font-bold">Allenamento</h1>
        <button
          onClick={onOpenBackup}
          aria-label="Impostazioni e backup"
          className="min-h-11 min-w-11 rounded-xl bg-neutral-900 text-xl active:bg-neutral-800"
        >
          ⚙️
        </button>
      </div>

      <div className={SAFE_X}>
        {activeWorkout && (
          <button
            onClick={onOpenSession}
            className="flex w-full min-h-16 items-center justify-between rounded-2xl bg-blue-600 px-4 text-left active:bg-blue-500"
          >
            <div>
              <div className="font-bold text-white">Riprendi seduta in corso</div>
              <div className="text-sm text-blue-100">{activeWorkout.sessionName}</div>
            </div>
            <span className="text-2xl">→</span>
          </button>
        )}

        <div className="mt-6 space-y-3">
          {program.sessions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((session) => (
              <button
                key={session.id}
                onClick={() => handleStart(session.id)}
                className="block w-full min-h-20 rounded-2xl bg-neutral-900 p-4 text-left active:bg-neutral-800"
              >
                <div className="text-lg font-bold text-white">{session.name}</div>
                <div className="mt-1 text-sm text-neutral-400">
                  {session.slots.reduce((n, s) => n + s.exercises.length, 0)} esercizi
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
