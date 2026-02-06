import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CourseSelect = () => {
    return (
        <Select defaultValue="pmp">
          <SelectTrigger className="bg-transparent border-dark-bg text-dark-bg text-[10px] md:text-xs max-w-[70%] md:max-w-72 w-full gap-6 px-3 md:px-6 py-[10px] md:py-[10px] text-left">
            <SelectValue  className="truncate"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pmp">PMP® Online Mentoring Programs</SelectItem>
            <SelectItem value="course2">Name of The Course</SelectItem>
          </SelectContent>
        </Select>
    );
}

export default CourseSelect;
