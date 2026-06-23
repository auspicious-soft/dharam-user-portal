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

type ExamAnswerJson = {
  questionId: string;
  type: "MCQ" | "DND" | "FIB";
  selectedAnswer: string[] | Record<string, string>;
};

const normalizeAnswerText = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

const getAnswerJsonSelectedArray = (question: QuizQuestion) => {
  const selectedAnswer = question.answerJson?.selectedAnswer;

  if (Array.isArray(selectedAnswer)) {
    return selectedAnswer.map((answer) => String(answer ?? "")).filter(Boolean);
  }

  if (selectedAnswer && typeof selectedAnswer === "object") {
    return Object.entries(selectedAnswer)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, answer]) => String(answer ?? ""))
      .filter(Boolean);
  }

  return [];
};

const hydrateMcqAnswer = (question: QuizQuestion) => {
  if (question.type !== "mcq") return [];

  const selectedAnswers = getAnswerJsonSelectedArray(question).map(
    normalizeAnswerText,
  );

  return question.options
    .filter((option) => selectedAnswers.includes(normalizeAnswerText(option.text)))
    .map((option) => option.id);
};

const hydrateDragDropAnswer = (question: QuizQuestion) => {
  if (question.type !== "dragdrop") return {};

  const selectedAnswer = question.answerJson?.selectedAnswer;
  if (!selectedAnswer || Array.isArray(selectedAnswer)) return {};

  return question.dropZones.reduce<Record<string, string>>((answers, zone, index) => {
    const selectedValue = selectedAnswer[String(index)];
    const matchedItem = question.draggableItems.find(
      (item) =>
        normalizeAnswerText(item.text) === normalizeAnswerText(selectedValue) ||
        normalizeAnswerText(item.id) === normalizeAnswerText(selectedValue),
    );

    if (selectedValue) {
      answers[zone.id] = matchedItem?.id ?? selectedValue;
    }

    return answers;
  }, {});
};

const hydrateFillBlankAnswer = (question: QuizQuestion) => {
  if (question.type !== "fillblank") return {};

  return getAnswerJsonSelectedArray(question).reduce<Record<number, string>>(
    (answers, answer, index) => {
      const optionIndex = question.options.findIndex(
        (option) => normalizeAnswerText(option) === normalizeAnswerText(answer),
      );

      if (optionIndex >= 0) {
        answers[optionIndex] = String(index + 1);
      }

      return answers;
    },
    {},
  );
};

const buildAnswerJson = (
  question: QuizQuestion,
  selectedAnswers: string[],
  dragDropCurrentAnswers: Record<string, string>,
  fillBlankCurrentAnswers: Record<number, string>,
): ExamAnswerJson | null => {
  if (question.type === "mcq") {
    const selectedAnswer = selectedAnswers
      .map(
        (optionId) =>
          question.options.find((option) => option.id === optionId)?.text,
      )
      .filter((answer): answer is string => Boolean(answer));

    if (selectedAnswer.length === 0) return null;

    return {
      questionId: question.id,
      type: "MCQ",
      selectedAnswer,
    };
  }

  if (question.type === "dragdrop") {
    const selectedAnswer = question.dropZones.reduce<Record<string, string>>(
      (answers, zone, index) => {
        const droppedItemId = dragDropCurrentAnswers[zone.id];
        const droppedItem = question.draggableItems.find(
          (item) => item.id === droppedItemId,
        );

        if (droppedItem?.text) {
          answers[String(index)] = droppedItem.text;
        }

        return answers;
      },
      {},
    );

    if (Object.keys(selectedAnswer).length === 0) return null;

    return {
      questionId: question.id,
      type: "DND",
      selectedAnswer,
    };
  }

  if (question.type === "fillblank") {
    const selectedAnswer = question.blanks
      .map((blank) => {
        const assignedOptionIndex = Object.keys(fillBlankCurrentAnswers).find(
          (key) => fillBlankCurrentAnswers[parseInt(key)] === blank.id,
        );

        if (assignedOptionIndex === undefined) return "";

        return question.options[parseInt(assignedOptionIndex)] ?? "";
      })
      .filter(Boolean);

    if (selectedAnswer.length === 0) return null;

    return {
      questionId: question.id,
      type: "FIB",
      selectedAnswer,
    };
  }

  return null;
};

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
  const isCurrentQuestionLocked = Boolean(question?.isAttempted);
  const showResultState = showResult || isCurrentQuestionLocked;
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
  const isMarkAndNextDisabled =
    isCurrentQuestionLocked ||
    results[currentQuestionIndex] !== undefined;

  const [reportProblemDialog, setReportProblemExitDialog] = useState(false);

  useEffect(() => {
    const hydratedMcqAnswers: Record<number, string[]> = {};
    const hydratedDragDropAnswers: Record<number, Record<string, string>> = {};
    const hydratedFillBlankAnswers: Record<number, Record<number, string>> = {};

    quiz.forEach((item, index) => {
      if (!item.isAttempted) return;

      if (item.type === "mcq") {
        hydratedMcqAnswers[index] = hydrateMcqAnswer(item);
      }

      if (item.type === "dragdrop") {
        hydratedDragDropAnswers[index] = hydrateDragDropAnswer(item);
      }

      if (item.type === "fillblank") {
        hydratedFillBlankAnswers[index] = hydrateFillBlankAnswer(item);
      }
    });

    setMcqAnswers(hydratedMcqAnswers);
    setDragDropAnswers(hydratedDragDropAnswers);
    setFillBlankAnswers(hydratedFillBlankAnswers);
    setSelectedAnswers(hydratedMcqAnswers[currentQuestionIndex] ?? []);
    // Hydrate saved answers only when a paused/resumed quiz payload arrives.
    // Navigating questions must not reset answers the user is entering now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]);

  const submitQuestionResponse = (
    isCorrect: boolean | null,
    answerJson: ExamAnswerJson | null,
  ) => {
    if (!examId || isCorrect === null) return;

    void api
      .post("/user/submit-question-response", {
        questionId: question.id,
        isCorrect,
        examId,
        availableTime: typeof availableTime === "number" ? availableTime : 0,
        answerJson,
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
    if (isCurrentQuestionLocked) {
      moveToQuestion(currentQuestionIndex + 1);
      return;
    }

    if (!hasCurrentAnswer) {
      setMarked((prev) => {
        const copy = new Set(prev);
        copy.delete(currentQuestionIndex);
        return copy;
      });

      setResults((prev) => {
        const copy = { ...prev };
        delete copy[currentQuestionIndex];
        return copy;
      });

      moveToQuestion(currentQuestionIndex + 1);
      return;
    }

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
      const answerJson = buildAnswerJson(
        question,
        selectedAnswers,
        dragDropAnswers[currentQuestionIndex] ?? {},
        fillBlankAnswers[currentQuestionIndex] ?? {},
      );

      setResults((prev) => ({
        ...prev,
        [currentQuestionIndex]: isCorrect,
      }));

      setMarked((prev) => {
        const copy = new Set(prev);
        copy.delete(currentQuestionIndex);
        return copy;
      });

      submitQuestionResponse(isCorrect, answerJson);
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
    if (isCurrentQuestionLocked) return;

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
      const answerJson = buildAnswerJson(
        question,
        selectedAnswers,
        dragDropAnswers[currentQuestionIndex] ?? {},
        fillBlankAnswers[currentQuestionIndex] ?? {},
      );

      setResults((prev) => ({
        ...prev,
        [currentQuestionIndex]: isCorrect,
      }));

      setMarked((prev) => {
        const copy = new Set(prev);
        copy.delete(currentQuestionIndex);
        return copy;
      });

      submitQuestionResponse(isCorrect, answerJson);
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
    if (isMarkAndNextDisabled) return;

    setMarked((prev) => {
      const copy = new Set(prev);
      copy.add(currentQuestionIndex);
      return copy;
    });

    if (question.type === "mcq" && selectedAnswers.length > 0) {
      setMcqAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswers,
      }));
    }

    setResults((prev) => {
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

  const getQuestionInstruction = () => {
    switch (question.type) {
      case "mcq": {
        const maxSelection = getMaxSelection(question);
        return maxSelection > 1
          ? `Select up to ${maxSelection} correct options for this question.`
          : "Select the correct option for this question.";
      }
      case "dragdrop":
        return "Drag each option and drop it beside the matching item.";
      case "fillblank":
        return "Choose the correct answers and place them into the blanks.";
      default:
        return "Read the question carefully before answering.";
    }
  };

  const questionTypeLabel = getQuestionTypeLabel();
  const questionInstruction = getQuestionInstruction();

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
            <button
              type="button"
              className="px-4 py-1.5 bg-Black_light text-white rounded-full text-xs flex items-center gap-2"
              aria-label={`Show ${questionTypeLabel || "question"} instructions`}
            >
              <InfoCircle /> Show Instructions
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] bg-Black_light text-white">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{questionTypeLabel}</p>
              <p className="leading-5">{questionInstruction}</p>
            </div>
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
            showResult={showResultState}
          />
        )}

        {question.type === "dragdrop" && (
          <ExamsDragDropRenderer
            question={question}
            answers={dragDropAnswers}
            setAnswers={setDragDropAnswers}
            showResult={showResultState}
            currentQuestionIndex={currentQuestionIndex}
          />
        )}

        {question.type === "fillblank" && (
          <ExamsFillBlankRenderer
            question={question}
            answers={fillBlankAnswers}
            setAnswers={setFillBlankAnswers}
            showResult={showResultState}
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

          {currentQuestionIndex === totalQuestions - 1 && !isCurrentQuestionLocked && (
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
            disabled={isMarkAndNextDisabled}
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
