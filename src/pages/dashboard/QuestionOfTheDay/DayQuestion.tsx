import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MCQRenderer } from "@/components/QuizComponents/MCQRenderer";
import { DragDropRenderer } from "@/components/QuizComponents/DragDropRenderer";
import { FillBlankRenderer } from "@/components/QuizComponents/FillBlankRenderer";
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";
import {
  formatCorrectAnswerLabel,
  getCorrectAnswerIds,
  getMaxSelection,
  isMCQSelectionCorrect,
} from "@/components/QuizComponents/mcqUtils";
import QuestionDayIcon from "@/assets/edit-question-icon.png";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

const DayQuestion = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [dragDropAnswers, setDragDropAnswers] = useState<
    Record<number, Record<string, string>>
  >({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const mapQuestion = (rawQuestion: any): QuizQuestion | null => {
    if (!rawQuestion) return null;
    const type = String(rawQuestion.type ?? "").toUpperCase();

    if (type === "MCQ") {
      const options = (rawQuestion.mcq ?? []).map(
        (option: any, index: number) => ({
          id: String.fromCharCode(97 + index),
          text: option.text ?? "",
        }),
      );
      const correctAnswers = (rawQuestion.mcq ?? [])
        .map((option: any, index: number) =>
          option.isCorrect ? String.fromCharCode(97 + index) : null,
        )
        .filter(Boolean) as string[];
      const maxSelection =
        typeof rawQuestion.maxSelection === "number" &&
        rawQuestion.maxSelection > 0
          ? rawQuestion.maxSelection
          : Math.max(1, correctAnswers.length || 1);
      const correctAnswer = correctAnswers[0] ?? "a";

      return {
        id: rawQuestion._id ?? rawQuestion.id,
        type: "mcq",
        question: rawQuestion.question ?? "",
        qExplanation: rawQuestion.explaination ?? "",
        options,
        correctAnswer,
        correctAnswers,
        maxSelection,
        isAttempted: Boolean(rawQuestion.isAttempted),
      } as QuizQuestion;
    }

    if (type === "FIB") {
      const fibItems = Array.isArray(rawQuestion.fib) ? rawQuestion.fib : [];
      const hasExplicitBlanks = /BLANK/i.test(
        String(rawQuestion.question ?? ""),
      );
      const blankCount = (
        String(rawQuestion.question ?? "").match(/BLANK/gi) || []
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
        typeof rawQuestion.maxSelection === "number" &&
        rawQuestion.maxSelection > 0
          ? rawQuestion.maxSelection
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
        ? String(rawQuestion.question ?? "").replace(/BLANK/g, () => {
            const token = `__${blankIndex}__`;
            blankIndex += 1;
            return token;
          })
        : `${rawQuestion.question ?? ""} ${Array.from(
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
        id: rawQuestion._id ?? rawQuestion.id,
        type: "fillblank",
        question: rawQuestion.question ?? "",
        qExplanation: rawQuestion.explaination ?? "",
        questionTemplate,
        blanks,
        options: fibItems.map((blank: any) => blank.answer ?? ""),
        isAttempted: Boolean(rawQuestion.isAttempted),
      } as QuizQuestion;
    }

    if (type === "DND") {
      const draggableItems = (rawQuestion.dnd?.options ?? []).map(
        (option: any) => ({
          id: option.id,
          text: option.text ?? "",
        }),
      );
      const dropZones = (rawQuestion.dnd?.pairs ?? []).map((pair: any) => ({
        id: pair.leftId,
        label: pair.leftText ?? "",
        correctItemId: pair.rightId,
        displayText: pair.leftText ?? "",
      }));

      return {
        id: rawQuestion._id ?? rawQuestion.id,
        type: "dragdrop",
        question: rawQuestion.question ?? "",
        qExplanation: rawQuestion.explaination ?? "",
        draggableItems,
        dropZones,
        isAttempted: Boolean(rawQuestion.isAttempted),
      } as QuizQuestion;
    }

    return null;
  };

  useEffect(() => {
    const courseId =
      localStorage.getItem("selectedCourseId")

    const fetchQuestionOfTheDay = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/user/home/${courseId}`);
        const payload =
          (response.data as { data?: any })?.data ?? response.data ?? {};
        const rawQuestion =
          payload?.questionOfTheDay ??
          payload?.questionOfDay ??
          payload?.dailyQuestion ??
          payload?.question ??
          null;

        const mapped = mapQuestion(rawQuestion);
        setQuestion(mapped);
        setIsCompleted(Boolean(rawQuestion?.isAttempted ?? false));
        setAttemptId(rawQuestion?.attemptId ?? null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch question of the day", error);
        setQuestion(null);
        setAttemptId(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQuestionOfTheDay();
  }, []);

  useEffect(() => {
    setSelectedAnswers([]);
    setDragDropAnswers({});
    setFillBlankAnswers({});
    setShowResult(false);
  }, [question?.id]);

  // Check if answer is provided
  const isAnswered = () => {
    if (!question) return false;

    if (question.type === "mcq") {
      return selectedAnswers.length > 0;
    } else if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[0] || {};
      return Object.keys(currentAnswers).length === question.dropZones.length;
    } else if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[0] || {};
      const assignedBlanks = new Set(Object.values(currentAnswers));
      return question.blanks.every((blank) => assignedBlanks.has(blank.id));
    }
    return false;
  };

  // Check if the answer is correct
  const checkAnswer = () => {
    if (!question) return false;

    let correct = false;

    if (question.type === "mcq") {
      correct = isMCQSelectionCorrect(question, selectedAnswers);
    } else if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[0] || {};
      correct = question.dropZones.every(
        (zone) => currentAnswers[zone.id] === zone.correctItemId,
      );
    } else if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[0] || {};
      correct = question.blanks.every((blank) => {
        const assignedOptionIndex = Object.keys(currentAnswers).find(
          (key) => currentAnswers[parseInt(key)] === blank.id,
        );
        if (assignedOptionIndex === undefined) return false;
        return blank.correctAnswers.includes(
          question.options[parseInt(assignedOptionIndex)],
        );
      });
    }

    return correct;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!question) return;

    const correct = checkAnswer();
    setIsCorrect(correct);
    setShowResult(true);

    try {
      const courseId =
        localStorage.getItem("selectedCourseId")
      // const payload: { id: string; attemptId?: string } = { id: question.id };
      // if (attemptId) {
      //   payload.attemptId = attemptId;
      // }
      await api.post(`/user/question-of-the-day/${courseId}`, {id : attemptId});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to submit question of the day", error);
    } finally {
      setIsCompleted(true);
    }
  };

  // Get question type label
  const getQuestionTypeLabel = () => {
    if (!question) return "";

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

  // If already completed today
  if (isCompleted && !showResult) {
    return (
      <div className="flex flex-col gap-5">
        <div className=" inline-flex flex-col justify-start min-h-[77vh]">
          <div className="self-stretch p-4 md:p-[30px] bg-[#f0f8ff] rounded-[20px] inline-flex flex-col justify-start gap-2.5 max-w-xl w-full m-auto">
            <div className="p-4 bg-green-50 rounded-full">
              <img
                src={QuestionDayIcon}
                className="max-w-[80px] md:max-w-[100px] m-auto"
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
                Question of the day
              </h2>
              <p className="text-paragraph ">
                You’ve already completed the question of the day. Next question
                will unlock in{" "}
                {new Date(
                  new Date().setDate(new Date().getDate() + 1),
                ).toLocaleDateString()}
              </p>
              <Button
                          className="h-[44px] flex items-center gap-1 md:gap-2 w-full mt-6"
                          onClick={() => navigate("/")}
                        >
                          Got It
                        </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
          Question of the day
        </h2>
        <div className="p-6 text-center text-gray-500">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
          Question of the day
        </h2>
        <div className="p-6 text-center text-gray-500">
          No question available right now.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
        Question of the day
      </h2>
      <div className=" inline-flex flex-col justify-start min-h-[71vh]">
        <div className="self-stretch p-4 md:p-[30px] bg-[#f0f8ff] rounded-[20px] inline-flex flex-col justify-start gap-2.5 max-w-3xl w-full m-auto">
          <div className="flex justify-end gap-4">
            {!showResult && (
              <Button
                onClick={handleSubmit}
                disabled={!isAnswered()}
                variant="link"
                className="text-primary_heading"
              >
                Submit
              </Button>
            )}
          </div>

          <p className="justify-start text-paragraph text-base leading-6">
            {question.question}
          </p>

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

          <div className="mt-4">
            {question.type === "mcq" && (
              <MCQRenderer
                question={question}
                selectedAnswers={selectedAnswers}
                setSelectedAnswers={setSelectedAnswers}
                showResult={showResult}
              />
            )}

            {question.type === "dragdrop" && (
              <DragDropRenderer
                question={question}
                answers={dragDropAnswers}
                setAnswers={setDragDropAnswers}
                showResult={showResult}
                currentQuestionIndex={0}
              />
            )}

            {question.type === "fillblank" && (
              <FillBlankRenderer
                question={question}
                answers={fillBlankAnswers}
                setAnswers={setFillBlankAnswers}
                showResult={showResult}
                currentQuestionIndex={0}
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
                    {getCorrectAnswerIds(question).length > 1
                      ? "Correct answers:"
                      : "Correct answer:"}{" "}
                    {formatCorrectAnswerLabel(question)}
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

              <p className="justify-start text-paragraph text-sm font-medium">
                Explanation: {question.qExplanation}
              </p>

              <div className="w-full mt-4 pt-4 border-t border-gray-200">
                <p className="text-green-600 font-semibold">
                  ✓ Today's task completed! Come back tomorrow for a new
                  question.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayQuestion;
