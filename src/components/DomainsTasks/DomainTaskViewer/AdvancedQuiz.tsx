import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";
import { DomainQuizDialog } from "./DomainQuizDialog";
import { QuizRenderer } from "@/components/QuizComponents/QuizRenderer";

interface AdvancedQuizProps {
  quiz: QuizQuestion[];
}

export const AdvancedQuiz = ({ quiz }: AdvancedQuizProps) => {
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const navigate = useNavigate();

  const handleComplete = () => {
    setShowQuizDialog(true);
  };

  const handleCloseDialog = () => setShowQuizDialog(false);

  const handleGoToDomain = () => {
    setShowQuizDialog(false);
    navigate("/domains-tasks");
  };

  return (
    <>
      <QuizRenderer quiz={quiz} onComplete={handleComplete} />
      <DomainQuizDialog
        open={showQuizDialog}
        onClose={handleCloseDialog}
        onGoToDomain={handleGoToDomain}
      />
    </>
  );
};