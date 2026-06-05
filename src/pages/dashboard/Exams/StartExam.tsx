/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { QuizQuestion } from "@/components/QuizComponents/quiz.types";
import { ClockIcon, PracticeIcon } from "@/utils/svgicons";
import { ExamsQuizRenderer } from "@/components/QuizComponents/ExamsComponents/ExamsQuizRenderer";
import { RightQuestionSidebar } from "../../../components/QuizComponents/ExamsComponents/RightQuestionSidebar";
import api from "@/lib/axios";
import ViewReportDialog, { ReportData } from "@/components/Questions/ViewReports/ViewReportDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPublicUrlForKey } from "@/utils/s3Upload";

type MockExamResultResponse = {
  reportId?: string;
  data?: {
    _id?: string;
    id?: string;
    reportId?: string;
    correct?: number;
    incorrect?: number;
    unanswered?: number;
    remarks?: string;
    overallPercentage?: number;
    timeTaken?: string;
    scoreBreakDown?: Record<
      string,
      {
        correct?: number;
        total?: number;
        percentage?: number;
      }
    >;
  };
};

const mapQuestions = (rawQuestions: any[]): QuizQuestion[] => {
  const resolveQuestionImageUrl = (value: unknown): string | undefined => {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    return /^https?:\/\//i.test(raw) ? raw : getPublicUrlForKey(raw);
  };

  return (Array.isArray(rawQuestions) ? rawQuestions : [])
    .map((question) => {
      const type = String(question.type ?? "").toUpperCase();

      if (type === "MCQ") {
        const options = (question.mcq ?? []).map(
          (option: any, index: number) => ({
            id: String.fromCharCode(97 + index),
            text: option.text ?? "",
          }),
        );
        const correctAnswers = (question.mcq ?? [])
          .map((option: any, index: number) =>
            option.isCorrect ? String.fromCharCode(97 + index) : null,
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
          imageUrl: resolveQuestionImageUrl(question.image),
          options,
          correctAnswer,
          correctAnswers,
          maxSelection,
        } as QuizQuestion;
      }

      if (type === "FIB") {
        const fibItems = Array.isArray(question.fib) ? question.fib : [];
        const hasExplicitBlanks = /BLANK/i.test(
          String(question.question ?? ""),
        );
        const blankCount = (
          String(question.question ?? "").match(/BLANK/gi) || []
        ).length;
        const hasZeroBasedOrder = fibItems.some(
          (item: any) => Number(item.correctOrder) === 0,
        );
        const normalizeOrder = (order: number) =>
          hasZeroBasedOrder ? order + 1 : order;

        const normalizedFibItems = fibItems
          .map((item: any) => {
            const order = Number(item.correctOrder);
            if (!Number.isFinite(order)) return null;
            const normalizedOrder = hasExplicitBlanks
              ? normalizeOrder(order)
              : order + 1;
            if (normalizedOrder < 1) return null;
            return { ...item, normalizedOrder };
          })
          .filter(Boolean) as Array<{ answer: string; normalizedOrder: number }>;

        const maxSelection =
          typeof question.maxSelection === "number" &&
          question.maxSelection > 0
            ? question.maxSelection
            : hasExplicitBlanks && blankCount > 0
              ? blankCount
              : Math.max(
                  1,
                  ...normalizedFibItems.map((item) => item.normalizedOrder || 0),
                );

        const usableFibItems = normalizedFibItems.filter(
          (item) => item.normalizedOrder <= maxSelection,
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
              (_, index) => `__${index + 1}__`,
            ).join(" ")}`.trim();

        const blanks = Array.from({ length: maxSelection }, (_, index) => {
          const blankOrder = index + 1;
          const matches = usableFibItems.filter(
            (item) => item.normalizedOrder === blankOrder,
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
          imageUrl: resolveQuestionImageUrl(question.image),
          questionTemplate,
          blanks,
          options: fibItems.map((blank: any) => blank.answer ?? ""),
        } as QuizQuestion;
      }

      if (type === "DND") {
        const draggableItems = (question.dnd?.options ?? []).map(
          (option: any) => ({
            id: option.id,
            text: option.text ?? "",
          }),
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
          imageUrl: resolveQuestionImageUrl(question.image),
          draggableItems,
          dropZones,
        } as QuizQuestion;
      }

      return null;
    })
    .filter(Boolean) as QuizQuestion[];
};

// ─── Timer hook ───
function useTimer(initialSeconds: number, isPaused: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, isPaused]);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return { display: `${hh}:${mm}:${ss}`, seconds };
}

// ─── Main Component ───
const StartExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mockExamData = (location.state as { mockExam?: any })?.mockExam;

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<Record<number, any>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportId, setReportId] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const autoSubmittedRef = useRef(false);

  const parseDuration = (raw?: string | null) => {
    const text = String(raw ?? "").trim();
    if (!text) return 0;
    const parts = text.split(":").map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) return 0;
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }
    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    }
    if (parts.length === 1) {
      return parts[0];
    }
    return 0;
  };

  const initialSeconds = useMemo(() => {
    const totalSeconds = parseDuration(mockExamData?.timeInMin);
    const takenSeconds = parseDuration(mockExamData?.timeTaken);
    return Math.max(0, totalSeconds - takenSeconds);
  }, [mockExamData?.timeInMin, mockExamData?.timeTaken]);

  const { display: timeDisplay, seconds: remainingSeconds } = useTimer(
    initialSeconds,
    isPaused,
  );

  const timeTaken = useMemo(() => {
    const elapsed = Math.max(0, initialSeconds - remainingSeconds);
    const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [initialSeconds, remainingSeconds]);

  useEffect(() => {
    if (!mockExamData) return;

    const mapped = mapQuestions(mockExamData.questions ?? []);
    setQuiz(mapped);
    setCurrentQuestion(1);
    setResults({});
    setMarked(new Set());
    setIsPaused(false);
  }, [mockExamData]);

  const totalQuestions = quiz.length;
  const progressPercent = totalQuestions
    ? (currentQuestion / totalQuestions) * 100
    : 0;
  const hasQuiz = totalQuestions > 0;
  const examTitle = mockExamData?.examName ?? "Mock Exam";
  const examCourseId = useMemo(() => {
    const rawCourseId = mockExamData?.courseId;
    if (typeof rawCourseId === "string") return rawCourseId;
    if (rawCourseId && typeof rawCourseId === "object") {
      return (rawCourseId._id as string | undefined) ?? "";
    }
    return "";
  }, [mockExamData?.courseId]);

  const handleQuestionChange = (index: number) => {
    setCurrentQuestion(index + 1);
  };

  const handleJump = (index: number) => {
    setCurrentQuestion(index + 1);
  };

  const handleSubmitExam = useCallback(async (openReport = true) => {
    if (!mockExamData?.examId) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await api.get("/user/mock-exam-result", {
        params: { examId: mockExamData.examId, timeTaken },
      });
      if (!openReport) {
        navigate("/exams");
        return;
      }

      const payload = (response.data as MockExamResultResponse)?.data;
      if (!payload) return;
      const responseBody = response.data as MockExamResultResponse;
      const nextReportId =
        payload.reportId ??
        payload._id ??
        payload.id ??
        responseBody.reportId ??
        "";
      setReportId(nextReportId);

      const domains = Object.entries(payload.scoreBreakDown ?? {}).map(
        ([name, values]) => ({
          name,
          percentage: Number(values?.percentage ?? 0),
        }),
      );

      setReportData({
        score: Number(payload.overallPercentage ?? 0),
        timeSpent: payload.timeTaken ?? timeTaken,
        correct: Number(payload.correct ?? 0),
        incorrect: Number(payload.incorrect ?? 0),
        unanswered: Number(payload.unanswered ?? 0),
        remarks: payload.remarks ?? "",
        domains,
      });
      setReportOpen(true);
    } catch (error) {
      console.error("Failed to submit mock exam result", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, mockExamData?.examId, navigate, timeTaken]);

  const handleAttemptMarkedQuestions = useCallback(() => {
    const firstMarkedQuestion = Array.from(marked).sort((a, b) => a - b)[0];
    if (firstMarkedQuestion === undefined) return;

    setCurrentQuestion(firstMarkedQuestion + 1);
    toast.dismiss("marked-questions-submit");
  }, [marked]);

  const handleSubmitWithMarkedCheck = useCallback((openReport = true) => {
    if (marked.size > 0) {
      const markedQuestionNumbers = Array.from(marked)
        .sort((a, b) => a - b)
        .map((index) => index + 1)
        .join(", ");

      toast.warning("You have marked questions.", {
        id: "marked-questions-submit",
        description: `Marked questions: ${markedQuestionNumbers}. Do you want to attempt them before submitting?`,
        action: {
          label: "Attempt",
          onClick: handleAttemptMarkedQuestions,
        },
        cancel: {
          label: "Submit anyway",
          onClick: () => {
            void handleSubmitExam(openReport);
          },
        },
        duration: 10000,
      });
      return;
    }

    void handleSubmitExam(openReport);
  }, [handleAttemptMarkedQuestions, handleSubmitExam, marked]);

  const handleConfirmPause = async () => {
    if (!mockExamData?.examId) return;

    try {
      await api.put(
        `/user/mock-exam-questions/${mockExamData.examId}`,
        null,
        {
          params: { timeTaken },
        },
      );
      navigate("/exams");
    } catch (error) {
      console.error("Failed to pause mock exam", error);
    }
  };

  const handleLeaveAndSubmit = async () => {
    setShowLeaveDialog(false);
    await handleSubmitExam(false);
  };

  const handleViewQuestions = () => {
    if (!reportId) return;

    const params = new URLSearchParams({
      type: "mock",
      reportId,
    });

    navigate(`/exams/view-reports/questions?${params.toString()}`, {
      state: { fromExamStart: true },
    });
  };

  useEffect(() => {
    if (!hasQuiz) return;

    const handlePopState = () => {
      setShowLeaveDialog(true);
      window.history.pushState({ examBackGuard: true }, "", window.location.href);
    };

    window.history.pushState({ examBackGuard: true }, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasQuiz]);

  useEffect(() => {
    if (!hasQuiz || !mockExamData?.examId) return;
    if (remainingSeconds > 0) return;
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    void handleSubmitExam();
  }, [hasQuiz, mockExamData?.examId, remainingSeconds, handleSubmitExam]);

  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "c") {
        event.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="grid gird-col-1 md:grid-cols-[1fr_286px] h-full">
        <div className="flex flex-col gap-7 px-4 py-[26px] md:px-[30px]">
          <div className="flex items-center gap-2 md:gap-4 justify-between flex-col md:flex-row">
            <div className="flex items-center gap-2 md:gap-4 self-stretch justify-start">
              <PracticeIcon />
              <h3 className="text-Black_light text-lg font-bold">
                {examTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2 md:gap-4 self-stretch justify-start">
              <ClockIcon />
              <div className="flex flex-col">
                <div className="text-center justify-start text-Black_light text-xl font-bold">
                  {timeDisplay}
                </div>
                <div className="text-sm text-Desc-464646">Time Left</div>
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
              <span className="text-paragraph text-sm">
                {" "}
                of {totalQuestions}
              </span>
            </div>
          </div>

          {hasQuiz ? (
            <ExamsQuizRenderer
              quiz={quiz}
              activeQuestionIndex={currentQuestion - 1}
              onQuestionChange={handleQuestionChange}
              examId={mockExamData?.examId}
              courseId={examCourseId}
              availableTime={remainingSeconds}
              results={results}
              setResults={setResults}
              marked={marked}
              setMarked={setMarked}
              onComplete={() => {
                handleSubmitWithMarkedCheck();
              }}
            />
          ) : (
            <div className="p-5 bg-light-blue rounded-[20px] text-paragraph text-sm">
              No questions available for this exam.
            </div>
          )}

          <div className="inline-flex justify-center items-center md:mt-5">
            <div className="border-[1px] border-light-blue flex justify-start items-start gap-y-4 gap-x-4 md:gap-x-7 lg:gap-x-[60px] p-3 rounded-[10px] flex-wrap">
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute rounded-full border border-primary_blue" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Unseen Questions
                  </div> 
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute bg-primary_heading rounded-full" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Completed Questions
                  </div>
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute bg-paragraph rounded-full" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Not Attempted Questions
                  </div>
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute bg-[#ff0000] rounded-full" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Mark &amp; Next
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
         {hasQuiz && (
          <RightQuestionSidebar
            total={totalQuestions}
            current={currentQuestion - 1}
            results={results}
            marked={marked}
            onJump={handleJump}
            onPauseChange={setIsPaused}
            onSubmitExam={handleSubmitWithMarkedCheck}
            onConfirmPause={handleConfirmPause}
          />
        )}
      </div>
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-md rounded-2xl p-7">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-center text-2xl text-Black_light font-bold">
              Leave Exam?
            </DialogTitle>
            <DialogDescription className="text-paragraph text-base font-medium text-center">
              Are you sure you want to leave this exam? We will submit your exam now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 max-h-[44px]"
              onClick={() => setShowLeaveDialog(false)}
            >
              Stay Here
            </Button>
            <Button
              className="flex-1 max-h-[44px]"
              onClick={handleLeaveAndSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Yes, Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ViewReportDialog
        open={reportOpen}
        onOpenChange={(open) => {
          setReportOpen(open);
          if (!open) {
            navigate("/exams");
          }
        }}
        report={reportData}
        isLoading={isSubmitting}
        showViewQuestions={Boolean(reportId)}
        onViewQuestions={handleViewQuestions}
      />
    </div>
  );
};

export default StartExam;
