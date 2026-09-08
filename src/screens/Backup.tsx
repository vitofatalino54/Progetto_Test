interface BackupProps {
  onBack: () => void;
}

export function Backup({ onBack }: BackupProps) {
  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="min-h-11 text-sm text-neutral-400">
        ← Indietro
      </button>
      <h1 className="mt-2 text-2xl font-bold">Backup</h1>
      <p className="mt-2 text-neutral-400">Export/import in arrivo in uno step successivo.</p>
    </div>
  );
}
