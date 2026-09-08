import { useEffect, useRef, useState } from 'react';
import { useRestTimer } from '../store/useRestTimer';
import { useStore } from '../store/useStore';
import { playEndOfRestBeep, vibrate } from '../lib/sound';

const AUTO_DISMISS_MS = 4000;

export function RestTimerBar() {
  const { endTimestamp, totalSeconds, label, adjust, skip } = useRestTimer();
  const soundEnabled = useStore((s) => s.settings.soundEnabled);
  const vibrationEnabled = useStore((s) => s.settings.vibrationEnabled);

  const [remainingMs, setRemainingMs] = useState(0);
  const [done, setDone] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (endTimestamp === undefined) {
      setDone(false);
      firedRef.current = false;
      return;
    }
    firedRef.current = false;
    setDone(false);

    const tick = () => {
      const rem = endTimestamp - Date.now();
      setRemainingMs(rem);
      if (rem <= 0 && !firedRef.current) {
        firedRef.current = true;
        setDone(true);
        if (soundEnabled) playEndOfRestBeep();
        if (vibrationEnabled) vibrate([250, 100, 250]);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endTimestamp, soundEnabled, vibrationEnabled]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => skip(), AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [done, skip]);

  if (endTimestamp === undefined) return null;

  const totalRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
  const mm = String(Math.floor(totalRemaining / 60)).padStart(2, '0');
  const ss = String(totalRemaining % 60).padStart(2, '0');
  const progress = totalSeconds ? Math.min(1, Math.max(0, 1 - remainingMs / (totalSeconds * 1000))) : 0;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-neutral-800 bg-neutral-900/98 px-4 pt-2 pb-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full rounded-full transition-[width] ${done ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs text-neutral-400">{label ?? 'Recupero'}</div>
          {done ? (
            <div className="text-2xl font-black text-green-400">Recupero finito ✓</div>
          ) : (
            <div className="text-3xl font-black tabular-nums text-white">
              {mm}:{ss}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!done && (
            <>
              <button
                type="button"
                onClick={() => adjust(-30)}
                className="min-h-12 min-w-14 rounded-xl bg-neutral-800 text-sm font-semibold text-neutral-200 active:bg-neutral-700"
              >
                -30s
              </button>
              <button
                type="button"
                onClick={() => adjust(30)}
                className="min-h-12 min-w-14 rounded-xl bg-neutral-800 text-sm font-semibold text-neutral-200 active:bg-neutral-700"
              >
                +30s
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => skip()}
            className="min-h-12 min-w-16 rounded-xl bg-neutral-700 text-sm font-semibold text-white active:bg-neutral-600"
          >
            Salta
          </button>
        </div>
      </div>
    </div>
  );
}
