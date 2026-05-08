import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import StarFilled from "@/assets/star-filled.png";
import StarEmpty from "@/assets/star-empty.png";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  normalizeUserCourses,
  type UserCourse,
} from "@/utils/userCourses";

interface RatingsReviewsDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type RatingForm = {
  courseId: string;
  company: string;
  title: string;
  feedback: string;
  stars: number;
};

const initialFormState: RatingForm = {
  courseId: "",
  company: "",
  title: "",
  feedback: "",
  stars: 0,
};

const RatingsReviewsDialog: React.FC<RatingsReviewsDialogProps> = ({
  open,
  setOpen,
}) => {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<RatingForm>(initialFormState);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const fetchCourses = async () => {
      setIsLoadingCourses(true);

      try {
        const response = await api.get("/user/course");
        const mappedCourses = normalizeUserCourses(response.data);
        const selectedCourseId =
          typeof window !== "undefined"
            ? localStorage.getItem("selectedCourseId") ?? ""
            : "";

        if (!isMounted) {
          return;
        }

        setCourses(mappedCourses);
        setForm((prev) => ({
          ...prev,
          courseId:
            prev.courseId ||
            mappedCourses.find((course) => course._id === selectedCourseId)?._id ||
            mappedCourses[0]?._id ||
            "",
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Unable to load courses.";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    };

    void fetchCourses();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setCourses([]);
      setIsLoadingCourses(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const updateField = <K extends keyof RatingForm>(
    key: K,
    value: RatingForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      courseId: form.courseId.trim(),
      company: form.company.trim(),
      title: form.title.trim(),
      feedback: form.feedback.trim(),
      stars: form.stars,
    };

    if (
      !payload.courseId ||
      !payload.company ||
      !payload.title ||
      !payload.feedback ||
      !payload.stars
    ) {
      toast.error("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/user/rating", payload);
      const message =
        (response.data as { message?: string })?.message ??
        "Rating submitted successfully.";
      toast.success(message);
      setOpen(false);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Unable to submit rating.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-2xl md:text-3xl">
            Rate This Product
          </DialogTitle>
          <VisuallyHidden />
        </DialogHeader>

        <div className="flex justify-center gap-2 star-custom">
          {[1, 2, 3, 4, 5].map((star) => (
            <img
              key={star}
              src={star <= form.stars ? StarFilled : StarEmpty}
              alt={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="h-[34px] w-[34px] cursor-pointer transition hover:scale-110"
              onClick={() => updateField("stars", star)}
            />
          ))}
        </div>

        <div className="mt-3 space-y-4">
          <Select
            value={form.courseId}
            onValueChange={(value) => updateField("courseId", value)}
            disabled={isLoadingCourses || !courses.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingCourses ? "Loading courses..." : "Select Course"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {courses.length ? (
                courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-courses" disabled>
                  No courses available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Input
              placeholder="Company"
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
            />
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </div>

          <Textarea
            placeholder="Write your feedback"
            className="min-h-[112px]"
            value={form.feedback}
            onChange={(event) => updateField("feedback", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <Button
            className="h-12 w-full rounded-full"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={isSubmitting || isLoadingCourses}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingsReviewsDialog;
