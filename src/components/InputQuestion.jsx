import { useEffect, useState } from "react";

function InputQuestion({
  question,
  onSubmit,
  initialAnswer,
  disabled = false,
  revealCorrection = false
}) {
  const [value, setValue] = useState(initialAnswer || "");

  useEffect(() => {
    setValue(initialAnswer || "");
  }, [initialAnswer, question.id]);

  const normalized = String(value).trim();

  return (
    <section className="mt-5 space-y-3">
      <label className="block text-sm font-medium text-slate-700" htmlFor={`input-${question.id}`}>
        Saisis ta reponse
      </label>

      <input
        id={`input-${question.id}`}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-slate-900/20 transition focus:ring"
        placeholder="Ecris ta reponse ici"
      />

      <button
        type="button"
        onClick={() => onSubmit(value)}
        disabled={normalized.length === 0 || disabled}
        className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-200"
      >
        Valider
      </button>

      {revealCorrection && (
        <p className="text-sm text-slate-600">
          Reponse attendue: <strong>{question.correctAnswer}</strong>
        </p>
      )}
    </section>
  );
}

export default InputQuestion;
