import { useMemo, useState, type ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../store/useStore';
import { listAllExercises } from '../lib/programHelpers';
import { bestSetEpley, exerciseMaxWeight, exerciseVolume, formatWeight } from '../lib/workoutStats';

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' });

interface DataPoint {
  date: string;
  timestamp: number;
  maxWeight: number;
  volume: number;
  epley: number;
}

export function Progress() {
  const program = useStore((s) => s.program);
  const workoutLogs = useStore((s) => s.workoutLogs);

  const allExercises = useMemo(() => listAllExercises(program), [program]);
  const highlighted = allExercises.filter((e) => e.template.highlight);
  const others = allExercises.filter((e) => !e.template.highlight);

  const [selectedId, setSelectedId] = useState<string>(highlighted[0]?.template.id ?? allExercises[0]?.template.id ?? '');
  const selectedRef = allExercises.find((e) => e.template.id === selectedId);

  const dataPoints = useMemo<DataPoint[]>(() => {
    if (!selectedId) return [];
    const points: DataPoint[] = [];
    const completed = workoutLogs
      .filter((w) => w.status === 'completed')
      .sort((a, b) => new Date(a.completedAt ?? a.startedAt).getTime() - new Date(b.completedAt ?? b.startedAt).getTime());

    for (const w of completed) {
      const log = w.exerciseLogs.find((e) => e.exerciseTemplateId === selectedId && !e.skipped && e.sets.length > 0);
      if (!log) continue;
      const ts = new Date(w.completedAt ?? w.startedAt).getTime();
      points.push({
        date: dateFmt.format(new Date(ts)),
        timestamp: ts,
        maxWeight: exerciseMaxWeight(log),
        volume: exerciseVolume(log),
        epley: Math.round(bestSetEpley(log)),
      });
    }
    return points;
  }, [workoutLogs, selectedId]);

  const latest = dataPoints[dataPoints.length - 1];
  const referenceLift = selectedRef?.template.referenceLift;
  const referenceMax = referenceLift ? program.referenceMaxes[referenceLift] : undefined;

  return (
    <div className="p-4 pb-40">
      <h1 className="text-2xl font-bold">Progressi</h1>

      <div className="mt-4 -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {highlighted.map((e) => (
            <ExerciseChip key={e.template.id} name={e.template.name} active={e.template.id === selectedId} highlighted onClick={() => setSelectedId(e.template.id)} />
          ))}
          {others.map((e) => (
            <ExerciseChip key={e.template.id} name={e.template.name} active={e.template.id === selectedId} onClick={() => setSelectedId(e.template.id)} />
          ))}
        </div>
      </div>

      {!selectedRef || dataPoints.length === 0 ? (
        <p className="mt-8 text-neutral-400">
          {selectedRef ? 'Nessun dato ancora per questo esercizio. Registra qualche seduta per vedere i progressi.' : 'Nessun esercizio nel programma.'}
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label="Carico massimo" value={`${formatWeight(latest.maxWeight)} kg`} />
            <StatCard label="1RM stimato (Epley)" value={`${formatWeight(latest.epley)} kg`} />
            {referenceMax !== undefined && (
              <StatCard
                label={`% del massimale (${formatWeight(referenceMax)} kg)`}
                value={`${Math.round((latest.maxWeight / referenceMax) * 100)}%`}
                full
              />
            )}
          </div>

          <ChartSection title="Carico massimo per seduta (kg)">
            <LineChart data={dataPoints} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8 }} labelStyle={{ color: '#e5e5e5' }} />
              <Line type="monotone" dataKey="maxWeight" name="Carico max" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="epley" name="1RM stimato" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2 }} />
            </LineChart>
          </ChartSection>

          <ChartSection title="Volume totale per seduta (kg x rip)">
            <LineChart data={dataPoints} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8 }} labelStyle={{ color: '#e5e5e5' }} />
              <Line type="monotone" dataKey="volume" name="Volume" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartSection>
        </>
      )}
    </div>
  );
}

function ExerciseChip({
  name,
  active,
  highlighted,
  onClick,
}: {
  name: string;
  active: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
        active
          ? 'bg-blue-600 text-white'
          : highlighted
            ? 'bg-amber-500/20 text-amber-300'
            : 'bg-neutral-900 text-neutral-300'
      }`}
    >
      {name}
    </button>
  );
}

function StatCard({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`rounded-2xl bg-neutral-900 p-4 ${full ? 'col-span-2' : ''}`}>
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function ChartSection({ title, children }: { title: string; children: ReactElement }) {
  return (
    <div className="mt-4 rounded-2xl bg-neutral-900 p-4">
      <div className="text-sm font-semibold text-neutral-300">{title}</div>
      <div className="mt-2 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
