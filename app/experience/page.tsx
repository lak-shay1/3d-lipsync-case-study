import Scene from '@/components/Scene';

export default function ExperiencePage() {
  return (
    <main className="h-dvh grid grid-cols-1 md:grid-cols-[1fr_360px]">
      <section className="relative">
        <Scene />
      </section>
      <aside className="border-l p-4 space-y-2">
        <h2 className="text-xl font-semibold">Your session</h2>
        <p className="text-sm text-neutral-600">
          Form + lipsync controls will appear here next.
        </p>
      </aside>
    </main>
  );
}