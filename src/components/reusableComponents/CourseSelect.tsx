import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

const STORAGE_KEY = "selectedCourseId";

type Course = {
  _id: string;
  name: string;
  order?: number | null;
};

const CourseSelect = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      try {
        const response = await api.get("/user/course");
        const data = (response.data as { data?: Course[] })?.data ?? [];
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );

        if (!isMounted) {
          return;
        }

        setCourses(sorted);
        setIsLoading(false);

        const storedId = localStorage.getItem(STORAGE_KEY) ?? "";
        const hasStored = storedId
          ? sorted.some((course) => course._id === storedId)
          : false;
        const initialId = hasStored ? storedId : sorted[0]?._id ?? "";

        if (initialId && initialId !== storedId) {
          localStorage.setItem(STORAGE_KEY, initialId);
        }

        setSelectedId(initialId);
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
        }
        // eslint-disable-next-line no-console
        console.error("Failed to load courses", error);
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (value: string) => {
    setSelectedId(value);
    localStorage.setItem(STORAGE_KEY, value);
    window.location.reload();
  };

  return (
    <Select value={selectedId || undefined} onValueChange={handleChange}>
      <SelectTrigger className="bg-transparent border-dark-bg text-dark-bg text-[10px] md:text-xs max-w-[70%] md:max-w-72 w-full gap-6 px-3 md:px-6 py-[10px] md:py-[10px] text-left">
        <SelectValue
          placeholder={isLoading ? "Loading courses..." : "Select course"}
          className="truncate"
        />
      </SelectTrigger>
      <SelectContent>
        {courses.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            No courses found
          </div>
        ) : (
          courses.map((course) => (
            <SelectItem key={course._id} value={course._id}>
              {course.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default CourseSelect;
