import { MCQQuestion } from "./quiz.types";
import { getCorrectAnswerIds, getMaxSelection } from "./mcqUtils";

interface MCQRendererProps {
  question: MCQQuestion;
  selectedAnswers: string[];
  setSelectedAnswers: (answers: string[]) => void;
  showResult: boolean;
}

export const MCQRenderer = ({
  question,
  selectedAnswers,
  setSelectedAnswers,
  showResult,
}: MCQRendererProps) => {
  const maxSelection = getMaxSelection(question);
  const isMultiSelect = maxSelection > 1;
  const correctAnswerIds = getCorrectAnswerIds(question);

  const handleSelectOption = (optionId: string) => {
    if (showResult) return;

    setSelectedAnswers((prev) => {
      if (!isMultiSelect) {
        return [optionId];
      }

      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }

      if (prev.length >= maxSelection) {
        return prev;
      }

      return [...prev, optionId];
    });
  };

  return (
    <div className="space-y-[10px]">
      {question.options.map((option) => {
        const isSelected = selectedAnswers.includes(option.id);
        const isCorrect = correctAnswerIds.includes(option.id);
        const selectionLimitReached =
          isMultiSelect && !isSelected && selectedAnswers.length >= maxSelection;
        const isWrongSelection = showResult && isSelected && !isCorrect;
        const isCorrectAfterSubmit = showResult && isCorrect;

        return (
          <label
            key={option.id}
            className={`flex items-start gap-2 lg:gap-5 px-4 py-3 rounded-[10px] cursor-pointer transition-all text-paragraph text-xs md:text-sm font-medium border-[1px]
              ${!showResult && isSelected ? "!border-primary_blue bg-[#F0F8FF] !text-primary_blue" : "bg-[#F0F8FF] border-white"}
              ${isWrongSelection ? "!bg-[#FFE6E6] !border-[#FFE6E6]" : ""}
              ${isCorrectAfterSubmit ? "!bg-[#D2FFC9] !border-[#D2FFC9] !text-Black_light" : ""}
            `}
          >
            <input
              type={isMultiSelect ? "checkbox" : "radio"}
              name={`answer-${question.id}`}
              value={option.id}
              checked={isSelected}
              disabled={showResult || selectionLimitReached}
              onChange={() => handleSelectOption(option.id)}
              className="mt-[2px] md:mt-[5px] accent-current"
            />
            <div className="flex-1 flex justify-between items-start gap-2 flex-col lg:flex-row lg:items-center">
              <div>
                <span className="mr-2">{option.id.toUpperCase()}.</span>
                <span>{option.text}</span>
              </div>

              {showResult && isCorrect && (
                <span className="text-Black_light italic text-xs font-semibold">
                  Correct Answer
                </span>
              )}
              {isWrongSelection && (
                <span className="text-Black_light italic text-xs font-semibold">
                  Your Selection
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};
