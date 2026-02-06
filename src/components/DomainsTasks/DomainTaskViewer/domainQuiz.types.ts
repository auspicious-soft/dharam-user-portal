// quiz.types.ts
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";

export interface Step {
  type: "task" | "image" | "examples" | "keywords" | "quiz";
  content?: string;
  quiz?: QuizQuestion[];
}
