import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TaskCompletedIcon from "@/assets/task-completed.png"
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
interface QuizResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  onGoToLessons: () => void;
}

export const QuizResultDialog: React.FC<QuizResultDialogProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  onGoToLessons,
}) => {
  const scorePercentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-2xl p-7">
        {/* Header */}
        <DialogHeader className="items-center space-y-4">
          <img src={TaskCompletedIcon} alt="Task Completed Icon"  className="max-w-[80px] md:max-w-[100px] m-auto"/>

          <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
            Task Completed
          </DialogTitle>

          <DialogDescription className="text-center justify-start text-paragraph text-base">
            You have scored {scorePercentage}%.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="w-full  h-5 bg-[#dadada] rounded-[99px] overflow-hidden">
            <div
              className="h-full  bg-[#4c8dea] transition-all duration-500"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <p className="text-Black_light text-base font-semibold">Total</p>
            <p className="text-primary_blue text-base font-semibold">
              {totalQuestions}
            </p>
          </div>

          <div className="text-center">
            <p className="text-Black_light text-base font-semibold">Correct</p>
            <p className="text-[#4caf50] text-base font-semibold">
              {correctAnswers}
            </p>
          </div>

          <div className="text-center">
            <p className="text-Black_light text-base font-semibold">Incorrect</p>
            <p className="text-[#ff0000] text-base font-semibold">
              {incorrectAnswers}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            onClick={onGoToLessons}
            className="w-full max-h-[44px]"
          >
            Go to Lessons and Videos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
