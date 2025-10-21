export default function Page() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-semibold">3D Avatar Lipsync</h1>
        <p className="text-neutral-600">
          Talk to an interactive 3D avatar. Built with Next.js, React Three Fiber & Wawa Lipsync.
        </p>
        <a
          href="/experience"
          className="inline-block rounded-md border px-4 py-2 hover:bg-neutral-50"
        >
          Enter Experience
        </a>
      </div>
    </main>
  );
}
