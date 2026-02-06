import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizRenderer } from "../QuizComponents/QuizRenderer";
import { QuizQuestion } from "../QuizComponents/quiz.types";
import { QuizResultDialog } from "./QuizResultDialog";

interface LessonsQuizRendererProps {
  quiz: QuizQuestion[];
  onClose: () => void;
}

const LessonsQuizRenderer = ({
  quiz,
  onClose,
}: LessonsQuizRendererProps) => {
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizResults, setQuizResults] = useState({ correct: 0, incorrect: 0 });
  const navigate = useNavigate();

  const handleComplete = (results: { correct: number; incorrect: number }) => {
    setQuizResults(results);
    setShowQuizDialog(true);
  };

  const handleCloseDialog = () => {
    setShowQuizDialog(false);
  };

  const handleGoToLessons = () => {
    setShowQuizDialog(false);
    onClose();
    navigate("/lessons-videos");
  };

  return (
    <div className="p-5 bg-light-blue rounded-[20px]">
      <QuizRenderer quiz={quiz} onComplete={handleComplete} />

      <QuizResultDialog
        isOpen={showQuizDialog}
        onClose={handleCloseDialog}
        totalQuestions={quiz.length}
        correctAnswers={quizResults.correct}
        incorrectAnswers={quizResults.incorrect}
        onGoToLessons={handleGoToLessons}
      />
    </div>
  );
};

export default LessonsQuizRenderer;