export function getOrCreateSessionId() {
  if (typeof window === 'undefined') return undefined;
  const KEY = 'r3f_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
    localStorage.setItem(KEY, id);
  }
  return id;
}
