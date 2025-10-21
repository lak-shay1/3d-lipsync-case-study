"use client";
import { useEffect, useState } from 'react';
import Scene from '@/components/Scene';
import MessageForm from '@/components/MessageForm';
import { getOrCreateSessionId } from '@/lib/session';

export default function ExperiencePage() {
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  return (
    <main className="h-dvh grid grid-cols-1 md:grid-cols-[1fr_360px]">
      <section className="relative">
        <Scene />
      </section>
      <aside className="border-l p-4 space-y-3">
        <h2 className="text-xl font-semibold">Your session</h2>
        <div className="text-xs text-neutral-500 break-all">ID: {sessionId ?? '…'}</div>
        <MessageForm sessionId={sessionId} />
      </aside>
    </main>
  );
}