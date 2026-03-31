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
  onEnd?: () => void;
}

export const ExitExamDialog = ({
  open,
  onClose,
  onEnd,
}: ExitExamDialogProps) => {
  const handleEnd = () => {
    if (onEnd) {
      onEnd();
      return;
    }
    onClose();
  };

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
            Exit Exam?
          </DialogTitle>

          <DialogDescription className="text-paragraph text-base font-medium text-center">
            Are you sure you want to exit the practice. You'll have to start
            over next time.
          </DialogDescription>
        </DialogHeader>

        {/* Footer */}
        <DialogFooter>
          <div className="flex w-full gap-3">
            <Button className="w-full max-h-[44px]" onClick={onClose}>
              Resume <ArrowRight />
            </Button>
            <Button
              variant="outline"
              className="w-full max-h-[44px]"
              onClick={handleEnd}
            >
              End Practicing
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
