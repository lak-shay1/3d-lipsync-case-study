import { supabase } from './supabaseClient';

export async function getOrCreateSessionId(name?: string) {
  if (typeof window === 'undefined') return undefined;
  const KEY = 'r3f_session_id';
  let id = localStorage.getItem(KEY);

  if (!id) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ display_name: name ?? null, user_agent: navigator.userAgent })
      .select('id')
      .single();
    if (error) throw error;
    id = data.id as string;
    localStorage.setItem(KEY, id);
  } else if (name) {
    await supabase.from('sessions').update({ display_name: name }).eq('id', id);
  }
  return id;
}
