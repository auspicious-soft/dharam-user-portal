import { AdvancedQuiz } from "./AdvancedQuiz";
import { Step } from "./domainQuiz.types";

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
          className="max-w-full rounded-lg"
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

    default:
      return null;
  }
};
