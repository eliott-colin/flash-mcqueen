import { useEffect, useMemo, useState } from "react";
import QuestionRenderer from "./QuestionRenderer";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function evaluateAnswer(question, userAnswer) {
  if (question.type === "multiple_choice" || question.type === "true_false") {
    if (typeof userAnswer !== "number") {
      return false;
    }

    return Boolean(question.answers?.[userAnswer]?.correct);
  }

  if (question.type === "input") {
    return normalizeText(userAnswer) === normalizeText(question.correctAnswer);
  }

  return false;
}

function getReadableAnswer(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined || userAnswer === "") {
    return "Sans reponse";
  }

  if (question.type === "multiple_choice" || question.type === "true_false") {
    return question.answers?.[userAnswer]?.text || "Reponse inconnue";
  }

  return String(userAnswer);
}

function getExpectedAnswer(question) {
  if (question.type === "multiple_choice" || question.type === "true_false") {
    return question.answers?.find((answer) => answer.correct)?.text || "N/A";
  }

  if (question.type === "input") {
    return question.correctAnswer || "N/A";
  }

  return "N/A";
}

function hasAnswer(question, userAnswer) {
  if (question.type === "input") {
    return normalizeText(userAnswer).length > 0;
  }

  return typeof userAnswer === "number";
}

function resolveImageSrc(image) {
  if (!image) {
    return null;
  }

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
    return image;
  }

  return `/images/${image}`;
}

function QuizEngine({ quizKey: requestedQuizKey, onBackToMenu }) {
  const [quizKey, setQuizKey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [validated, setValidated] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [examMode, setExamMode] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const quizToLoad = String(requestedQuizKey || "overwatch").trim();

    async function loadQuiz() {
      setIsLoading(true);
      setLoadError("");

      try {
        if (!quizToLoad) {
          throw new Error("Aucun quiz n'a été sélectionné");
        }

        const quizResponse = await fetch(`/data/${quizToLoad}/data.json`);

        if (!quizResponse.ok) {
          throw new Error(
            `Impossible de lire /data/${quizToLoad}/data.json (${quizResponse.status})`
          );
        }

        const quizData = await quizResponse.json();
        const loadedQuestions = Array.isArray(quizData?.questions) ? quizData.questions : [];

        if (!isCancelled) {
          setQuizKey(quizToLoad);
          setQuestions(loadedQuestions);
          setCurrentIndex(0);
          setUserAnswers({});
          setValidated({});
          setShowResults(false);
          setExamMode(false);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Erreur de chargement du quiz");
          setQuestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      isCancelled = true;
    };
  }, [requestedQuizKey]);

  const totalQuestions = questions.length;

  const currentQuestion = questions[currentIndex];

  const score = useMemo(() => {
    return questions.reduce((count, question) => {
      const userAnswer = userAnswers[question.id];
      return evaluateAnswer(question, userAnswer) ? count + 1 : count;
    }, 0);
  }, [questions, userAnswers]);

  const answeredCount = useMemo(() => {
    return questions.reduce((count, question) => {
      return hasAnswer(question, userAnswers[question.id]) ? count + 1 : count;
    }, 0);
  }, [questions, userAnswers]);

  const isOverwatch = quizKey === "overwatch";
  const shellClassName = isOverwatch
    ? "rounded-[2rem] border border-white/60 bg-slate-950/90 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:p-8"
    : "rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8";
  const titleTextClassName = isOverwatch ? "text-white" : "text-slate-900";
  const mutedTextClassName = isOverwatch ? "text-slate-300" : "text-slate-600";
  const panelClassName = isOverwatch
    ? "rounded-2xl border border-white/10 bg-white/5"
    : "rounded-2xl border border-slate-200 bg-slate-50/70";

  if (isLoading) {
    return (
      <article className={shellClassName}>
        <h2 className={`font-display text-2xl ${titleTextClassName}`}>Chargement du quiz...</h2>
        <p className={`mt-2 ${mutedTextClassName}`}>Lecture du quiz sélectionné.</p>
      </article>
    );
  }

  if (loadError) {
    return (
      <article className={shellClassName}>
        <h2 className="font-display text-2xl text-orange-300">Impossible de charger le quiz</h2>
        <p className="mt-2 text-slate-200">{loadError}</p>
        <p className="mt-2 text-slate-300">
          Vérifie le fichier `public/data/{quizKey || "..."}/data.json`.
        </p>
        {onBackToMenu && (
          <button
            type="button"
            onClick={onBackToMenu}
            className="mt-5 rounded-xl bg-gradient-to-r from-orange-500 to-sky-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.02]"
          >
            Retour au menu
          </button>
        )}
      </article>
    );
  }

  if (!totalQuestions) {
    return (
      <article className={shellClassName}>
        <h2 className={`font-display text-2xl ${titleTextClassName}`}>Aucune question trouvee</h2>
        <p className={`mt-2 ${mutedTextClassName}`}>
          Ajoute des entrees dans `public/data/{quizKey || "<quiz>"}/data.json` pour lancer le quiz.
        </p>
        {onBackToMenu && (
          <button
            type="button"
            onClick={onBackToMenu}
            className="mt-5 rounded-xl bg-gradient-to-r from-orange-500 to-sky-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.02]"
          >
            Retour au menu
          </button>
        )}
      </article>
    );
  }

  if (showResults) {
    const rate = Math.round((score / totalQuestions) * 100);

    return (
      <article className={shellClassName}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.25em] ${mutedTextClassName}`}>Resultat final</p>
            <h2 className={`mt-2 font-display text-3xl sm:text-4xl ${titleTextClassName}`}>
              {score} / {totalQuestions}
            </h2>
            <p className={`mt-2 ${mutedTextClassName}`}>Taux de reussite: {rate}%</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setUserAnswers({});
              setValidated({});
              setShowResults(false);
            }}
            className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.02]"
          >
            Recommencer
          </button>

          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-inherit transition hover:bg-white/5"
            >
              Choisir un autre quiz
            </button>
          )}
        </div>

        <ul className="mt-8 space-y-4">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = evaluateAnswer(question, userAnswer);

            return (
              <li
                key={question.id}
                className={panelClassName + " p-4"}
              >
                <p className={`text-xs uppercase tracking-[0.2em] ${mutedTextClassName}`}>
                  Question {index + 1}
                </p>
                <h3 className={`mt-1 font-semibold ${titleTextClassName}`}>{question.question}</h3>
                <p className={`mt-3 text-sm ${mutedTextClassName}`}>
                  Ta reponse: {getReadableAnswer(question, userAnswer)}
                </p>
                <p className={`mt-1 text-sm ${mutedTextClassName}`}>
                  Bonne reponse: {getExpectedAnswer(question)}
                </p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    isCorrect ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </p>

                {question.explanation && (
                  <p className="mt-2 text-sm text-slate-600">{question.explanation}</p>
                )}
              </li>
            );
          })}
        </ul>
      </article>
    );
  }

  const currentAnswer = userAnswers[currentQuestion.id];
  const isCurrentAnswered = hasAnswer(currentQuestion, currentAnswer);
  const isCurrentValidated = Boolean(validated[currentQuestion.id]);
  const progressValue = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const currentImage = resolveImageSrc(currentQuestion.image);

  return (
    <article className={shellClassName}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`text-xs uppercase tracking-[0.25em] ${mutedTextClassName}`}>Progression</p>
          <h2 className={`mt-1 font-display text-2xl sm:text-3xl ${titleTextClassName}`}>
            Question {currentIndex + 1} / {totalQuestions}
          </h2>
          <p className={`mt-1 text-sm ${mutedTextClassName}`}>{answeredCount} reponses renseignees</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-inherit transition hover:bg-white/5"
            >
              Menu des quiz
            </button>
          )}

          <label className="inline-flex items-center gap-3 rounded-full border border-white/15 px-4 py-2 text-sm text-inherit">
            <input
              type="checkbox"
              checked={examMode}
              onChange={(event) => {
                const checked = event.target.checked;
                setExamMode(checked);
                if (checked) {
                  setValidated({});
                }
              }}
              className={isOverwatch ? "h-4 w-4 accent-orange-400" : "h-4 w-4 accent-slate-900"}
            />
            Mode examen
          </label>
        </div>
      </div>

      <div className={`mb-6 h-2 w-full overflow-hidden rounded-full ${isOverwatch ? "bg-white/10" : "bg-slate-200"}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverwatch ? "bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500" : "bg-gradient-to-r from-sky-500 to-amber-500"
          }`}
          style={{ width: `${progressValue}%` }}
        />
      </div>

      {currentImage && (
        <figure className="mb-6 overflow-hidden rounded-3xl border border-white/10">
          <img src={currentImage} alt="Illustration de question" className="h-60 w-full object-cover" />
        </figure>
      )}

      <h3 className={`font-display text-xl sm:text-2xl ${titleTextClassName}`}>
        {currentQuestion.question}
      </h3>

      <QuestionRenderer
        question={currentQuestion}
        initialAnswer={currentAnswer}
        onSubmit={(answer) => {
          setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer
          }));

          if (!examMode) {
            setValidated((prev) => ({
              ...prev,
              [currentQuestion.id]: true
            }));
          }
        }}
        disabled={!examMode && isCurrentValidated}
        revealCorrection={!examMode && isCurrentValidated}
      />

      {!examMode && isCurrentValidated && currentQuestion.explanation && (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${isOverwatch ? "border border-white/10 bg-white/5 text-slate-200" : "border border-slate-200 bg-slate-50 text-slate-700"}`}>
          {currentQuestion.explanation}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-inherit transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Precedent
        </button>

        {currentIndex < totalQuestions - 1 && (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
            disabled={!isCurrentAnswered}
            className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </button>
        )}

        {currentIndex === totalQuestions - 1 && (
          <button
            type="button"
            onClick={() => setShowResults(true)}
            disabled={!isCurrentAnswered}
            className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Terminer le quiz
          </button>
        )}
      </div>
    </article>
  );
}

export default QuizEngine;
