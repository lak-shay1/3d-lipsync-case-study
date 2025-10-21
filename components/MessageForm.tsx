'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cuesFromText } from '@/lib/wawa';
import { setLipsyncCues } from './LipsyncController';

export default function MessageForm({ sessionId }: { sessionId?: string }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [log, setLog] = useState<{ id: string; text: string }[]>([]);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text || !sessionId) return;
    setBusy(true);
    try {
      // keep session display name fresh (optional)
      if (name) await supabase.from('sessions').update({ display_name: name }).eq('id', sessionId);

      // save the message
      const { data, error } = await supabase
        .from('messages')
        .insert({ session_id: sessionId, text })
        .select('id, text')
        .single();
      if (error) throw error;

      // 1) get cues (Wawa or fallback), 2) play them
      const cues = await cuesFromText(text);
      setLipsyncCues(cues);

      setLog(l => [{ id: data.id, text: data.text }, ...l]);
      setText('');
    } catch (err) {
      console.error(err);
      alert('Could not save message — check console.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full rounded border px-3 py-2 h-24"
          placeholder="Type a message for the avatar…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!sessionId || busy}
        >
          {busy ? 'Saving…' : 'Speak'}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="font-medium">Messages</h3>
        <ul className="space-y-1 max-h-64 overflow-auto">
          {log.map((m) => (
            <li key={m.id} className="rounded border px-3 py-2 text-sm bg-white">
              <div className="text-neutral-500 text-[11px]">{m.id.slice(0, 8)}…</div>
              <div>{m.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
