import { useStore } from './store/useStore';

function App() {
  const program = useStore((s) => s.program);
  const workoutLogs = useStore((s) => s.workoutLogs);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold">{program.name}</h1>
      <p className="mt-2 text-neutral-400">Sedute caricate: {program.sessions.length}</p>
      <ul className="mt-4 space-y-2">
        {program.sessions.map((s) => (
          <li key={s.id} className="rounded-xl bg-neutral-900 p-4">
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-neutral-400">{s.slots.length} slot esercizio</div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-neutral-500">Sedute registrate in storico: {workoutLogs.length}</p>
    </div>
  );
}

export default App;
