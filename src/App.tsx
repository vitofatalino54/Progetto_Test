import { useState } from 'react';
import { useStore } from './store/useStore';
import { BottomNav, type View } from './components/BottomNav';
import { RestTimerBar } from './components/RestTimerBar';
import { Home } from './screens/Home';
import { ActiveSession } from './screens/ActiveSession';
import { History } from './screens/History';
import { Progress } from './screens/Progress';
import { ProgramEditor } from './screens/ProgramEditor';
import { Backup } from './screens/Backup';

function App() {
  const [view, setView] = useState<View>('home');
  const activeWorkoutLogId = useStore((s) => s.activeWorkoutLogId);
  const hasActiveSession = Boolean(activeWorkoutLogId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {view === 'home' && <Home onOpenSession={() => setView('session')} onOpenBackup={() => setView('backup')} />}
      {view === 'session' &&
        (activeWorkoutLogId ? (
          <ActiveSession workoutLogId={activeWorkoutLogId} onExit={() => setView('home')} />
        ) : (
          <Home onOpenSession={() => setView('session')} onOpenBackup={() => setView('backup')} />
        ))}
      {view === 'history' && <History />}
      {view === 'progress' && <Progress />}
      {view === 'program' && <ProgramEditor />}
      {view === 'backup' && <Backup onBack={() => setView('home')} />}

      <RestTimerBar />
      {view !== 'backup' && <BottomNav view={view} hasActiveSession={hasActiveSession} onNavigate={setView} />}
    </div>
  );
}

export default App;
