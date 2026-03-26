export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <section className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          Next.js App
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Starter page ready
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This page has been reset to a simple starter screen for the web app.
        </p>
      </section>
    </main>
  );
}
