/**
 * Wrapper minimale sulla Wake Lock API: mantiene lo schermo acceso durante la
 * seduta. Fallback silenzioso se l'API non è supportata (es. iOS Safari datato)
 * o se la richiesta viene rifiutata (tab non visibile, permessi negati, ecc.).
 */
type WakeLockSentinelLike = { release: () => Promise<void> };

let sentinel: WakeLockSentinelLike | null = null;

export async function requestWakeLock(): Promise<void> {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } };
    if (!nav.wakeLock) return;
    sentinel = await nav.wakeLock.request('screen');
  } catch {
    // fallback silenzioso: nessun blocco, l'app resta comunque utilizzabile
    sentinel = null;
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await sentinel?.release();
  } catch {
    // ignorato
  } finally {
    sentinel = null;
  }
}
