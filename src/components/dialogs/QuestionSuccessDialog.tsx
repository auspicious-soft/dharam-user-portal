import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface QuestionSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  buttonText?: string;
}

const QuestionSuccessDialog: React.FC<QuestionSuccessDialogProps> = ({
  open,
  onClose,
  icon,
  title,
  buttonText = "Okay",
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gap-7">
        <DialogHeader className="gap-7">
          <img
            src={icon}
            alt="Success Icon"
            className="max-w-[80px] md:max-w-[100px] m-auto"
          />
          <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl">
            {title}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onClose} className="w-full">
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSuccessDialog;
