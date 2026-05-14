"use client";
import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import ReportIcon from "@/assets/report-icon.png";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

/* -------------------- Types -------------------- */

export type DomainScore = {
  name: string;
  percentage: number;
};

export type ReportData = {
  score: number;
  timeSpent: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  remarks?: string;
  domains: DomainScore[];
};

export type ReportQuestionItem = {
  _id: string;
  examId?: string;
  isCorrect?: boolean | null;
  isAttempted?: boolean;
  questionId?: {
    _id: string;
    question?: string;
    type?: string;
    explaination?: string;
    maxSelection?: number;
    mcq?: Array<{
      _id?: string;
      text?: string;
      isCorrect?: boolean;
    }>;
    fib?: Array<{
      _id?: string;
      answer?: string;
      correctOrder?: number;
    }>;
    dnd?: {
      pairs?: Array<{
        leftId?: string;
        leftText?: string;
        rightId?: string;
      }>;
      options?: Array<{
        id?: string;
        text?: string;
      }>;
    };
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: ReportData | null;
  isLoading?: boolean;
  showViewQuestions?: boolean;
  onViewQuestions?: () => void;
  viewQuestionsLoading?: boolean;
  showQuestionsScreen?: boolean;
  questions?: ReportQuestionItem[];
  onBackToReport?: () => void;
};

/* -------------------- Components -------------------- */

const SummaryCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div
    className="text-white rounded-xl px-4 py-[14px] flex justify-between items-center"
    style={{ backgroundColor: color }}
  >
    <span className="text-base font-medium">{label}</span>
    <span className="text-base font-medium">{value}</span>
  </div>
);

/* -------------------- Main Dialog -------------------- */

const ViewReportDialog = ({
  open,
  onOpenChange,
  report,
  isLoading,
  showViewQuestions = false,
  onViewQuestions,
  viewQuestionsLoading = false,
  showQuestionsScreen = false,
  questions = [],
  onBackToReport,
}: Props) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    if (showQuestionsScreen) {
      setCurrentReviewIndex(0);
    }
  }, [showQuestionsScreen, questions.length]);

  const total = report
    ? report.correct + report.incorrect + report.unanswered
    : 0;

  const correctPercent = total ? (report?.correct ?? 0) / total * 100 : 0;
  const incorrectPercent = total ? (report?.incorrect ?? 0) / total * 100 : 0;
  const unansweredPercent = total ? (report?.unanswered ?? 0) / total * 100 : 0;

  const formatPercent = (value?: number) => {
    if (!Number.isFinite(value)) return "0";
    return value % 1 === 0 ? String(value) : value.toFixed(2);
  };

  const currentQuestion = useMemo(
    () => questions[currentReviewIndex],
    [questions, currentReviewIndex],
  );

  const reviewedQuestion = currentQuestion?.questionId;
  const reviewType = String(reviewedQuestion?.type ?? "").toUpperCase();
  const evaluationLabel = !currentQuestion?.isAttempted
    ? "Not Evaluated"
    : currentQuestion?.isCorrect
      ? "Correct"
      : "Incorrect";
  const evaluationClass = !currentQuestion?.isAttempted
    ? "bg-[#F4F4F5] text-[#52525B]"
    : currentQuestion?.isCorrect
      ? "bg-[#EAF8E3] text-[#2C7A1F]"
      : "bg-[#FDECEC] text-[#B42318]";

  const renderQuestionContent = () => {
    if (!reviewedQuestion) return null;

    if (reviewType === "MCQ") {
      return (
        <div className="space-y-2">
          {(reviewedQuestion.mcq ?? []).map((option, index) => (
            <div
              key={option._id ?? `${index}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                option.isCorrect
                  ? "border-[#53A32D] bg-[#EAF8E3]"
                  : "border-[#d9e8ff] bg-white"
              }`}
            >
              {option.text ?? ""}
            </div>
          ))}
        </div>
      );
    }

    if (reviewType === "FIB") {
      const maxFibSelection =
        typeof reviewedQuestion.maxSelection === "number" &&
        reviewedQuestion.maxSelection > 0
          ? reviewedQuestion.maxSelection
          : Number.POSITIVE_INFINITY;
      const visibleFibAnswers = (reviewedQuestion.fib ?? [])
        .filter((item) => {
          if (typeof item.correctOrder !== "number") return false;
          return item.correctOrder > 0 && item.correctOrder <= maxFibSelection;
        })
        .sort((a, b) => a.correctOrder - b.correctOrder);
      return (
        <div className="space-y-2">
          {visibleFibAnswers.length ? (
            visibleFibAnswers.map((item, index) => (
              <div
                key={item._id ?? `${index}`}
                className="rounded-lg border border-[#d9e8ff] bg-white px-3 py-2 text-sm"
              >
                Blank {item.correctOrder}: {item.answer ?? "-"}
              </div>
            ))
          ) : (
            <div className="text-sm text-paragraph">No answer options found.</div>
          )}
        </div>
      );
    }

    if (reviewType === "DND") {
      const optionsById = new Map(
        (reviewedQuestion.dnd?.options ?? []).map((item) => [
          item.id,
          item.text ?? "",
        ]),
      );
      const pairs = reviewedQuestion.dnd?.pairs ?? [];

      return (
        <div className="space-y-2">
          {pairs.length ? (
            pairs.map((pair, index) => (
              <div
                key={`${pair.leftId ?? index}`}
                className="rounded-lg border border-[#d9e8ff] bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium">{pair.leftText ?? "-"}</span>
                <span className="mx-2">→</span>
                <span>{optionsById.get(pair.rightId) ?? "-"}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-paragraph">No drag-drop pairs found.</div>
          )}
        </div>
      );
    }

    return <div className="text-sm text-paragraph">Unsupported question type.</div>;
  };

  if (showQuestionsScreen) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-center text-xl lg:text-2xl font-bold">
              Question Review
            </DialogTitle>
            <VisuallyHidden>
              <DialogDescription></DialogDescription>
            </VisuallyHidden>
          </DialogHeader>

          {questions.length === 0 || !currentQuestion ? (
            <div className="text-sm text-paragraph text-center">
              No questions available.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary_blue font-medium">
                  Question {currentReviewIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      currentQuestion.isAttempted
                        ? "bg-[#EAF8E3] text-[#2C7A1F]"
                        : "bg-[#FFF4E8] text-[#D97706]"
                    }`}
                  >
                    {currentQuestion.isAttempted ? "Attempted" : "Unattempted"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${evaluationClass}`}
                  >
                    {evaluationLabel}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[#d9e8ff] bg-[#f7fbff] p-4">
                <p className="text-base font-medium text-Black_light">
                  {reviewedQuestion?.question ?? "-"}
                </p>
                <div className="mt-4">{renderQuestionContent()}</div>
                {reviewedQuestion?.explaination ? (
                  <p className="mt-4 text-sm text-paragraph">
                    Explanation: {reviewedQuestion.explaination}
                  </p>
                ) : null}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentReviewIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentReviewIndex === 0 || questions.length === 0}
            >
              Previous
            </Button>
            <Button variant="outline" onClick={onBackToReport}>
              Back to Report
            </Button>
            <Button
              onClick={() =>
                setCurrentReviewIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1),
                )
              }
              disabled={
                questions.length === 0 || currentReviewIndex >= questions.length - 1
              }
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="gap-4">
          <img
            src={ReportIcon}
            alt="Report Icon"
            className="max-w-[80px] md:max-w-[100px] m-auto"
          />

          <DialogTitle className="text-center text-2xl lg:text-3xl font-bold">
            You've Scored
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>

          <div className="text-center text-primary_heading text-3xl md:text-[50px] font-bold leading-snug">
            {formatPercent(report?.score)}%
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="text-sm text-paragraph text-center">
            Loading report...
          </div>
        ) : null}

        {/* Total Time Spent */}
        <div className="px-4 py-[13px] bg-white rounded-lg flex justify-between border border-[#0a4ba8]/10">
          <p className="text-paragraph text-base font-medium">
            Total Time Spent
          </p>
          <p className="text-primary_heading text-base font-semibold">
            {report?.timeSpent ?? "-"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full h-2 rounded-full overflow-hidden gap-1">
          <div
            className="bg-[#53A32D] rounded-full"
            style={{ width: `${correctPercent}%` }}
          />
          <div
            className="bg-[#ff2121] rounded-full"
            style={{ width: `${incorrectPercent}%` }}
          />
          <div
            className="bg-[#ffa421] rounded-full"
            style={{ width: `${unansweredPercent}%` }}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          <SummaryCard
            label="Correct"
            value={report?.correct ?? 0}
            color="#53A32D"
          />
          <SummaryCard
            label="Incorrect"
            value={report?.incorrect ?? 0}
            color="#ff2121"
          />
          <SummaryCard
            label="Unanswered"
            value={report?.unanswered ?? 0}
            color="#ffa421"
          />
        </div>

        {report?.remarks ? (
          <div className="px-4 py-[13px] bg-white rounded-lg border border-[#0a4ba8]/10 flex justify-between gap-2">
            <p className="text-paragraph text-base font-medium">Remarks</p>
            <p className="text-primary_heading text-base font-semibold text-right">
              {report.remarks}
            </p>
          </div>
        ) : null}

        {/* Score Breakdown */}
        <div className="p-4 lg:p-5 bg-white rounded-lg border border-[#0a4ba8]/10">
          <h3 className="text-sm font-semibold mb-2">Score Breakdown</h3>

          {report?.domains?.length ? (
            report.domains.map((domain, index) => (
              <div key={index} className="flex justify-between py-2">
                <span className="text-paragraph text-base font-medium">
                  {domain.name}
                </span>
                <span className="text-primary_heading text-base font-semibold">
                  {formatPercent(domain.percentage)}% Correct
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-paragraph">No breakdown available.</div>
          )}
        </div>

        {showViewQuestions ? (
          <Button
            variant="link"
            className="w-full"
            onClick={onViewQuestions}
            disabled={viewQuestionsLoading}
          >
            {viewQuestionsLoading ? "Loading Questions..." : "Show Question"}
          </Button>
        ) : null}

        {/* Close Button */}
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReportDialog;
