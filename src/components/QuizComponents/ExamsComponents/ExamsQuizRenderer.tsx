import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "../quiz.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Check, InfoCircle } from "iconoir-react";

import { ExamsDragDropRenderer } from "./ExamsDragDropRenderer";
import { ExamsFillBlankRenderer } from "./ExamsFillBlankRenderer";
import { ExamsMCQRenderer } from "./ExamsMCQRenderer";
import { ReportProblemDialog } from "@/components/exams/ReportProblemDialog";

interface QuizRendererProps {
  quiz: QuizQuestion[];
  onComplete?: (results: { correct: number; incorrect: number }) => void;
  onQuestionChange?: (index: number) => void;

  results: Record<number, boolean>;
  setResults: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;

  marked: Set<number>;
  setMarked: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export const ExamsQuizRenderer = ({
  quiz,
  onComplete,
  onQuestionChange,
  results,
  setResults,
  setMarked,
}: QuizRendererProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [showResult, setShowResult] = useState(false);

  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string | null>>(
    {},
  );

  const [dragDropAnswers, setDragDropAnswers] = useState<
    Record<number, Record<string, string>>
  >({});

  const [fillBlankAnswers, setFillBlankAnswers] = useState<
    Record<number, Record<number, string>>
  >({});

  const question = quiz[currentQuestionIndex];
  const totalQuestions = quiz.length;

  useEffect(() => {
    onQuestionChange?.(currentQuestionIndex);
  }, [currentQuestionIndex, onQuestionChange]);

    const [reportProblemDialog, setReportProblemExitDialog] = useState(false);
  // ---------------------------------------------------
  // NEXT
  // ---------------------------------------------------

  const handleNext = () => {
    if (currentQuestionIndex === totalQuestions - 1) return;

    let isCorrect: boolean | null = null;

    // ---------- MCQ ----------
    if (question.type === "mcq" && selectedAnswer !== null) {
      setMcqAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));

      isCorrect = selectedAnswer === question.correctAnswer;
    }

    // ---------- DRAG DROP ----------
    if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[currentQuestionIndex];

      if (currentAnswers) {
        const correct = question.dropZones.every(
          (zone) => currentAnswers[zone.id] === zone.correctItemId,
        );

        isCorrect = correct;
      }
    }

    // ---------- FILL BLANK ----------
    if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[currentQuestionIndex];

      if (currentAnswers) {
        const correct = question.blanks.every((blank) => {
          const assignedOptionIndex = Object.keys(currentAnswers).find(
            (key) => currentAnswers[parseInt(key)] === blank.id,
          );

          if (!assignedOptionIndex) return false;

          return (
            question.options[parseInt(assignedOptionIndex)] ===
            blank.correctAnswer
          );
        });

        isCorrect = correct;
      }
    }

    // ---------- SAVE RESULT + CLEAR MARK ----------
    if (isCorrect !== null) {
      setResults((prev) => ({
        ...prev,
        [currentQuestionIndex]: isCorrect,
      }));

      setMarked((prev) => {
        const copy = new Set(prev);
        copy.delete(currentQuestionIndex);
        return copy;
      });
    }

    // ---------- MOVE ----------
    const nextIndex = currentQuestionIndex + 1;

    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer(mcqAnswers[nextIndex] ?? null);
    setShowResult(false);
  };

  // ---------------------------------------------------
  // BACK
  // ---------------------------------------------------

  const handleBack = () => {
    if (currentQuestionIndex === 0) return;

    const prevIndex = currentQuestionIndex - 1;

    setCurrentQuestionIndex(prevIndex);
    setSelectedAnswer(mcqAnswers[prevIndex] ?? null);

    setShowResult(false);
  };

  // ---------------------------------------------------
  // COMPLETE
  // ---------------------------------------------------

  const handleComplete = () => {
    if (!onComplete) return;

    const correct = Object.values(results).filter((r) => r).length;

    const incorrect = totalQuestions - correct;

    onComplete({ correct, incorrect });
  };

  // ---------------------------------------------------
  // MARK & NEXT
  // ---------------------------------------------------

  const markCurrent = () => {
    setMarked((prev) => {
      const copy = new Set(prev);
      copy.add(currentQuestionIndex);
      return copy;
    });

    handleNext();
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
      {/* HEADER */}
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
         <Button
          onClick={() => setReportProblemExitDialog(true)}
          variant="link"
          className="text-primary_blue !text-[12px]"
         >
          Report Problem
         </Button>
      </div>
      </div>

      {/* TAG */}
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

      {/* RENDERER */}
      <div className="mt-4">
        {question.type === "mcq" && (
          <ExamsMCQRenderer
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            showResult={showResult}
          />
        )}

        {question.type === "dragdrop" && (
          <ExamsDragDropRenderer
            question={question}
            answers={dragDropAnswers}
            setAnswers={setDragDropAnswers}
            showResult={showResult}
            currentQuestionIndex={currentQuestionIndex}
          />
        )}

        {question.type === "fillblank" && (
          <ExamsFillBlankRenderer
            question={question}
            answers={fillBlankAnswers}
            setAnswers={setFillBlankAnswers}
            showResult={showResult}
            currentQuestionIndex={currentQuestionIndex}
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="flex gap-4 items-center mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
           className="rounded-[10px] h-10 !py-1 !px-4"
        >
          <ArrowLeft /> Previous
        </Button>

          <Button
            onClick={handleNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
             className="rounded-[10px] h-10 !py-1 !px-4"
          >
           
            Next
             <ArrowRight /> 
          </Button>

          {currentQuestionIndex === totalQuestions - 1 && (
            <Button onClick={handleComplete} 
             className="rounded-[10px] h-10 !py-1 !px-4"
             >
              Complete Task
            </Button>
          )}

        <Button variant="outline" onClick={markCurrent}
          className="rounded-[10px] h-10 !py-1 !px-4"
          >
            <Check />
          Mark & Next
        </Button>
      </div>
      <ReportProblemDialog 
       open={reportProblemDialog}
        onClose={() => setReportProblemExitDialog(false)}
      />
    </div>
  );
};
