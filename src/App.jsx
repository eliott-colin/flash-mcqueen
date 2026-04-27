import QuizEngine from "./QuizEngine";

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app px-4 py-10 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />

      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="font-display text-xs uppercase tracking-[0.32em] text-slate-500">
            Quiz Engine Dynamique
          </p>
          <h1 className="mt-3 font-display text-3xl text-slate-900 sm:text-5xl">
            Moteur de quiz type code de la route
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            Toute la logique se base sur data.json. Ajoute des questions ou des
            nouveaux types sans modifier les composants existants.
          </p>
        </header>

        <QuizEngine />
      </section>
    </main>
  );
}

export default App;
