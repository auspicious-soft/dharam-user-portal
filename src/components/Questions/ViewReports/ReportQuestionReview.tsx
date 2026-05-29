import type { ReportQuestionItem } from "./reportQuestions";

type Props = {
  questions: ReportQuestionItem[];
};

const ReportQuestionReview = ({ questions }: Props) => {
  const renderQuestionContent = (currentQuestion: ReportQuestionItem) => {
    const reviewedQuestion = currentQuestion.questionId;
    const reviewType = String(reviewedQuestion?.type ?? "").toUpperCase();

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
      const fibItems = reviewedQuestion.fib ?? [];
      const blankCount = (
        String(reviewedQuestion.question ?? "").match(/BLANK/gi) || []
      ).length;
      const maxFibSelection =
        typeof reviewedQuestion.maxSelection === "number" &&
        reviewedQuestion.maxSelection > 0
          ? reviewedQuestion.maxSelection
          : blankCount > 0
            ? blankCount
            : Number.POSITIVE_INFINITY;

      return (
        <div className="space-y-2">
          {fibItems.length ? (
            fibItems.map((item, index) => {
              const normalizedOrder =
                typeof item.correctOrder === "number" ? item.correctOrder : null;
              const isCorrect =
                typeof normalizedOrder === "number" &&
                normalizedOrder >= 1 &&
                normalizedOrder <= maxFibSelection;

              return (
                <div
                  key={item._id ?? `${index}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isCorrect
                      ? "border-[#53A32D] bg-[#EAF8E3]"
                      : "border-[#d9e8ff] bg-white"
                  }`}
                >
                  {item.answer ?? "-"}
                </div>
              );
            })
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
                <span className="mx-2">-&gt;</span>
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
              {reviewedQuestion?.explaination ? (
                <p className="mt-4 text-sm text-paragraph">
                  Explanation: {reviewedQuestion.explaination}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportQuestionReview;
