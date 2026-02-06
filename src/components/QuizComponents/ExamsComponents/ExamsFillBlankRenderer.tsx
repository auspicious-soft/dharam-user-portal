import { ChevronDown } from "lucide-react";
import { FillBlankQuestion } from "../quiz.types";

interface FillBlankRendererProps {
  question: FillBlankQuestion;
  answers: Record<number, Record<number, string>>;
  setAnswers: (answers: Record<number, Record<number, string>>) => void;
  showResult: boolean;
  currentQuestionIndex: number;
} 

export const ExamsFillBlankRenderer = ({
  question,
  answers,
  setAnswers,
  showResult,
  currentQuestionIndex,
}: FillBlankRendererProps) => {
  const currentAnswers = answers[currentQuestionIndex] || {};

  const handleNumberSelect = (optionIndex: number, blankNumber: string) => {
    if (showResult) return;

    // Remove this option from any other blank it was assigned to
    const newAnswers: Record<number, string> = { ...currentAnswers };
    Object.keys(newAnswers).forEach((key) => {
      if (newAnswers[parseInt(key)] === blankNumber) {
        delete newAnswers[parseInt(key)];
      }
    });

    // Assign the blank number to this option (key is optionIndex, value is blankNumber)
    if (blankNumber !== "") {
      newAnswers[optionIndex] = blankNumber;
    }

    setAnswers({ ...answers, [currentQuestionIndex]: newAnswers });
  };

  const isCorrect = (optionIndex: number): boolean | null => {
    const selectedBlank = currentAnswers[optionIndex];
    if (!selectedBlank) return null;

    const blank = question.blanks.find((b) => b.id === selectedBlank);
    if (!blank) return false;

    return question.options[optionIndex] === blank.correctAnswer;
  };

  const renderTemplate = () => {
    const parts = question.questionTemplate.split(/(__\d+__)/g);

    return (
      <div className="justify-start text-paragraph text-sm md:text-base leading-6">
        {parts.map((part, idx) => {
          const match = part.match(/__(\d+)__/);
          if (match) {
            const blankId = match[1];

            const selectedOptionIndex = Object.keys(currentAnswers).find(
              (key) => currentAnswers[parseInt(key)] === blankId,
            );
            const selectedText =
              selectedOptionIndex !== undefined
                ? question.options[parseInt(selectedOptionIndex)]
                : "";



            return (
              <span key={idx} className="inline-flex items-baseline mx-1 ">
                <span
                  className={`inline-block min-w-[120px] text-center px-1 py-1 mb-3 border-b-1 transition-all text-paragraph text-[15px] leading-6 min-h-8 
                    ${!showResult ? "border-b-[1px] border-dashed border-paragraph " : ""}
                  `}
                >
                  {selectedText || ""}
                </span>
              </span>
            );
          }
          return (
            <span key={idx} className="whitespace-pre-wrap ">
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="">{renderTemplate()}</div>

      <div className="space-y-3">
        <h4 className="text-paragraph text-xs md:text-text-xs md:text-sm md:text-base font-semibold">Options:</h4>
        <div className="space-y-3">
          {question.options.map((option, optionIndex) => {
            const selectedBlank = currentAnswers[optionIndex] || "";

            return (
              <div key={optionIndex} className="flex items-center gap-4">
                {/* Option Text (Left Side) */}
                <div
                  className={`flex-1 px-4 py-3 rounded-lg border-[1px] text-paragraph text-xs md:text-text-xs md:text-sm font-medium transition-all
                    ${!selectedBlank ? "border-[#dce5ed] bg-white text-paragraph" : ""}
                    ${selectedBlank ? "!border-primary_blue bg-[#F0F8FF] text-primary_blue" : ""}

                  `}
                >
                  {option}
                </div>

                {/* Blank Number Selector (Right Side) */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                  <div className="relative flex-1">
                    <select
                      value={selectedBlank}
                      onChange={(e) =>
                        handleNumberSelect(optionIndex, e.target.value)
                      }
                      disabled={showResult}
                      className={`w-full px-4 py-3 pr-10 rounded-lg border-[1px] outline-none transition-all text-paragraph text-xs md:text-text-xs md:text-sm font-medium appearance-none cursor-pointer
                        ${ !selectedBlank ? "border-[#E0E0E0] text-gray-400" : ""}
                        ${selectedBlank ? "!border-primary_blue bg-[#F0F8FF] text-primary_blue" : ""}
                        ${showResult ? "cursor-not-allowed" : ""}
                      `}
                    >
                      <option value="">—</option>
                      {question.blanks.map((blank) => (
                        <option key={blank.id} value={blank.id}>
                          #{blank.id}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
