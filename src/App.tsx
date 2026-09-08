import { lazy, Suspense, useState } from 'react';
import { useStore } from './store/useStore';
import { BottomNav, type View } from './components/BottomNav';
import { RestTimerBar } from './components/RestTimerBar';
import { Home } from './screens/Home';
import { ActiveSession } from './screens/ActiveSession';
import { History } from './screens/History';
import { ProgramEditor } from './screens/ProgramEditor';
import { Backup } from './screens/Backup';
import { SAFE_TOP, SAFE_X } from './lib/safeArea';

// I grafici (Recharts) pesano parecchio: caricati solo quando si apre Progressi.
const Progress = lazy(() => import('./screens/Progress').then((m) => ({ default: m.Progress })));

function App() {
  const [view, setView] = useState<View>('home');
  const activeWorkoutLogId = useStore((s) => s.activeWorkoutLogId);
  const hasActiveSession = Boolean(activeWorkoutLogId);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      {view === 'home' && <Home onOpenSession={() => setView('session')} onOpenBackup={() => setView('backup')} />}
      {view === 'session' &&
        (activeWorkoutLogId ? (
          <ActiveSession workoutLogId={activeWorkoutLogId} onExit={() => setView('home')} />
        ) : (
          <Home onOpenSession={() => setView('session')} onOpenBackup={() => setView('backup')} />
        ))}
      {view === 'history' && <History />}
      {view === 'progress' && (
        <Suspense fallback={<div className={`text-neutral-400 ${SAFE_TOP} ${SAFE_X}`}>Caricamento grafici...</div>}>
          <Progress />
        </Suspense>
      )}
      {view === 'program' && <ProgramEditor />}
      {view === 'backup' && <Backup onBack={() => setView('home')} />}

      <RestTimerBar />
      {view !== 'backup' && <BottomNav view={view} hasActiveSession={hasActiveSession} onNavigate={setView} />}
    </div>
  );
}

export default App;
