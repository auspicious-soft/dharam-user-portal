"use client";

import { forwardRef, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type DateInputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, placeholder, disabled }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);

    const inputRef = (ref as React.MutableRefObject<HTMLInputElement>) || innerRef;

    const openPicker = () => {
      inputRef.current?.showPicker?.();
      inputRef.current?.focus();
    };

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="date"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("cursor-pointer pr-10", className)}
          onClick={openPicker}
        />

        <Calendar
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#556378]/80 cursor-pointer"
          onClick={openPicker}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;
 