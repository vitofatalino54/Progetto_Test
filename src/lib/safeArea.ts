/**
 * Classi Tailwind riutilizzabili per le safe area di iOS (notch/Dynamic Island
 * in alto, home indicator in basso), da applicare a header fissi, tab bar e
 * aree di contenuto scrollabili invece di ripetere `env(safe-area-inset-*)`
 * inline in ogni componente.
 *
 * Sono stringhe letterali (non costruite a runtime) perché il motore di
 * scansione di Tailwind individua le classi solo se compaiono letteralmente
 * nel codice sorgente: dichiararle qui e importarle basta a farle generare.
 *
 * I token base (--spacing-safe-top/bottom/left/right) sono definiti in
 * src/index.css via @theme; qui vengono combinati con calc() dove serve
 * sommarli al padding "visivo" che i componenti avrebbero comunque.
 */

/** Padding orizzontale standard (1rem) + safe area sinistra/destra. */
export const SAFE_X = 'pl-[calc(1rem+var(--spacing-safe-left))] pr-[calc(1rem+var(--spacing-safe-right))]';

/** Padding superiore per header sticky: 1rem + safe area dell'insetto superiore. */
export const SAFE_TOP = 'pt-[calc(1rem+var(--spacing-safe-top))]';

/** Padding inferiore per liste di contenuto lunghe, sopra tab bar + rest timer. */
export const SAFE_CONTENT_BOTTOM = 'pb-[calc(10rem+var(--spacing-safe-bottom))]';

/** Come sopra ma per schermate più corte (es. form di fine seduta). */
export const SAFE_CONTENT_BOTTOM_SM = 'pb-[calc(7rem+var(--spacing-safe-bottom))]';

/** Padding della tab bar in basso: solo la safe area, nessun margine extra. */
export const SAFE_NAV = 'pb-[var(--spacing-safe-bottom)] pl-[var(--spacing-safe-left)] pr-[var(--spacing-safe-right)]';

/** Offset verticale della barra del timer di recupero, sopra la tab bar. */
export const SAFE_TIMER_BOTTOM = 'bottom-[calc(4rem+var(--spacing-safe-bottom))]';
