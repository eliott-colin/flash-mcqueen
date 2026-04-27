import { useMemo, useState } from "react";
import quizData from "../data/data.json";
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

function QuizEngine() {
  const questions = quizData.questions || [];
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [validated, setValidated] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [examMode, setExamMode] = useState(false);

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

  if (!totalQuestions) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <h2 className="font-display text-2xl text-slate-900">Aucune question trouvee</h2>
        <p className="mt-2 text-slate-600">
          Ajoute des entrees dans data/data.json pour lancer le quiz.
        </p>
      </article>
    );
  }

  if (showResults) {
    const rate = Math.round((score / totalQuestions) * 100);

    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Resultat final</p>
            <h2 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
              {score} / {totalQuestions}
            </h2>
            <p className="mt-2 text-slate-600">Taux de reussite: {rate}%</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setUserAnswers({});
              setValidated({});
              setShowResults(false);
            }}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Recommencer
          </button>
        </div>

        <ul className="mt-8 space-y-4">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = evaluateAnswer(question, userAnswer);

            return (
              <li
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Question {index + 1}
                </p>
                <h3 className="mt-1 font-semibold text-slate-900">{question.question}</h3>
                <p className="mt-3 text-sm text-slate-700">
                  Ta reponse: {getReadableAnswer(question, userAnswer)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
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
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Progression</p>
          <h2 className="mt-1 font-display text-2xl text-slate-900 sm:text-3xl">
            Question {currentIndex + 1} / {totalQuestions}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{answeredCount} reponses renseignees</p>
        </div>

        <label className="inline-flex items-center gap-3 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
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
            className="h-4 w-4 accent-slate-900"
          />
          Mode examen
        </label>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-amber-500 transition-all duration-500"
          style={{ width: `${progressValue}%` }}
        />
      </div>

      {currentImage && (
        <figure className="mb-6 overflow-hidden rounded-2xl border border-slate-200">
          <img src={currentImage} alt="Illustration de question" className="h-60 w-full object-cover" />
        </figure>
      )}

      <h3 className="font-display text-xl text-slate-900 sm:text-2xl">
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
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {currentQuestion.explanation}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Precedent
        </button>

        {currentIndex < totalQuestions - 1 && (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
            disabled={!isCurrentAnswered}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Suivant
          </button>
        )}

        {currentIndex === totalQuestions - 1 && (
          <button
            type="button"
            onClick={() => setShowResults(true)}
            disabled={!isCurrentAnswered}
            className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            Terminer le quiz
          </button>
        )}
      </div>
    </article>
  );
}

export default QuizEngine;
