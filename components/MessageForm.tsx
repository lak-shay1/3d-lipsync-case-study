'use client';

import { useEffect, useState } from 'react';

export default function MessageForm({
  sessionId,
}: { sessionId?: string }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [log, setLog] = useState<{ id: string; text: string }[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text || !sessionId) return;
    // (supabase will save later; for now just show it in UI)
    const id = crypto.randomUUID();
    setLog(l => [{ id, text }, ...l]);
    setText('');
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
        <button className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!sessionId}>
          Speak
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
