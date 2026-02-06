import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "iconoir-react";

export default function TableSearch() {
  return (
    <form className="relative">
      <Input
        id="search"
        type="text"
        placeholder="Search"
        name="search"
        className="pr-9 py-2 h-[44px]"
      />
      <Button
        size="icon"
        variant="ghost"
        className="text-paragraph rounded-lg absolute top-1/2 right-2 -translate-y-1/2"
      >
        <Search />
      </Button>
    </form>
  );
}
