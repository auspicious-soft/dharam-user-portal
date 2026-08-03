import { useState } from "react";

import type { ReportQuestionItem } from "./reportQuestions";

type Props = {
  questions: ReportQuestionItem[];
};

const normalizeText = (value: unknown) => String(value ?? "").trim();

const sortByNumericKey = ([firstKey]: [string, string], [secondKey]: [string, string]) =>
  Number(firstKey) - Number(secondKey);

const getSelectedAnswerArray = (currentQuestion: ReportQuestionItem) => {
  const selectedAnswer = currentQuestion.answerJson?.selectedAnswer;

  if (Array.isArray(selectedAnswer)) {
    return selectedAnswer.map(normalizeText).filter(Boolean);
  }

  if (selectedAnswer && typeof selectedAnswer === "object") {
    return Object.entries(selectedAnswer)
      .sort(sortByNumericKey)
      .map(([, answer]) => normalizeText(answer))
      .filter(Boolean);
  }

  return [];
};

const getSelectedAnswerRecord = (currentQuestion: ReportQuestionItem) => {
  const selectedAnswer = currentQuestion.answerJson?.selectedAnswer;

  if (
    selectedAnswer &&
    typeof selectedAnswer === "object" &&
    !Array.isArray(selectedAnswer)
  ) {
    return selectedAnswer;
  }

  return {};
};

const isSelectedText = (selectedAnswers: string[], value: unknown) => {
  const text = normalizeText(value).toLowerCase();

  return selectedAnswers.some(
    (answer) => normalizeText(answer).toLowerCase() === text,
  );
};

const getSelectedAnswerClass = (currentQuestion: ReportQuestionItem) =>
  currentQuestion.isCorrect
    ? "border-[#53A32D] bg-[#EAF8E3] text-[#2C7A1F]"
    : "border-[#F04438] bg-[#FDECEC] text-[#B42318]";

const getSelectedFibAnswerClass = (
  currentQuestion: ReportQuestionItem,
  optionText: unknown,
) => {
  const selectedAnswers = getSelectedAnswerArray(currentQuestion);
  const normalizedOption = normalizeText(optionText).toLowerCase();
  const selectedIndex = selectedAnswers.findIndex(
    (answer) => normalizeText(answer).toLowerCase() === normalizedOption,
  );

  if (selectedIndex === -1) return "";

  const blankOrder = selectedIndex + 1;
  const matchingCorrectAnswers = (currentQuestion.questionId?.fib ?? [])
    .filter((item) => Number(item.correctOrder) === blankOrder)
    .map((item) => normalizeText(item.answer).toLowerCase());

  return matchingCorrectAnswers.includes(normalizedOption)
    ? "border-[#53A32D] bg-[#EAF8E3] text-[#2C7A1F]"
    : "border-[#F04438] bg-[#FDECEC] text-[#B42318]";
};

const getOrderedFibAnswers = (
  currentQuestion: ReportQuestionItem,
) => {
  const reviewedQuestion = currentQuestion.questionId;
  const fibItems = reviewedQuestion?.fib ?? [];
  const blankCount = (
    String(reviewedQuestion?.question ?? "").match(/BLANK/gi) || []
  ).length;
  const maxSelection =
    typeof reviewedQuestion?.maxSelection === "number" &&
    reviewedQuestion.maxSelection > 0
      ? reviewedQuestion.maxSelection
      : blankCount > 0
        ? blankCount
        : Number.POSITIVE_INFINITY;
  return fibItems
    .map((item) => {
      const order = Number(item.correctOrder);
      if (!Number.isFinite(order)) return null;

      return {
        label: `Blank ${order}`,
        answer: item.answer ?? "-",
        order,
      };
    })
    .filter((item): item is { label: string; answer: string; order: number } =>
      Boolean(item && item.order > 0 && item.order <= maxSelection),
    )
    .sort((first, second) => first.order - second.order);
};

const getCorrectAnswerRows = (currentQuestion: ReportQuestionItem) => {
  const reviewedQuestion = currentQuestion.questionId;
  const reviewType = String(reviewedQuestion?.type ?? "").toUpperCase();

  if (!reviewedQuestion) return [];

  if (reviewType === "MCQ") {
    return (reviewedQuestion.mcq ?? [])
      .filter((option) => option.isCorrect)
      .map((option, index) => ({
        label: `Answer ${index + 1}`,
        answer: option.text ?? "-",
      }));
  }

  if (reviewType === "FIB") {
    return getOrderedFibAnswers(currentQuestion);
  }

  if (reviewType === "DND") {
    const optionsById = new Map(
      (reviewedQuestion.dnd?.options ?? []).map((item) => [
        item.id,
        item.text ?? "",
      ]),
    );

    return (reviewedQuestion.dnd?.pairs ?? []).map((pair) => ({
      label: pair.leftText ?? "-",
      answer: optionsById.get(pair.rightId) ?? "-",
    }));
  }

  return [];
};

const ReportQuestionReview = ({ questions }: Props) => {
  const [openCorrectAnswers, setOpenCorrectAnswers] = useState<Set<string>>(
    new Set(),
  );

  const toggleCorrectAnswer = (questionId: string) => {
    setOpenCorrectAnswers((prev) => {
      const next = new Set(prev);

      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }

      return next;
    });
  };

  const renderQuestionContent = (currentQuestion: ReportQuestionItem) => {
    const reviewedQuestion = currentQuestion.questionId;
    const reviewType = String(reviewedQuestion?.type ?? "").toUpperCase();
    const selectedAnswers = getSelectedAnswerArray(currentQuestion);

    if (!reviewedQuestion) return null;

    if (reviewType === "MCQ") {
      return (
        <div className="space-y-2">
          {(reviewedQuestion.mcq ?? []).map((option, index) => (
            <div
              key={option._id ?? `${index}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                isSelectedText(selectedAnswers, option.text)
                  ? getSelectedAnswerClass(currentQuestion)
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
      const fibItems = reviewedQuestion.fib ?? [];

      return (
        <div className="space-y-2">
          {fibItems.length ? (
            fibItems.map((item, index) => (
              <div
                key={item._id ?? `${index}`}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  isSelectedText(selectedAnswers, item.answer)
                    ? getSelectedFibAnswerClass(currentQuestion, item.answer)
                    : "border-[#d9e8ff] bg-white"
                }`}
              >
                {item.answer ?? "-"}
              </div>
            ))
          ) : (
            <div className="text-sm text-paragraph">No answer options found.</div>
          )}
        </div>
      );
    }

    if (reviewType === "DND") {
      const pairs = reviewedQuestion.dnd?.pairs ?? [];
      const selectedAnswerRecord = getSelectedAnswerRecord(currentQuestion);

      return (
        <div className="space-y-2">
          {pairs.length ? (
            pairs.map((pair, index) => {
              const selectedAnswer = selectedAnswerRecord[String(index)];

              return (
                <div
                  key={`${pair.leftId ?? index}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    selectedAnswer
                      ? getSelectedAnswerClass(currentQuestion)
                      : "border-[#d9e8ff] bg-white"
                  }`}
                >
                  <span className="font-medium">{pair.leftText ?? "-"}</span>
                  <span className="mx-2">-&gt;</span>
                  <span>{selectedAnswer || "-"}</span>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-paragraph">No drag-drop pairs found.</div>
          )}
        </div>
      );
    }

    return <div className="text-sm text-paragraph">Unsupported question type.</div>;
  };

  const renderCorrectAnswerToggle = (currentQuestion: ReportQuestionItem) => {
    const correctAnswerRows = getCorrectAnswerRows(currentQuestion);

    if (!correctAnswerRows.length) return null;

    return (
      <button
        type="button"
        onClick={() => toggleCorrectAnswer(currentQuestion._id)}
        className="text-sm font-semibold text-[#2C7A1F] hover:underline"
      >
        See Correct Answer
      </button>
    );
  };

  const renderCorrectAnswerContent = (currentQuestion: ReportQuestionItem) => {
    const isOpen = openCorrectAnswers.has(currentQuestion._id);
    const correctAnswerRows = getCorrectAnswerRows(currentQuestion);

    if (!isOpen || !correctAnswerRows.length) return null;

    return (
      <div className="mt-3 space-y-2 rounded-lg border border-[#BFE6B0] bg-white p-3">
        {correctAnswerRows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="rounded-md border border-[#53A32D] bg-[#EAF8E3] px-3 py-2 text-sm text-[#2C7A1F]"
          >
            <span className="font-medium">{row.label}: </span>
            <span>{row.answer}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!questions.length) {
    return (
      <div className="rounded-lg border border-[#d9e8ff] bg-[#f7fbff] p-5 text-center text-sm text-paragraph">
        No questions available.
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-240px)] min-h-64 overflow-y-auto pr-1">
      <div className="flex flex-col gap-5">
        {questions.map((currentQuestion, index) => {
          const reviewedQuestion = currentQuestion.questionId;
          const reviewType = String(reviewedQuestion?.type ?? "").toUpperCase();
          const reviewedQuestionText =
            reviewType === "FIB"
              ? String(reviewedQuestion?.question ?? "-").replace(
                  /BLANK/gi,
                  "__",
                )
              : reviewedQuestion?.question ?? "-";
          const evaluationLabel = !currentQuestion.isAttempted
            ? "Not Evaluated"
            : currentQuestion.isCorrect
              ? "Correct"
              : "Incorrect";
          const evaluationClass = !currentQuestion.isAttempted
            ? "bg-[#F4F4F5] text-[#52525B]"
            : currentQuestion.isCorrect
              ? "bg-[#EAF8E3] text-[#2C7A1F]"
              : "bg-[#FDECEC] text-[#B42318]";

          return (
            <div
              key={currentQuestion._id}
              className="rounded-lg border border-[#d9e8ff] bg-[#f7fbff] p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-medium text-primary_blue">
                  Question {index + 1} of {questions.length}
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

              <p className="text-base font-medium text-Black_light">
                {reviewedQuestionText}
              </p>
              <div className="mt-4">{renderQuestionContent(currentQuestion)}</div>
              <div className="mt-4">
                <div className="flex gap-2 justify-between flex-wrap">
                  {reviewedQuestion?.explaination ? (
                    <p className="text-sm text-paragraph">
                      Explanation: {reviewedQuestion.explaination}
                    </p>
                  ) : (
                    <div />
                  )}
                  <div className="shrink-0 sm:text-right">
                    {renderCorrectAnswerToggle(currentQuestion)}
                  </div>
                </div>
                {renderCorrectAnswerContent(currentQuestion)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportQuestionReview;
