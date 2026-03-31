import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "iconoir-react";

type TableSearchProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};

export default function TableSearch({
  value,
  onChange,
  onSubmit,
  placeholder = "Search",
}: TableSearchProps) {
  const inputProps = onChange
    ? {
        value: value ?? "",
        onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      }
    : {};

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Input
        id="search"
        type="text"
        placeholder={placeholder}
        name="search"
        className="pr-9 py-2 h-[44px]"
        {...inputProps}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="text-paragraph rounded-lg absolute top-1/2 right-2 -translate-y-1/2"
      >
        <Search />
      </Button>
    </form>
  );
}
