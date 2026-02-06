import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
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

interface RatingsReviewsDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RatingsReviewsDialog: React.FC<RatingsReviewsDialogProps> = ({
  open,
  setOpen,
}) => {
  const [rating, setRating] = useState<number>(0);

  return (   
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-2xl md:text-3xl">
            Rate This Product
          </DialogTitle>
          <VisuallyHidden />
        </DialogHeader>

        {/* Rating Stars */}
        <div className="flex justify-center gap-2 star-custom">
          {[1, 2, 3, 4, 5].map((star) => (
            <img
              key={star}
              src={star <= rating ? StarFilled : StarEmpty}
              alt="star"
              className="w-[34px] h-[34px] cursor-pointer hover:scale-110 transition"
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4 mt-3">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="course1">Course 1</SelectItem>
              <SelectItem value="course2">Course 2</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input placeholder="Company" />
            <Input placeholder="Title" />
          </div>

          <Textarea
            placeholder="Write your feedback"
            className="min-h-[112px]"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          <Button className="rounded-full h-12 w-full">Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingsReviewsDialog;
