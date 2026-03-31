/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Refresh } from "iconoir-react";
import { PracticeQuizRenderer } from "@/components/QuizComponents/PracticeQuizRenderer";
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";
import { ClockIcon, PracticeIcon } from "@/utils/svgicons";
import { ExitExamDialog } from "@/components/Questions/ExitExamDialog";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "@/lib/axios";

//  Timer hook 
function useTimer(isPaused: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

//  Main Component 
const QuestionsView = () => {
  const [quizKey, setQuizKey] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [examName, setExamName] = useState("Practice Questions");
  const [isLoading, setIsLoading] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState<number | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const timeDisplay = useTimer(showExitDialog);
  const { id: examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
 

  const mapQuestions = (rawQuestions: any[]): QuizQuestion[] => {
    return (Array.isArray(rawQuestions) ? rawQuestions : [])
      .map((question) => {
        const type = String(question.type ?? "").toUpperCase();

        if (type === "MCQ") {
          const options = (question.mcq ?? []).map(
            (option: any, index: number) => ({
              id: String.fromCharCode(97 + index),
              text: option.text ?? "",
            })
          );
          const correctAnswers = (question.mcq ?? [])
            .map((option: any, index: number) =>
              option.isCorrect ? String.fromCharCode(97 + index) : null
            )
            .filter(Boolean) as string[];
          const maxSelection =
            typeof question.maxSelection === "number" &&
            question.maxSelection > 0
              ? question.maxSelection
              : Math.max(1, correctAnswers.length || 1);
          const correctAnswer = correctAnswers[0] ?? "a";

          return {
            id: question._id,
            type: "mcq",
            question: question.question ?? "",
            qExplanation: question.explaination ?? "",
            options,
            correctAnswer,
            correctAnswers,
            maxSelection,
            isAttempted: Boolean(question.isAttempted),
          } as QuizQuestion;
        }

        if (type === "FIB") {
          const fibItems = Array.isArray(question.fib) ? question.fib : [];
          const hasExplicitBlanks = /BLANK/i.test(
            String(question.question ?? "")
          );
          const normalizedFibItems = fibItems
            .map((item: any) => {
              const order = Number(item.correctOrder);
              if (!Number.isFinite(order)) return null;
              if (hasExplicitBlanks) {
                if (order <= 0) return null;
                return { ...item, normalizedOrder: order };
              }
              if (order < 0) return null;
              return { ...item, normalizedOrder: order + 1 };
            })
            .filter(Boolean) as Array<{ answer: string; normalizedOrder: number }>;

          const maxSelection =
            typeof question.maxSelection === "number" &&
            question.maxSelection > 0
              ? question.maxSelection
              : Math.max(
                  1,
                  ...normalizedFibItems.map((item) => item.normalizedOrder || 0)
                );

          let blankIndex = 1;
          const questionTemplate = hasExplicitBlanks
            ? String(question.question ?? "").replace(/BLANK/g, () => {
                const token = `__${blankIndex}__`;
                blankIndex += 1;
                return token;
              })
            : `${question.question ?? ""} ${Array.from(
                { length: maxSelection },
                (_, index) => `__${index + 1}__`
              ).join(" ")}`.trim();

          const blanks = Array.from({ length: maxSelection }, (_, index) => {
            const blankOrder = index + 1;
            const matches = normalizedFibItems.filter(
              (item) => item.normalizedOrder === blankOrder
            );
            return {
              id: String(blankOrder),
              correctAnswers: matches.map((item) => item.answer ?? ""),
            };
          });

          return {
            id: question._id,
            type: "fillblank",
            question: question.question ?? "",
            qExplanation: question.explaination ?? "",
            questionTemplate,
            blanks,
            options: fibItems.map((blank: any) => blank.answer ?? ""),
            isAttempted: Boolean(question.isAttempted),
          } as QuizQuestion;
        }

        if (type === "DND") {
          const draggableItems = (question.dnd?.options ?? []).map(
            (option: any) => ({
              id: option.id,
              text: option.text ?? "",
            })
          );
          const dropZones = (question.dnd?.pairs ?? []).map((pair: any) => ({
            id: pair.leftId,
            label: pair.leftText ?? "",
            correctItemId: pair.rightId,
            displayText: pair.leftText ?? "",
          }));

          return {
            id: question._id,
            type: "dragdrop",
            question: question.question ?? "",
            qExplanation: question.explaination ?? "",
            draggableItems,
            dropZones,
            isAttempted: Boolean(question.isAttempted),
          } as QuizQuestion;
        }

        return null;
      })
      .filter(Boolean) as QuizQuestion[];
  };

  useEffect(() => {
    if (!examId) return;

    const stateName = (location.state as { examName?: string })?.examName;
    if (stateName) setExamName(stateName);

    const fetchExamQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `/user/practice-exam-questions?examId=${examId}`
        );
        const data = (response.data as { data?: any })?.data;
        const questions = data?.questions ?? [];
        const mapped = mapQuestions(questions);
        setAttemptNumber(
          typeof data?.attemptNumber === "number" ? data.attemptNumber : null
        );
        setQuiz(mapped);
        setCurrentQuestion(1);
        setQuizKey((prev) => prev + 1);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch practice exam questions", error);
        setQuiz([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchExamQuestions();
  }, [examId, location.state]);


  const totalQuestions = quiz.length;
  const progressPercent = totalQuestions
    ? (currentQuestion / totalQuestions) * 100
    : 0;

  const handleQuestionChange = (index: number) => {
    setCurrentQuestion(index + 1);
  };

  const handleRefresh = () => {
    setCurrentQuestion(1); // reset counter back to question 1
    setQuizKey((prev) => prev + 1); // remount the renderer fresh
  };

  const handleEndPracticing = async () => {
    if (examId && attemptNumber !== null) {
      try {
        await api.get("/user/practice-exam-result-board", {
          params: { examId, attemptNumber },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch practice exam result board", error);
      }
    }

    setShowExitDialog(false);
    navigate("/practice-questions");
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold md:leading-[46px]">
          Practice Questions
        </h2>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            className="rounded-[10px] w-[44px] h-[44px] md:w-12 md:h-12"
            onClick={handleRefresh}
          >
            <Refresh />
          </Button>
          <Button
            className="rounded-[10px] "
            onClick={() => setShowExitDialog(true)}
          >
            Done Practicing <Check />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 justify-between flex-col md:flex-row">
        <div className="flex items-center gap-2 md:gap-4 self-stretch justify-start">
          <PracticeIcon />
          <h3 className="text-Black_light text-lg font-bold">{examName}</h3>
        </div>

        <div className="flex items-center gap-2 md:gap-4 self-stretch justify-start">
          <ClockIcon />
          <div className="flex flex-col">
            <div className="text-center justify-start text-Black_light text-xl font-bold">
              {timeDisplay}
            </div>
            <div className="text-sm text-Desc-464646">Time Taken</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full h-[7px] bg-[#EDEDED] rounded-full mt-[-10px]">
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "#4C8DEA",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div>
          <span className="text-primary_blue text-sm">
            Question {currentQuestion}
          </span>
          <span className="text-paragraph text-sm"> of {totalQuestions}</span>
        </div>
      </div>

      {attemptNumber !== null && (
        <div className="text-xs text-paragraph">Attempt #{attemptNumber}</div>
      )}

      {isLoading ? (
        <div className="p-5 bg-light-blue rounded-[20px] text-paragraph text-sm">
          Loading questions...
        </div>
      ) : quiz.length ? (
        <PracticeQuizRenderer
          key={quizKey}
          quiz={quiz}
          onQuestionChange={handleQuestionChange}
          attemptConfig={
            examId && attemptNumber !== null
              ? { examId, attemptNumber }
              : undefined
          }
        />
      ) : (
        <div className="p-5 bg-light-blue rounded-[20px] text-paragraph text-sm">
          No questions available for this exam.
        </div>
      )}

      <ExitExamDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onEnd={handleEndPracticing}
      />
    </div>
  );
};

export default QuestionsView;
