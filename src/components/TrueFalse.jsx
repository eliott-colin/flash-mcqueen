import { useEffect, useState } from "react";

function TrueFalse({
  question,
  onSubmit,
  initialAnswer,
  disabled = false,
  revealCorrection = false
}) {
  const [selected, setSelected] = useState(
    typeof initialAnswer === "number" ? initialAnswer : null
  );

  useEffect(() => {
    setSelected(typeof initialAnswer === "number" ? initialAnswer : null);
  }, [initialAnswer, question.id]);

  const answers = question.answers || [];
  const isValidSelection = typeof selected === "number";

  return (
    <section className="mt-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {answers.map((answer, index) => {
          const isSelected = selected === index;
          const isCorrect = Boolean(answer.correct);
          const shouldShowCorrect = revealCorrection && isCorrect;
          const shouldShowWrong = revealCorrection && isSelected && !isCorrect;

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              onClick={() => {
                if (!disabled) {
                  setSelected(index);
                }
              }}
              className={`rounded-xl border px-4 py-3 text-center font-semibold transition ${
                shouldShowCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : shouldShowWrong
                  ? "border-rose-400 bg-rose-50 text-rose-900"
                  : isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              {answer.text}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSubmit(selected)}
        disabled={!isValidSelection || disabled}
        className="mt-3 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-200"
      >
        Valider
      </button>
    </section>
  );
}

export default TrueFalse;
