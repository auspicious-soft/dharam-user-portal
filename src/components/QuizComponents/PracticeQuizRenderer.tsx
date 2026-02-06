import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./quiz.types";
import { MCQRenderer } from "./MCQRenderer";
import { DragDropRenderer } from "./DragDropRenderer";
import { FillBlankRenderer } from "./FillBlankRenderer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, InfoCircle } from "iconoir-react";

interface QuizRendererProps {
  quiz: QuizQuestion[];
  onComplete?: (results: { correct: number; incorrect: number }) => void;
  onQuestionChange?: (index: number) => void;
}

export const PracticeQuizRenderer = ({
  quiz,
  onComplete,
  onQuestionChange,
}: QuizRendererProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [showResult, setShowResult] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string | null>>(
    {},
  );
  const [dragDropAnswers, setDragDropAnswers] = useState<
    Record<number, Record<string, string>>
  >({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
  const [results, setResults] = useState<Record<number, boolean>>({});

  const question = quiz[currentQuestionIndex];
  const totalQuestions = quiz.length;

  useEffect(() => {
    onQuestionChange?.(currentQuestionIndex);
  }, [currentQuestionIndex, onQuestionChange]);

  // -------------------------
  // HELPERS
  // -------------------------

  const isAnswered = () => {
    if (question.type === "mcq") {
      return selectedAnswer !== null;
    }

    if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[currentQuestionIndex] || {};
      return Object.keys(currentAnswers).length === question.dropZones.length;
    }

    if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[currentQuestionIndex] || {};
      const assignedBlanks = new Set(Object.values(currentAnswers));

      return question.blanks.every((blank) => assignedBlanks.has(blank.id));
    }

    return false;
  };

  const checkAnswer = () => {
    if (question.type === "mcq") {
      return selectedAnswer === question.correctAnswer;
    }

    if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[currentQuestionIndex] || {};

      return question.dropZones.every(
        (zone) => currentAnswers[zone.id] === zone.correctItemId,
      );
    }

    if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[currentQuestionIndex] || {};

      return question.blanks.every((blank) => {
        const assignedOptionIndex = Object.keys(currentAnswers).find(
          (key) => currentAnswers[parseInt(key)] === blank.id,
        );

        if (assignedOptionIndex === undefined) return false;

        return (
          question.options[parseInt(assignedOptionIndex)] ===
          blank.correctAnswer
        );
      });
    }

    return false;
  };

  // -------------------------
  // ACTIONS
  // -------------------------

  const handleSubmit = () => {
    if (question.type === "mcq") {
      setMcqAnswers({
        ...mcqAnswers,
        [currentQuestionIndex]: selectedAnswer,
      });
    }

    const isCorrect = checkAnswer();

    setResults({
      ...results,
      [currentQuestionIndex]: isCorrect,
    });

    setShowResult(true);
    setShowSolution(true);
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;

    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer(mcqAnswers[nextIndex] ?? null);

    setShowResult(false);
    setShowSolution(false);
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) return;

    const prevIndex = currentQuestionIndex - 1;

    setCurrentQuestionIndex(prevIndex);
    setSelectedAnswer(mcqAnswers[prevIndex] ?? null);

    setShowResult(false);
    setShowSolution(false);
  };

  const handleSkip = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setShowResult(false);
      setShowSolution(false);
    }
  };

  const handleShowAnswer = () => {
    setShowSolution(true);
  };

  const handleComplete = () => {
    if (!onComplete) return;

    const correct = Object.values(results).filter((r) => r === true).length;

    const incorrect = totalQuestions - correct;

    onComplete({ correct, incorrect });
  };
  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case "mcq":
        return "Multiple Choice";
      case "dragdrop":
        return "Drag & Drop";
      case "fillblank":
        return "Fill in the Blanks";
      default:
        return "";
    }
  };

  return (
    <div className="flex overflow-hidden flex-col gap-2.5">
      <div className="flex flex-col lg:flex-row gap-5 justify-between items-start mb-1.5">
        <p className="justify-start text-paragraph text-base leading-6 flex-1">
          {question.question}
        </p>
          <div className="flex flex-col justify-end items-end gap-2 w-full lg:w-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="px-4 py-1.5 bg-Black_light text-white rounded-full text-xs flex items-center gap-2">
              <InfoCircle /> Show Instructions
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Question instructions</p>
          </TooltipContent>
        </Tooltip>
        </div>
      </div>

      {question.type === "mcq" && (
        <div className="mb-4">
          <span className="px-[18px] bg-white rounded-[99px] outline outline-1 outline-offset-[-1px] outline-paragraph inline-flex justify-start items-center gap-2.5 text-paragraph text-xs font-medium leading-[30px]">
            Max Selections: 1
          </span>
        </div>
      )}
      {(question.type === "dragdrop" || question.type === "fillblank") && (
        <div className="mb-4">
          <span className="px-[18px] bg-white rounded-[99px] outline outline-1 outline-offset-[-1px] outline-paragraph inline-flex justify-start items-center gap-2.5 text-paragraph text-xs font-medium leading-[30px]">
            {getQuestionTypeLabel()}
          </span>
        </div>
      )}

      <div className="mt-4">
        {question.type === "mcq" && (
          <MCQRenderer
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            showResult={showResult}
          />
        )}

        {question.type === "dragdrop" && (
          <DragDropRenderer
            question={question}
            answers={dragDropAnswers}
            setAnswers={setDragDropAnswers}
            showResult={showResult}
            currentQuestionIndex={currentQuestionIndex}
          />
        )}

        {question.type === "fillblank" && (
          <FillBlankRenderer
            question={question}
            answers={fillBlankAnswers}
            setAnswers={setFillBlankAnswers}
            showResult={showResult}
            currentQuestionIndex={currentQuestionIndex}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
       <div className="flex justify-between flex-wrap gap-4 items-center">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="rounded-[10px] h-10 !py-1 !px-4"
        >
         <ArrowLeft /> Back
        </Button>

        {/* CENTER */}
        {!showSolution && (
          <Button 
           onClick={handleShowAnswer}
           className="rounded-[10px] h-10 !py-1 !px-4"
           >
            Show Answer
          </Button>
        )}
        </div>

        {/* RIGHT */}
         <div className="flex justify-between flex-wrap gap-4 items-center">
          <Button variant="outline" 
           onClick={handleSkip}
           className="rounded-[10px] h-10 !py-1 !px-4">
            Skip
          </Button>

          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={!isAnswered()}
              className="rounded-[10px] h-10 !py-1 !px-4"
            >
              Submit
            </Button>
          ) : currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext}
            className="rounded-[10px] h-10 !py-1 !px-4"
            >
              <ArrowRight />
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} variant="link">
              Complete Task
            </Button>
          )}
        </div>
      </div>

      {showSolution && question.qExplanation && (
        <div className="self-stretch p-4 bg-white rounded-lg inline-flex flex-col border border-light-blue justify-start items-start gap-2.5 mt-5">
          <div className="justify-start text-Desc-464646 text-base font-semibold leading-5 mb-2">
            Solution
          </div>
          {question.type === "mcq" && (
            <div className="px-4 py-2 bg-[#6aa56d] rounded-lg inline-flex justify-center items-center gap-2.5">
              <div className="justify-start text-white text-sm font-medium leading-6">
                Option {question.correctAnswer.toUpperCase()} is correct answer
              </div>
            </div>
          )}

          {question.type === "dragdrop" && (
            <div className="">
              <div className="space-y-2">
                {question.dropZones.map((zone) => {
                  const correctItem = question.draggableItems.find(
                    (item) => item.id === zone.correctItemId,
                  );
                  return (
                    <div
                      key={zone.id}
                      className="flex items-center gap-4 text-sm"
                    >
                      <div className="w-64 px-3 py-2 bg-[#D2FFC9] border border-[#D2FFC9] rounded-lg text-sm font-medium text-gray-800">
                        {correctItem?.text}
                      </div>
                      <span className="text-gray-600">→</span>
                      <div className="flex-1 text-gray-700">
                        {zone.displayText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {question.type === "fillblank" && (
            <div className="w-full">
              {(() => {
                const parts = question.questionTemplate.split(/(__\d+__)/g);
                return (
                  <div className="text-paragraph text-base leading-6">
                    {parts.map((part, idx) => {
                      const match = part.match(/__(\d+)__/);
                      if (match) {
                        const blankId = match[1];
                        const blank = question.blanks.find(
                          (b) => b.id === blankId,
                        );
                        const correctAnswer = blank?.correctAnswer || "";
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-baseline mx-1"
                          >
                            <span className="inline-block px-2 py-1 bg-[#D2FFC9] text-Black_light mb-3 min-h-8 text-sm">
                              {correctAnswer}
                            </span>
                          </span>
                        );
                      }
                      return (
                        <span key={idx} className="whitespace-pre-wrap">
                          {part}
                        </span>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
          <p className="justify-start text-paragraph text-sm font-medium">
            Explanation: {question.qExplanation}
          </p>
        </div>
      )}
    </div>
  );
};
