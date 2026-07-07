import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import SubmitIcon from "@/assets/submit.png";
import { ArrowRight } from "iconoir-react";

interface ExitExamDialogProps {
  open: boolean; 
  onClose: () => void;
  onSubmit?: () => void;
  unattemptedCount?: number;
  unattemptedQuestionNumbers?: number[];
}

export const SubmitExamDialog = ({
  open,
  onClose,
  onSubmit,
  unattemptedCount = 0,
  unattemptedQuestionNumbers = [],
}: ExitExamDialogProps) => {
  const handleSubmit = () => {
    onSubmit?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-7">
        {/* Header */}
        <DialogHeader className="items-center space-y-4 mb-4">
          <img
            src={SubmitIcon}
            alt="Submit Icon"
            className="max-w-[80px] md:max-w-[100px] m-auto"
          />

          <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
            Submit?
          </DialogTitle>

          <DialogDescription className="text-paragraph text-base font-medium text-center">
            Are you sure you want to submit the exam?
          </DialogDescription>

          {unattemptedCount > 0 ? (
            <div className="w-full rounded-[10px] border border-[#E0E0E0] bg-light-blue px-4 py-3 text-center">
              <p className="text-paragraph text-sm font-semibold">
                You have {unattemptedCount} unattempted{" "}
                {unattemptedCount === 1 ? "question" : "questions"}.
              </p>
              <p className="mt-1 text-Desc-464646 text-xs leading-5">
                Questions: {unattemptedQuestionNumbers.join(", ")}
              </p>
            </div>
          ) : null}
        </DialogHeader>

        {/* Footer */}
        <DialogFooter  className="gap-2">
          <DialogClose asChild>
            <Button className="flex-1 max-h-[44px]" variant="outline">Not Now</Button>
          </DialogClose>
          <Button className="flex-1 max-h-[44px]" onClick={handleSubmit}>
           Yes, Submit <ArrowRight />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
