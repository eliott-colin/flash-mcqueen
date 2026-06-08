import { useMemo, useState } from "react";
import QuizEngine from "./QuizEngine";

const QUIZZES = [
  {
    key: "overwatch",
    title: "Overwatch",
    description: "Quiz lore et personnages sur l'univers d'Overwatch.",
    accent: "from-orange-500 via-amber-400 to-sky-500",
    badge: "Univers Blizzard",
    ring: "ring-orange-400/40"
  },
  {
    key: "code-moto",
    title: "Code de la route moto",
    description: "Questions pour le passage du code moto",
    accent: "from-amber-500 to-orange-500",
    badge: "Permis & panneaux",
    ring: "ring-amber-400/40"
  }
];

function App() {
  const [selectedQuiz, setSelectedQuiz] = useState("overwatch");
  const [started, setStarted] = useState(false);
  const selectedQuizData = useMemo(
    () => QUIZZES.find((quiz) => quiz.key === selectedQuiz) || null,
    [selectedQuiz]
  );
  const isOverwatchQuiz = selectedQuiz === "overwatch";
  const isOverwatchScreen = started && selectedQuiz === "overwatch";
  const menuTitle = selectedQuizData
    ? selectedQuizData.title === "Overwatch"
      ? "Quiz Overwatch."
      : `Prêt pour le quiz ${selectedQuizData.title} ?`
    : "Sélectionne le type de quiz que tu souhaites faire !";
  const menuSubtitle = selectedQuizData
    ? selectedQuizData.title === "Overwatch"
      ? "Lance un quiz inspiré de l'univers Overwatch."
      : "Reviens au menu si tu veux changer de thème."
    : "Choisis un quiz, puis démarre quand tu es prêt.";

  const launchQuiz = () => setStarted(true);
  const goBackToMenu = () => setStarted(false);

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 lg:px-12 ${
        isOverwatchScreen ? "bg-overwatch text-white" : "bg-app"
      }`}
    >
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />

      <section className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-[2rem] border border-slate-200 bg-white/85 p-6 text-slate-900 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-sky-700">
              Quiz dynamique
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            {menuTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            {menuSubtitle}
          </p>
        </header>

        {!started ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Menu des quiz</p>
                <h2 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
                  Choisis ta mission
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                Quiz sélectionné : <span className="font-semibold text-slate-900">{selectedQuizData.title}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {QUIZZES.map((quiz) => {
                const isSelected = quiz.key === selectedQuiz;

                return (
                  <button
                    key={quiz.key}
                    type="button"
                    onClick={() => setSelectedQuiz(quiz.key)}
                    className={`group rounded-3xl border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      isSelected
                        ? `border-slate-900 bg-slate-50 text-slate-900 shadow-[0_16px_60px_rgba(15,23,42,0.12)] ring-4 ${quiz.ring}`
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`mb-4 h-2 w-24 rounded-full bg-gradient-to-r ${quiz.accent}`} />
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-2xl">{quiz.title}</h3>
                      <span className="rounded-full border border-current/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] opacity-80">
                        {quiz.badge}
                      </span>
                    </div>
                    <p className={`mt-3 text-sm ${isSelected ? "text-slate-600" : "text-slate-600"}`}>
                      {quiz.description}
                    </p>
                    <p className={`mt-5 text-sm font-semibold ${isSelected ? "text-orange-700" : "text-slate-900"}`}>
                      {isSelected ? "Sélectionné" : "Cliquer pour sélectionner"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Tu peux changer de quiz à tout moment depuis le menu.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuiz(null)}
                  disabled={!selectedQuiz}
                  className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Revenir au menu
                </button>

                <button
                  type="button"
                  onClick={launchQuiz}
                    disabled={!selectedQuizData}
                  className={`rounded-full px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl ${
                      !selectedQuizData
                        ? "cursor-not-allowed bg-slate-300 text-slate-500 hover:scale-100 hover:shadow-lg"
                        : isOverwatchQuiz
                      ? "bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500 text-slate-950"
                      : "bg-slate-900"
                  }`}
                >
                    {selectedQuizData ? `Commencer ${selectedQuizData.title}` : "Choisis un quiz"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <QuizEngine quizKey={selectedQuiz} onBackToMenu={goBackToMenu} />
        )}
      </section>
    </main>
  );
}

export default App;
