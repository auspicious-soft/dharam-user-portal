import { MCQQuestion } from "../quiz.types";

interface MCQRendererProps {
  question: MCQQuestion;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string | null) => void;
  showResult: boolean;
}

export const ExamsMCQRenderer = ({
  question,
  selectedAnswer,
  setSelectedAnswer,
  showResult,
}: MCQRendererProps) => {
  return (
    <div className="space-y-[10px]">
      {question.options.map((option) => {
        const isSelected = selectedAnswer === option.id;

        return (
          <label
            key={option.id}
            className={`flex items-start gap-2 lg:gap-5 px-4 py-3 rounded-[10px] cursor-pointer transition-all text-paragraph text-xs md:text-sm font-medium border-[1px]
              ${isSelected ? "!border-primary_blue bg-[#F0F8FF] !text-primary_blue" : "bg-[#F0F8FF] border-white"}
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
            </div>
          </label>
        );
      })}
    </div>
  );
};