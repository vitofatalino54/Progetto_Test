import { useEffect, useState } from 'react';
import { formatWeight } from '../lib/workoutStats';

interface StepperProps {
  value: number;
  unit: string;
  /** Delta negativi da mostrare, in ordine dal più grande (più a sinistra) al più piccolo */
  decrements: number[];
  /** Delta positivi da mostrare, in ordine dal più piccolo (più vicino al valore) al più grande */
  increments: number[];
  onChange: (value: number) => void;
  min?: number;
}

/**
 * Controllo numerico a pulsanti +/- per usare l'app con le mani sudate senza tastiera.
 * Tap sul numero centrale apre l'input diretto come opzione secondaria.
 */
export function Stepper({ value, unit, decrements, increments, onChange, min = 0 }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const clamp = (v: number) => Math.max(min, Math.round(v * 100) / 100);

  const commitDraft = () => {
    const parsed = parseFloat(draft.replace(',', '.'));
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      {decrements.map((d) => (
        <button
          key={`dec-${d}`}
          type="button"
          onClick={() => onChange(clamp(value + d))}
          className="min-h-12 min-w-12 shrink-0 rounded-xl bg-neutral-800 text-lg font-semibold text-neutral-200 active:bg-neutral-700"
        >
          {d}
        </button>
      ))}

      {editing ? (
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft();
          }}
          className="min-h-12 w-20 shrink-0 rounded-xl bg-neutral-800 text-center text-lg font-bold text-white outline-none ring-2 ring-blue-500"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-12 min-w-20 shrink-0 rounded-xl bg-neutral-800/60 px-2 text-center text-lg font-bold text-white active:bg-neutral-700"
        >
          {formatWeight(value)}
          <span className="ml-1 text-xs font-normal text-neutral-400">{unit}</span>
        </button>
      )}

      {increments.map((d) => (
        <button
          key={`inc-${d}`}
          type="button"
          onClick={() => onChange(clamp(value + d))}
          className="min-h-12 min-w-12 shrink-0 rounded-xl bg-neutral-800 text-lg font-semibold text-neutral-200 active:bg-neutral-700"
        >
          +{d}
        </button>
      ))}
    </div>
  );
}
