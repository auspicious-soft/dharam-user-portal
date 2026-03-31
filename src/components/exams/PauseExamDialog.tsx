import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import ExitExamIcon from "@/assets/exit-exam.png";
import { ArrowRight } from "iconoir-react";

interface ExitExamDialogProps {
  open: boolean; 
  onResume: () => void;
  onConfirmPause: () => void;
}

export const PauseExamDialog = ({
  open,
  onResume,
  onConfirmPause,
}: ExitExamDialogProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md rounded-2xl p-7">
        {/* Header */}
        <DialogHeader className="items-center space-y-4 mb-4">
          <img
            src={ExitExamIcon}
            alt="Exit Exam Icon"
            className="max-w-[80px] md:max-w-[100px] m-auto"
          />

          <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
           Paused
          </DialogTitle>

          <DialogDescription className="text-paragraph text-base font-medium text-center">
           You have paused your exam. Don’t worry, your progress is safe.
          </DialogDescription>
        </DialogHeader>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1 max-h-[44px]"
            onClick={onConfirmPause}
          >
            Yes, Pause
          </Button>
          <Button className="flex-1 max-h-[44px]" onClick={onResume}>
            Resume <ArrowRight />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
