import { useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type AccessOption = {
  value: string;
  label: string;
};

const DEFAULT_ACCESS_OPTIONS: AccessOption[] = [
  { value: "LESSONS", label: "Lessons" },
  { value: "DOMAIN_TASK", label: "Domain Tasks" },
  { value: "PRACTICE_TEST", label: "Practice Questions" },
  { value: "MOCK_EXAM", label: "Mock Exams" },
  { value: "FLASH_CARDS", label: "Flash Cards" },
  { value: "APPLICATION_SUPPORT", label: "Application Support" },
  { value: "EXAM_STRATEGY", label: "Exam Strategy" },
  { value: "CERTIFICATES_PDUS", label: "Certificates / PDUs" },
];

interface AccessMultiSelectProps {
  selectedAccesses: string[];
  onChange: (next: string[]) => void;
  options?: AccessOption[];
  placeholder?: string;
}

const normalizeAccessValue = (value: string) =>
  value.trim().toUpperCase().replace(/\s+/g, "_");

const AccessMultiSelect = ({
  selectedAccesses,
  onChange,
  options = DEFAULT_ACCESS_OPTIONS,
  placeholder = "Select access",
}: AccessMultiSelectProps) => {
  const selectedSet = useMemo(
    () => new Set(selectedAccesses.map(normalizeAccessValue)),
    [selectedAccesses]
  );

  const selectedOptionLabels = useMemo(() => {
    return options
      .filter((option) => selectedSet.has(normalizeAccessValue(option.value)))
      .map((option) => option.label);
  }, [options, selectedSet]);

  const handleToggle = (value: string) => {
    const normalized = normalizeAccessValue(value);
    if (selectedSet.has(normalized)) {
      onChange(
        selectedAccesses.filter(
          (selected) => normalizeAccessValue(selected) !== normalized
        )
      );
      return;
    }
    onChange([...selectedAccesses, normalized]);
  };

  return (
    <div className="w-full space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal h-11"
          >
            <span className="truncate text-left">
              {selectedAccesses.length
                ? `${selectedAccesses.length} access selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {options.map((option) => {
              const checked = selectedSet.has(normalizeAccessValue(option.value));
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                  {checked ? <Check className="h-3.5 w-3.5 ml-auto text-primary" /> : null}
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <div
        className={cn(
          "min-h-11 rounded-md border bg-white px-2 py-2",
          "max-h-24 overflow-y-auto"
        )}
      >
        {selectedOptionLabels.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedOptionLabels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No access selected.</p>
        )}
      </div>
    </div>
  );
};

export default AccessMultiSelect;
