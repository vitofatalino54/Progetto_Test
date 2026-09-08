import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  addExerciseToSlot,
  addSession,
  addSlot,
  moveSession,
  moveSlot,
  removeExerciseFromSlot,
  removeSession,
  removeSlot,
  updateExercise,
  updateSessionName,
  updateSlotRest,
} from '../lib/programEdit';
import { SAFE_CONTENT_BOTTOM, SAFE_TOP, SAFE_X } from '../lib/safeArea';
import type { ExerciseSlot, ExerciseTemplate, Program, ReferenceMaxes, SessionTemplate } from '../types';

export function ProgramEditor() {
  const program = useStore((s) => s.program);
  const setProgram = useStore((s) => s.setProgram);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sessions = [...program.sessions].sort((a, b) => a.order - b.order);

  return (
    <div className={`min-h-dvh ${SAFE_TOP} ${SAFE_X} ${SAFE_CONTENT_BOTTOM}`}>
      <h1 className="text-2xl font-bold">Programma</h1>
      <p className="mt-1 text-sm text-neutral-400">Modifica esercizi, serie, ripetizioni e tempi di recupero.</p>

      <ReferenceMaxesEditor program={program} setProgram={setProgram} />

      <div className="mt-4 space-y-3">
        {sessions.map((session, i) => (
          <SessionCard
            key={session.id}
            session={session}
            isFirst={i === 0}
            isLast={i === sessions.length - 1}
            expanded={expanded.has(session.id)}
            onToggle={() => toggle(session.id)}
            onChange={setProgram}
          />
        ))}
      </div>

      <button
        onClick={() => setProgram(addSession(program))}
        className="mt-4 min-h-14 w-full rounded-2xl border border-dashed border-neutral-700 text-neutral-400 active:bg-neutral-900"
      >
        + Nuova seduta
      </button>
    </div>
  );
}

function ReferenceMaxesEditor({
  program,
  setProgram,
}: {
  program: Program;
  setProgram: (p: typeof program) => void;
}) {
  const update = (key: keyof ReferenceMaxes, value: number) =>
    setProgram({ ...program, referenceMaxes: { ...program.referenceMaxes, [key]: value } });

  return (
    <div className="mt-4 rounded-2xl bg-neutral-900 p-4">
      <div className="text-sm font-semibold text-neutral-300">Massimali di riferimento (per Progressi)</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <LabeledNumber label="Panca" value={program.referenceMaxes.bench} onChange={(v) => update('bench', v)} />
        <LabeledNumber label="Squat" value={program.referenceMaxes.squat} onChange={(v) => update('squat', v)} />
        <LabeledNumber label="Stacco" value={program.referenceMaxes.deadlift} onChange={(v) => update('deadlift', v)} />
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isFirst,
  isLast,
  expanded,
  onToggle,
  onChange,
}: {
  session: SessionTemplate;
  isFirst: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChange: (p: Program) => void;
}) {
  const program = useStore((s) => s.program);

  return (
    <div className="rounded-2xl bg-neutral-900 p-4">
      <div className="flex items-center gap-2">
        <button onClick={onToggle} className="flex min-h-11 flex-1 items-center gap-2 text-left">
          <span className="text-neutral-500">{expanded ? '▾' : '▸'}</span>
          <input
            value={session.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange(updateSessionName(program, session.id, e.target.value))}
            className="min-h-11 flex-1 rounded-lg bg-transparent px-1 text-lg font-bold text-white outline-none focus:bg-neutral-800"
          />
        </button>
        <button
          disabled={isFirst}
          onClick={() => onChange(moveSession(program, session.id, -1))}
          className="min-h-11 min-w-11 rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          disabled={isLast}
          onClick={() => onChange(moveSession(program, session.id, 1))}
          className="min-h-11 min-w-11 rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-30"
        >
          ↓
        </button>
        <button
          onClick={() => {
            if (confirm(`Eliminare la seduta "${session.name}"?`)) onChange(removeSession(program, session.id));
          }}
          className="min-h-11 min-w-11 rounded-lg bg-neutral-800 text-red-400"
        >
          🗑
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {session.slots.map((slot, i) => (
            <SlotEditor
              key={slot.id}
              sessionId={session.id}
              slot={slot}
              isFirst={i === 0}
              isLast={i === session.slots.length - 1}
              onChange={onChange}
            />
          ))}
          <button
            onClick={() => onChange(addSlot(program, session.id))}
            className="min-h-12 w-full rounded-xl border border-dashed border-neutral-700 text-sm text-neutral-400 active:bg-neutral-800"
          >
            + Nuovo esercizio/slot
          </button>
        </div>
      )}
    </div>
  );
}

function SlotEditor({
  sessionId,
  slot,
  isFirst,
  isLast,
  onChange,
}: {
  sessionId: string;
  slot: ExerciseSlot;
  isFirst: boolean;
  isLast: boolean;
  onChange: (p: Program) => void;
}) {
  const program = useStore((s) => s.program);

  return (
    <div className="rounded-xl bg-neutral-800/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">
          {slot.type === 'superset' ? 'Superserie' : 'Esercizio'}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-neutral-400">
            Rec.
            <input
              type="number"
              value={slot.restSeconds}
              onChange={(e) => onChange(updateSlotRest(program, sessionId, slot.id, Number(e.target.value) || 0))}
              className="min-h-9 w-16 rounded-lg bg-neutral-800 px-2 text-center text-white outline-none"
            />
            s
          </label>
          <button disabled={isFirst} onClick={() => onChange(moveSlot(program, sessionId, slot.id, -1))} className="min-h-9 min-w-9 rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-30">↑</button>
          <button disabled={isLast} onClick={() => onChange(moveSlot(program, sessionId, slot.id, 1))} className="min-h-9 min-w-9 rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-30">↓</button>
          <button
            onClick={() => {
              if (confirm('Eliminare questo slot esercizio?')) onChange(removeSlot(program, sessionId, slot.id));
            }}
            className="min-h-9 min-w-9 rounded-lg bg-neutral-800 text-red-400"
          >
            🗑
          </button>
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {slot.exercises.map((ex) => (
          <ExerciseEditor
            key={ex.id}
            sessionId={sessionId}
            slotId={slot.id}
            exercise={ex}
            canRemove={slot.exercises.length > 1}
            onChange={onChange}
          />
        ))}
      </div>

      <button
        onClick={() => onChange(addExerciseToSlot(program, sessionId, slot.id))}
        className="mt-2 min-h-10 w-full rounded-lg border border-dashed border-neutral-700 text-xs text-neutral-400 active:bg-neutral-800"
      >
        + Abbina esercizio (superserie)
      </button>
    </div>
  );
}

function ExerciseEditor({
  sessionId,
  slotId,
  exercise,
  canRemove,
  onChange,
}: {
  sessionId: string;
  slotId: string;
  exercise: ExerciseTemplate;
  canRemove: boolean;
  onChange: (p: Program) => void;
}) {
  const program = useStore((s) => s.program);
  const patch = (p: Partial<ExerciseTemplate>) => onChange(updateExercise(program, sessionId, slotId, exercise.id, p));

  return (
    <div className="rounded-lg bg-neutral-900 p-3">
      <div className="flex items-center gap-2">
        <input
          value={exercise.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="min-h-10 flex-1 rounded-lg bg-neutral-800 px-2 text-white outline-none"
        />
        {canRemove && (
          <button
            onClick={() => onChange(removeExerciseFromSlot(program, sessionId, slotId, exercise.id))}
            className="min-h-10 min-w-10 rounded-lg bg-neutral-800 text-red-400"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <LabeledNumber label="Serie" value={exercise.targetSets} onChange={(v) => patch({ targetSets: v })} />
        <LabeledNumber label="Ripetizioni" value={exercise.targetReps} onChange={(v) => patch({ targetReps: v })} />
        <LabeledNumber label="Step piccolo (kg)" value={exercise.loadStep.small} step={0.25} onChange={(v) => patch({ loadStep: { ...exercise.loadStep, small: v } })} />
        <LabeledNumber label="Step grande (kg)" value={exercise.loadStep.large} step={0.5} onChange={(v) => patch({ loadStep: { ...exercise.loadStep, large: v } })} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={!!exercise.highlight} onChange={(e) => patch({ highlight: e.target.checked })} className="h-5 w-5" />
          In evidenza in Progressi
        </label>
        {exercise.highlight && (
          <select
            value={exercise.referenceLift ?? ''}
            onChange={(e) => patch({ referenceLift: (e.target.value || undefined) as ExerciseTemplate['referenceLift'] })}
            className="min-h-9 rounded-lg bg-neutral-800 px-2 text-sm text-white outline-none"
          >
            <option value="">Nessun confronto %</option>
            <option value="bench">Confronta con panca</option>
            <option value="squat">Confronta con squat</option>
            <option value="deadlift">Confronta con stacco</option>
          </select>
        )}
      </div>
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-xs text-neutral-400">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 min-h-10 w-full rounded-lg bg-neutral-800 px-2 text-white outline-none"
      />
    </label>
  );
}
