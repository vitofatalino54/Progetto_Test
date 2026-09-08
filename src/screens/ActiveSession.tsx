import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useRestTimer } from '../store/useRestTimer';
import { SlotSection } from '../components/SlotSection';
import { releaseWakeLock, requestWakeLock } from '../lib/wakeLock';
import { SAFE_CONTENT_BOTTOM, SAFE_CONTENT_BOTTOM_SM, SAFE_TOP, SAFE_X } from '../lib/safeArea';

interface ActiveSessionProps {
  workoutLogId: string;
  onExit: () => void;
}

export function ActiveSession({ workoutLogId, onExit }: ActiveSessionProps) {
  const program = useStore((s) => s.program);
  const workoutLog = useStore((s) => s.workoutLogs.find((w) => w.id === workoutLogId));
  const completeWorkout = useStore((s) => s.completeWorkout);
  const discardWorkout = useStore((s) => s.discardWorkout);
  const setGeneralNotes = useStore((s) => s.setGeneralNotes);
  const startRest = useRestTimer((s) => s.start);

  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (!workoutLog) return;
    const startedMs = new Date(workoutLog.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [workoutLog?.startedAt]);

  // Schermo sempre acceso durante la seduta: la Wake Lock API viene rilasciata
  // automaticamente dal browser quando il tab passa in background, quindi la
  // richiediamo di nuovo quando torna visibile.
  useEffect(() => {
    requestWakeLock();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  if (!workoutLog) {
    return (
      <div className={`min-h-dvh ${SAFE_TOP} ${SAFE_X}`}>
        <p>Nessuna sessione attiva.</p>
        <button onClick={onExit} className="mt-3 min-h-12 rounded-xl bg-neutral-800 px-4">
          Torna alla home
        </button>
      </div>
    );
  }

  const session = program.sessions.find((s) => s.id === workoutLog.sessionTemplateId);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  if (finishing) {
    return (
      <div className={`min-h-dvh ${SAFE_TOP} ${SAFE_X} ${SAFE_CONTENT_BOTTOM_SM}`}>
        <h2 className="text-xl font-bold">Fine seduta</h2>
        <p className="mt-1 text-sm text-neutral-400">Note generali: dolori, tecnica, energia, sonno...</p>
        <textarea
          autoFocus
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          placeholder="Es. buona energia, spalla dx un po' rigida, dormito poco..."
          className="mt-3 min-h-40 w-full rounded-xl bg-neutral-800 p-3 text-white outline-none"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setFinishing(false)}
            className="min-h-14 flex-1 rounded-xl bg-neutral-800 text-base font-semibold active:bg-neutral-700"
          >
            Indietro
          </button>
          <button
            onClick={() => {
              setGeneralNotes(workoutLog.id, notesDraft);
              completeWorkout(workoutLog.id);
              onExit();
            }}
            className="min-h-14 flex-1 rounded-xl bg-green-600 text-base font-bold text-white active:bg-green-500"
          >
            Salva e termina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-dvh ${SAFE_CONTENT_BOTTOM}`}>
      <div className={`sticky top-0 z-10 flex items-center justify-between bg-neutral-950/95 pb-4 backdrop-blur ${SAFE_TOP} ${SAFE_X}`}>
        <div>
          <div className="text-lg font-bold">{workoutLog.sessionName}</div>
          <div className="text-sm text-neutral-400">
            {minutes}:{seconds}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm('Abbandonare questa seduta? I dati registrati andranno persi.')) {
                discardWorkout(workoutLog.id);
                onExit();
              }
            }}
            className="min-h-11 rounded-xl px-3 text-sm text-neutral-500 active:bg-neutral-800"
          >
            Abbandona
          </button>
          <button
            onClick={() => setFinishing(true)}
            className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white active:bg-blue-500"
          >
            Termina
          </button>
        </div>
      </div>

      <div className={`space-y-4 py-4 ${SAFE_X}`}>
        {session?.slots.map((slot) => (
          <SlotSection
            key={slot.id}
            slot={slot}
            workoutLog={workoutLog}
            onRestDue={(secs, label) => startRest(secs, label)}
          />
        ))}
      </div>
    </div>
  );
}
