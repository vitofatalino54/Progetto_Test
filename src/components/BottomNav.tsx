import { SAFE_NAV } from '../lib/safeArea';

export type View = 'home' | 'session' | 'history' | 'progress' | 'program' | 'backup';

interface BottomNavProps {
  view: View;
  hasActiveSession: boolean;
  onNavigate: (view: View) => void;
}

const items: { key: View; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'session', label: 'Sessione', icon: '🏋️' },
  { key: 'history', label: 'Storico', icon: '📜' },
  { key: 'progress', label: 'Progressi', icon: '📈' },
  { key: 'program', label: 'Programma', icon: '📋' },
];

export function BottomNav({ view, hasActiveSession, onNavigate }: BottomNavProps) {
  return (
    <nav className={`fixed inset-x-0 bottom-0 z-20 flex border-t border-neutral-800 bg-neutral-950/95 backdrop-blur ${SAFE_NAV}`}>
      {items.map((item) => {
        if (item.key === 'session' && !hasActiveSession) return null;
        const active = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              active ? 'text-blue-400' : 'text-neutral-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
