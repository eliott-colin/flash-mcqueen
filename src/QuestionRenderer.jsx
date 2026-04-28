import InputQuestion from "./components/InputQuestion.jsx";
import MultipleChoice from "./components/MultipleChoice.jsx";
import TrueFalse from "./components/TrueFalse.jsx";

const componentByType = {
  multiple_choice: MultipleChoice,
  true_false: TrueFalse,
  input: InputQuestion
};

function QuestionRenderer(props) {
  const { question } = props;
  const Component = componentByType[question.type];

  if (!Component) {
    return (
      <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Type de question non supporte: {question.type}
      </p>
    );
  }

  return <Component {...props} />;
}

export default QuestionRenderer;
