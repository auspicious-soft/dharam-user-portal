import { MCQQuestion } from "./quiz.types";

export const getMaxSelection = (question: MCQQuestion) => {
  if (typeof question.maxSelection === "number" && question.maxSelection > 0) {
    return question.maxSelection;
  }
  return 1;
};

export const getCorrectAnswerIds = (question: MCQQuestion) => {
  if (Array.isArray(question.correctAnswers) && question.correctAnswers.length) {
    return question.correctAnswers;
  }
  if (question.correctAnswer) {
    return [question.correctAnswer];
  }
  return [];
};

export const formatCorrectAnswerLabel = (question: MCQQuestion) => {
  return getCorrectAnswerIds(question)
    .map((answer) => answer.toUpperCase())
    .join(", ");
};

export const isMCQSelectionCorrect = (
  question: MCQQuestion,
  selectedAnswers: string[],
) => {
  const correctAnswers = getCorrectAnswerIds(question);
  if (!correctAnswers.length) return false;
  if (selectedAnswers.length !== correctAnswers.length) return false;
  const selectedSet = new Set(selectedAnswers);
  return correctAnswers.every((answer) => selectedSet.has(answer));
};
