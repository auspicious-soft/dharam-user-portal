import { Input } from "@/components/ui/input";
import { Clock } from "iconoir-react";
import { useRef } from "react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TimeInput = ({ value, onChange }: TimeInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="time"
        value={value}
        onClick={() => inputRef.current?.showPicker()}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Clock Icon */}
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        onClick={() => inputRef.current?.showPicker()}
      >
        <Clock className="w-4" />
      </span>
    </div>
  );
};

export default TimeInput;
