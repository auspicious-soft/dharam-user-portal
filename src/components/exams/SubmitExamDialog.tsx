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
}

export const SubmitExamDialog = ({ open, onClose }: ExitExamDialogProps) => {
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
        </DialogHeader>

        {/* Footer */}
        <DialogFooter  className="gap-2">
            <DialogClose asChild>
              <Button className="flex-1 max-h-[44px]" variant="outline">Not Now</Button>
            </DialogClose>
          <Button className="flex-1 max-h-[44px]">
           Yes, Submit <ArrowRight />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
