import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { SAFE_CONTENT_BOTTOM, SAFE_TOP, SAFE_X } from '../lib/safeArea';
import type { PersistedData } from '../types';

interface BackupProps {
  onBack: () => void;
}

function isPersistedData(data: unknown): data is PersistedData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.version === 'number' && typeof d.program === 'object' && Array.isArray(d.workoutLogs);
}

export function Backup({ onBack }: BackupProps) {
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const workoutLogs = useStore((s) => s.workoutLogs);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `gym-tracker-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage('Backup esportato.');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (!isPersistedData(parsed)) {
        setMessage('File non valido: non sembra un backup di questa app.');
        return;
      }
      const ok = confirm(
        `Importare questo backup? Sostituirà tutti i dati attuali (programma e ${workoutLogs.length} sedute in storico).`,
      );
      if (!ok) return;
      importData(parsed);
      setMessage('Backup importato.');
    } catch {
      setMessage('Errore nella lettura del file: assicurati che sia un JSON valido.');
    }
  };

  return (
    <div className={`min-h-dvh ${SAFE_TOP} ${SAFE_X} ${SAFE_CONTENT_BOTTOM}`}>
      <button onClick={onBack} className="min-h-11 text-sm text-neutral-400">
        ← Indietro
      </button>
      <h1 className="mt-2 text-2xl font-bold">Backup e impostazioni</h1>

      <div className="mt-4 rounded-2xl bg-neutral-900 p-4">
        <div className="text-sm font-semibold text-neutral-300">Backup dati</div>
        <p className="mt-1 text-sm text-neutral-400">
          Esporta tutti i dati (programma e storico allenamenti, {workoutLogs.length} sedute) in un file JSON, o
          importane uno per ripristinarli. L'import sostituisce completamente i dati attuali.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleExport}
            className="min-h-14 flex-1 rounded-xl bg-blue-600 font-semibold text-white active:bg-blue-500"
          >
            Esporta JSON
          </button>
          <button
            onClick={handleImportClick}
            className="min-h-14 flex-1 rounded-xl bg-neutral-800 font-semibold text-white active:bg-neutral-700"
          >
            Importa JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
        </div>
        {message && <p className="mt-3 text-sm text-green-400">{message}</p>}
      </div>

      <div className="mt-4 rounded-2xl bg-neutral-900 p-4">
        <div className="text-sm font-semibold text-neutral-300">Timer di recupero</div>
        <label className="mt-3 flex items-center justify-between">
          <span className="text-neutral-200">Suono a fine recupero</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            className="h-6 w-6"
          />
        </label>
        <label className="mt-3 flex items-center justify-between">
          <span className="text-neutral-200">Vibrazione a fine recupero</span>
          <input
            type="checkbox"
            checked={settings.vibrationEnabled}
            onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
            className="h-6 w-6"
          />
        </label>
      </div>
    </div>
  );
}
