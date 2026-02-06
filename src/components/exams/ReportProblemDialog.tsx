import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import UserReportIcon from "@/assets/user-report-icon.png";
import { DialogClose } from "@radix-ui/react-dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface ReportProblemProps {
  open: boolean;
  onClose: () => void;
}

export const ReportProblemDialog = ({ open, onClose }: ReportProblemProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[610px] rounded-2xl p-7">
        {/* Header */}
        <DialogHeader className="items-center space-y-4 mb-4">
          <img
            src={UserReportIcon}
            alt="User Report Icon"
            className="max-w-[80px] md:max-w-[100px] m-auto"
          />

          <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
            Report a Problem
          </DialogTitle>

          <DialogDescription className="text-paragraph text-base font-medium text-center">
            You’ll be reverted on the mail by the admin.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 flex flex-col gap-2">
          <Label className="text-paragraph">Add Comments</Label>
          <Textarea placeholder="Enter Comments" className="min-h-[102px]" />
        </div>
        {/* Footer */}
        <DialogFooter  className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="max-h-[44px] min-w-36">
              Cancel
            </Button>
          </DialogClose>
          <Button className="flex-1 max-h-[44px]">Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
