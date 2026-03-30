import { useEffect, useState } from "react";
import { AdvancedQuiz } from "./AdvancedQuiz";
import { Step } from "./domainQuiz.types";
import api from "@/lib/axios";
import { QuizRenderer } from "@/components/QuizComponents/QuizRenderer";
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";

interface StepRendererProps {
  step: Step;
}

export const StepRenderer = ({ step }: StepRendererProps) => {
  switch (step.type) {
    case "task":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: step.content ?? "" }}
        />
      );

    case "image":
      return (
        <img
          src={step.content}
          alt="Task"
          className="w-full h-[60vh] rounded-lg object-contain"
        />
      );

    case "examples":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: step.content ?? "" }}
        />
      );

    case "keywords":
      return (
          <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: step.content ?? "" }}
        />
      );

    case "quiz":
      return step.quiz ? <AdvancedQuiz quiz={step.quiz} /> : null;
    case "questions":
      return <DomainTaskQuestions taskId={step.content ?? ""} />;

    default:
      return null;
  }
};

const DomainTaskQuestions = ({ taskId }: { taskId: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [allAttempted, setAllAttempted] = useState(false);

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
          const orderedFibItems = fibItems.filter((item: any) => {
            const order = Number(item.correctOrder);
            return Number.isFinite(order) && order > 0;
          });
          const maxSelection =
            typeof question.maxSelection === "number" &&
            question.maxSelection > 0
              ? question.maxSelection
              : Math.max(
                  1,
                  ...orderedFibItems.map((item: any) =>
                    Number(item.correctOrder) || 0
                  )
                );

          let blankIndex = 1;
          const questionTemplate = String(question.question ?? "").replace(
            /BLANK/g,
            () => `__${blankIndex++}__`
          );

          const blanks = Array.from({ length: maxSelection }, (_, index) => {
            const blankOrder = index + 1;
            const matches = orderedFibItems.filter(
              (item: any) => Number(item.correctOrder) === blankOrder
            );
            return {
              id: String(blankOrder),
              correctAnswers: matches.map((item: any) => item.answer ?? ""),
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
    if (!taskId) return;

    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          `/user/domain-task-questions?taskId=${taskId}`
        );
        const data = (response.data as { data?: any[] })?.data ?? [];
        const mapped = mapQuestions(data);
        const filtered = mapped.filter((question) => !question.isAttempted);
        setAllAttempted(mapped.length > 0 && filtered.length === 0);
        setQuestions(filtered);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch domain task questions", error);
        setQuestions([]);
        setAllAttempted(false);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQuestions();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="p-5 bg-light-blue rounded-[20px] text-paragraph text-sm">
        Loading questions...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-5 bg-light-blue rounded-[20px] text-paragraph text-sm">
        {allAttempted
          ? "You have already attempted all questions for this task."
          : "Questions are not available yet for this task."}
      </div>
    );
  }

  return (
    <div className="p-5 bg-light-blue rounded-[20px]">
      <QuizRenderer
        quiz={questions}
        attemptConfig={{ type: "TASK", taskId }}
      />
    </div>
  );
};
