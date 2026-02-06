import { MCQQuestion } from "./quiz.types";

interface MCQRendererProps {
  question: MCQQuestion;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string | null) => void;
  showResult: boolean;
}

export const MCQRenderer = ({
  question,
  selectedAnswer,
  setSelectedAnswer,
  showResult,
}: MCQRendererProps) => {
  return (
    <div className="space-y-[10px]">
      {question.options.map((option) => {
        const isSelected = selectedAnswer === option.id;
        const isCorrect = option.id === question.correctAnswer;
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
              type="radio"
              name="answer"
              value={option.id}
              checked={isSelected}
              disabled={showResult}
              onChange={(e) => setSelectedAnswer(e.target.value)}
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