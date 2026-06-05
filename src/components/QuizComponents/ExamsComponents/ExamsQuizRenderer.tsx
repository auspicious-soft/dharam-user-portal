import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "../quiz.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Check, InfoCircle } from "iconoir-react";
import { ImageIcon } from "lucide-react";
import api from "@/lib/axios";

import { ExamsDragDropRenderer } from "./ExamsDragDropRenderer";
import { ExamsFillBlankRenderer } from "./ExamsFillBlankRenderer";
import { ExamsMCQRenderer } from "./ExamsMCQRenderer";
import { ReportProblemDialog } from "@/components/exams/ReportProblemDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getMaxSelection,
  isMCQSelectionCorrect,
} from "../mcqUtils";

interface QuizRendererProps {
  quiz: QuizQuestion[];
  onComplete?: (results: { correct: number; incorrect: number }) => void;
  onQuestionChange?: (index: number) => void;
  activeQuestionIndex?: number;
  examId?: string;
  courseId?: string;
  availableTime?: number;

  results: Record<number, boolean>;
  setResults: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;

  marked: Set<number>;
  setMarked: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export const ExamsQuizRenderer = ({
  quiz,
  onComplete,
  onQuestionChange,
  activeQuestionIndex,
  examId,
  courseId,
  availableTime,
  results,
  setResults,
  setMarked,
}: QuizRendererProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  const [showResult, setShowResult] = useState(false);

  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string[]>>(
    {},
  );

  const [dragDropAnswers, setDragDropAnswers] = useState<
    Record<number, Record<string, string>>
  >({});

  const [fillBlankAnswers, setFillBlankAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
  const [isImageOpen, setIsImageOpen] = useState(false);

  const question = quiz[currentQuestionIndex];
  const totalQuestions = quiz.length;
  const dragDropCurrentAnswers = dragDropAnswers[currentQuestionIndex] ?? {};
  const fillBlankCurrentAnswers = fillBlankAnswers[currentQuestionIndex] ?? {};
  const hasCurrentAnswer =
    question.type === "mcq"
      ? selectedAnswers.length > 0
      : question.type === "dragdrop"
        ? Object.keys(dragDropCurrentAnswers).length > 0
        : question.type === "fillblank"
          ? Object.values(fillBlankCurrentAnswers).some(Boolean)
          : false;

  const [reportProblemDialog, setReportProblemExitDialog] = useState(false);

  const submitQuestionResponse = (isCorrect: boolean | null) => {
    if (!examId || isCorrect === null) return;

    void api
      .post("/user/submit-question-response", {
        questionId: question.id,
        isCorrect,
        examId,
        availableTime: typeof availableTime === "number" ? availableTime : 0,
      })
      .catch((error) => {
        console.error("Failed to submit question response", error);
      });
  };

  const moveToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswers(mcqAnswers[index] ?? []);
    setShowResult(false);
    onQuestionChange?.(index);
  }, [mcqAnswers, onQuestionChange]);

  useEffect(() => {
    if (typeof activeQuestionIndex !== "number") return;
    if (activeQuestionIndex < 0 || activeQuestionIndex >= totalQuestions) return;
    if (activeQuestionIndex === currentQuestionIndex) return;

    moveToQuestion(activeQuestionIndex);
  }, [
    activeQuestionIndex,
    currentQuestionIndex,
    moveToQuestion,
    totalQuestions,
  ]);

  useEffect(() => {
    setIsImageOpen(false);
  }, [currentQuestionIndex]);

  // ---------------------------------------------------
  // NEXT
  // ---------------------------------------------------

  const handleNext = () => {
    if (currentQuestionIndex === totalQuestions - 1) return;
    if (!hasCurrentAnswer) return;

    let isCorrect: boolean | null = null;

    // ---------- MCQ ----------
    if (question.type === "mcq" && selectedAnswers.length > 0) {
      setMcqAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswers,
      }));

      isCorrect = isMCQSelectionCorrect(question, selectedAnswers);
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

            return blank.correctAnswers.includes(
              question.options[parseInt(assignedOptionIndex)],
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

      submitQuestionResponse(isCorrect);
    }

    // ---------- MOVE ----------
    moveToQuestion(currentQuestionIndex + 1);
  };

  // ---------------------------------------------------
  // BACK
  // ---------------------------------------------------

  const handleBack = () => {
    if (currentQuestionIndex === 0) return;

    const prevIndex = currentQuestionIndex - 1;

    moveToQuestion(prevIndex);
  };

  // ---------------------------------------------------
  // COMPLETE
  // ---------------------------------------------------

  const handleComplete = () => {
    let isCorrect: boolean | null = null;

    if (question.type === "mcq" && selectedAnswers.length > 0) {
      setMcqAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswers,
      }));

      isCorrect = isMCQSelectionCorrect(question, selectedAnswers);
    }

    if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[currentQuestionIndex];

      if (currentAnswers) {
        const correct = question.dropZones.every(
          (zone) => currentAnswers[zone.id] === zone.correctItemId,
        );

        isCorrect = correct;
      }
    }

    if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[currentQuestionIndex];

      if (currentAnswers) {
        const correct = question.blanks.every((blank) => {
          const assignedOptionIndex = Object.keys(currentAnswers).find(
            (key) => currentAnswers[parseInt(key)] === blank.id,
          );

          if (!assignedOptionIndex) return false;

          return blank.correctAnswers.includes(
            question.options[parseInt(assignedOptionIndex)],
          );
        });

        isCorrect = correct;
      }
    }

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

      submitQuestionResponse(isCorrect);
    }

    if (!onComplete) return;

    const currentCorrect = Object.values(results).filter((r) => r).length;
    const willCountCurrent =
      isCorrect !== null && results[currentQuestionIndex] === undefined;
    const correct = willCountCurrent && isCorrect ? currentCorrect + 1 : currentCorrect;
    const incorrect = totalQuestions - correct;

    onComplete({ correct, incorrect });
  };

  // ---------------------------------------------------
  // MARK & NEXT
  // ---------------------------------------------------

  const markCurrent = () => {
    if (currentQuestionIndex === totalQuestions - 1) return;

    setMarked((prev) => {
      const copy = new Set(prev);
      copy.add(currentQuestionIndex);
      return copy;
    });

    setResults((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestionIndex];
      return copy;
    });

    setMcqAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestionIndex];
      return copy;
    });

    setDragDropAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestionIndex];
      return copy;
    });

    setFillBlankAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestionIndex];
      return copy;
    });

    moveToQuestion(currentQuestionIndex + 1);
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
            Max Selections: {getMaxSelection(question)}
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
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
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
            disabled={
              currentQuestionIndex === totalQuestions - 1 || !hasCurrentAnswer
            }
             className="rounded-[10px] h-10 !py-1 !px-4"
          >
           
            Next
             <ArrowRight /> 
          </Button>

          {currentQuestionIndex === totalQuestions - 1 && (
            <Button onClick={handleComplete} 
             className="rounded-[10px] h-10 !py-1 !px-4"
             >
              Submit
            </Button>
          )}

        {currentQuestionIndex !== totalQuestions - 1 && (
          <Button
            variant="outline"
            onClick={markCurrent}
            className="rounded-[10px] h-10 !py-1 !px-4"
          >
            <Check />
            Mark & Next
          </Button>
        )}
      </div>
      {question.imageUrl ? (
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px] h-9 !py-1 !px-3"
            onClick={() => setIsImageOpen(true)}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            View Image
          </Button>
        </div>
      ) : null}
      <ReportProblemDialog 
       open={reportProblemDialog}
        onClose={() => setReportProblemExitDialog(false)}
        examId={examId}
        courseId={courseId}
      />
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Question Image</DialogTitle>
          </DialogHeader>
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt="Question"
              className="w-full max-h-[75vh] object-contain rounded-lg"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};
