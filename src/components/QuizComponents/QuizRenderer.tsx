import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./quiz.types";
import { MCQRenderer } from "./MCQRenderer";
import { DragDropRenderer } from "./DragDropRenderer";
import { FillBlankRenderer } from "./FillBlankRenderer";

interface QuizRendererProps {
  quiz: QuizQuestion[];
  onComplete?: (results: { correct: number; incorrect: number }) => void;
}

export const QuizRenderer = ({ quiz, onComplete }: QuizRendererProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  // Separate state for different answer types
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string | null>>({});
  const [dragDropAnswers, setDragDropAnswers] = useState<Record<number, Record<string, string>>>({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<number, Record<number, string>>>({});
  const [results, setResults] = useState<Record<number, boolean>>({}); // Track correct/incorrect

  const question = quiz[currentQuestionIndex];
  const totalQuestions = quiz.length;

  const isAnswered = () => {
    if (question.type === "mcq") {
      return selectedAnswer !== null;
    } else if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[currentQuestionIndex] || {};
      return Object.keys(currentAnswers).length === question.dropZones.length;
    } else if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[currentQuestionIndex] || {};
      const assignedBlanks = new Set(Object.values(currentAnswers));
      return question.blanks.every((blank) => assignedBlanks.has(blank.id));
    }
    return false;
  };

  const checkAnswer = () => {
    let isCorrect = false;

    if (question.type === "mcq") {
      isCorrect = selectedAnswer === question.correctAnswer;
    } else if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[currentQuestionIndex] || {};
      isCorrect = question.dropZones.every(
        (zone) => currentAnswers[zone.id] === zone.correctItemId
      );
    } else if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[currentQuestionIndex] || {};
      isCorrect = question.blanks.every((blank) => {
        const assignedOptionIndex = Object.keys(currentAnswers).find(
          (key) => currentAnswers[parseInt(key)] === blank.id
        );
        if (assignedOptionIndex === undefined) return false;
        return question.options[parseInt(assignedOptionIndex)] === blank.correctAnswer;
      });
    }

    return isCorrect;
  };

  const handleSubmit = () => {
    if (question.type === "mcq") {
      setMcqAnswers({ ...mcqAnswers, [currentQuestionIndex]: selectedAnswer });
    }
    
    // Check if answer is correct and store result
    const isCorrect = checkAnswer();
    setResults({ ...results, [currentQuestionIndex]: isCorrect });
    
    setShowResult(true);
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    const nextQuestion = quiz[currentQuestionIndex + 1];
    if (nextQuestion && nextQuestion.type === "mcq") {
      setSelectedAnswer(mcqAnswers[currentQuestionIndex + 1] ?? null);
    }
    setShowResult(false);
  };

  const handleComplete = () => {
    if (onComplete) {
      // Calculate correct and incorrect answers
      const correct = Object.values(results).filter((r) => r === true).length;
      const incorrect = totalQuestions - correct;
      onComplete({ correct, incorrect });
    }
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
      <div className="flex justify-end gap-4">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!isAnswered()}
            variant="link"
            className="text-primary_heading"
          >
            Submit
          </Button>
        ) : currentQuestionIndex < totalQuestions - 1 ? (
          <Button
            onClick={handleNext}
            variant="link"
            className="text-primary_heading"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            variant="link"
            className="text-primary_heading"
          >
            Complete Task
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-paragraph text-base font-semibold">
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </h2>
      </div>

      <p className="justify-start text-paragraph text-base leading-6">
        {question.question}
      </p>

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

      {showResult && question.qExplanation && (
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