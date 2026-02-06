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
  onClose: () => void;
}

export const PauseExamDialog = ({ open, onClose }: ExitExamDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        <DialogFooter>
          <Button className="flex-1 max-h-[44px]">
           Resume <ArrowRight />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
