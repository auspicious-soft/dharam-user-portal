import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import DoaminResultIcon from "@/assets/doamin-result.png"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
interface QuizResultDialogProps {
  open: boolean;
  onClose: () => void;
  onGoToDomain: () => void;
}

export const DomainQuizDialog = ({
  open,

  onClose,
  onGoToDomain,
}: QuizResultDialogProps) => {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-7">
        {/* Header */}
        <DialogHeader className="items-center space-y-4 mb-4">
          <img src={DoaminResultIcon} alt="Domain Result Icon"  className="max-w-[80px] md:max-w-[100px] m-auto"/>

          <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
           Task Completed
          </DialogTitle>

          <VisuallyHidden><DialogDescription>
       
          </DialogDescription></VisuallyHidden>
        </DialogHeader>



        {/* Footer */}
        <DialogFooter>
          <Button
            onClick={onGoToDomain}
            className="w-full max-h-[44px]"
          >
            Back to Domains and Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
