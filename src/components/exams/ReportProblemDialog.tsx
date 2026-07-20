import { useEffect, useState } from "react";
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
import api from "@/lib/axios";

interface ReportProblemProps {
  open: boolean;
  onClose: () => void;
  examId?: string;
  courseId?: string;
  questionDetails?: {
    questionText?: string;
    domain?: string;
    courseName?: string;
  };
}

export const ReportProblemDialog = ({
  open,
  onClose,
  examId,
  courseId,
  questionDetails,
}: ReportProblemProps) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setComments("");
    }
  }, [open]);

  const handleReportProblem = async () => {
    if (!examId || !comments.trim()) return;

    try {
      setIsSubmitting(true);
      const storedCourseId = localStorage.getItem("selectedCourseId") ?? "";
      const questionText = questionDetails?.questionText?.trim();
      const domain = questionDetails?.domain?.trim();
      const courseName = questionDetails?.courseName?.trim();
      const questionContext = [
        questionText ? `Question: ${questionText}` : "",
        domain ? `Domain: ${domain}` : "",
        courseName ? `Course: ${courseName}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await api.post("/user/report-problem", {
        courseId: storedCourseId || courseId || "",
        type: "Mock Exam",
        relevantId: examId,
        emailSent: false,
        comments: [comments.trim(), questionContext]
          .filter(Boolean)
          .join("\n\n"),
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit report problem", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        </DialogHeader>
        <div className="mb-4 flex flex-col gap-2">
          <Label className="text-paragraph">Add Comments</Label>
          <Textarea
            placeholder="Enter Comments"
            className="min-h-[102px]"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
          />
        </div>
        {/* Footer */}
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="max-h-[44px] min-w-36">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1 max-h-[44px]"
            onClick={handleReportProblem}
            disabled={isSubmitting || !examId || !comments.trim()}
          >
            {isSubmitting ? "Reporting..." : "Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
