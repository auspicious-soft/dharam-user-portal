import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { normalizeUserCourses, type UserCourse } from "@/utils/userCourses";
import {
  persistSelectedCourseAccess,
  persistSelectedCoursePurchaseAccess,
  SELECTED_COURSE_ID_KEY,
} from "@/utils/courseAccess";

const CourseSelect = () => {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [selectedId, setSelectedId] = useState(
    () => localStorage.getItem(SELECTED_COURSE_ID_KEY) ?? ""
  );
  const [isLoading, setIsLoading] = useState(true);

  const availableCourses = courses;

  const hasExpiredFreeTrial = courses.some(
    (course) =>
      String(course.status ?? "").toUpperCase() === "EXPIRED" &&
      String(course.purchaseStatus ?? "").toUpperCase() === "FREE_TRIAL"
  );

  const areAllStatusesNull =
    courses.length > 0 && courses.every((course) => course.status == null);
  const areAllPurchaseStatusesNull =
    courses.length > 0 &&
    courses.every((course) => course.purchaseStatus == null);

  const emptyCoursesMessage = hasExpiredFreeTrial
    ? "Your free trial has ended. Please purchase a plan."
    : areAllStatusesNull || areAllPurchaseStatusesNull
      ? "No course access available yet."
      : "No courses available.";

  const placeholderText = isLoading
    ? "Loading courses..."
    : availableCourses.length
      ? "Select course"
      : "No courses";

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      try {
        const response = await api.get("/user/course");
        const sorted = normalizeUserCourses(response.data);

        if (!isMounted) {
          return;
        }

        setCourses(sorted);
        setIsLoading(false);

        const selectableCourses = sorted;

        const storedId = localStorage.getItem(SELECTED_COURSE_ID_KEY) ?? "";
        const hasStored = storedId
          ? selectableCourses.some((course) => course._id === storedId)
          : false;
        const initialId = hasStored ? storedId : selectableCourses[0]?._id ?? "";
        const selectedCourse = selectableCourses.find(
          (course) => course._id === initialId
        );

        if (initialId) {
          persistSelectedCourseAccess(selectedCourse);
          if (selectedCourse) {
            persistSelectedCoursePurchaseAccess(selectedCourse);
          }

          if (initialId !== storedId) {
            localStorage.setItem(SELECTED_COURSE_ID_KEY, initialId);
            try {
              await api.get(`/user/home/${initialId}`);
            } catch (error) {
              console.error(
                "Failed to prefetch home data for default selected course",
                error
              );
            }
            if (isMounted) {
              window.dispatchEvent(new Event("courseChanged"));
              window.location.reload();
            }
            return;
          }
          setSelectedId(initialId);
          window.dispatchEvent(new Event("courseChanged"));
        } else {
          localStorage.removeItem(SELECTED_COURSE_ID_KEY);
          persistSelectedCourseAccess(null);
          persistSelectedCoursePurchaseAccess(null);
          setSelectedId("");
          window.dispatchEvent(new Event("courseChanged"));
        }
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
        }
        console.error("Failed to load courses", error);
      }
    };

    void fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = async (value: string) => {
    if (value === selectedId) {
      return;
    }

    setSelectedId(value);
    localStorage.setItem(SELECTED_COURSE_ID_KEY, value);
    const selectedCourse = courses.find((course) => course._id === value);
    persistSelectedCourseAccess(selectedCourse);
    if (selectedCourse) {
      persistSelectedCoursePurchaseAccess(selectedCourse);
    }
    try {
      await api.get(`/user/home/${value}`);
    } catch (error) {
      console.error("Failed to prefetch home data for selected course", error);
    }
    window.dispatchEvent(new Event("courseChanged"));
    window.location.reload();
  };

  return (
    <Select value={selectedId || undefined} onValueChange={handleChange}>
      <SelectTrigger className="bg-transparent border-dark-bg text-dark-bg text-[10px] md:text-xs max-w-[70%] md:max-w-72 w-full gap-6 px-3 md:px-6 py-[10px] md:py-[10px] text-left">
        <SelectValue
          placeholder={placeholderText}
          className="truncate"
        />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Loading courses...
          </div>
        ) : availableCourses.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {courses.length === 0 ? "No courses available" : emptyCoursesMessage}
          </div>
        ) : (
          availableCourses.map((course) => (
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
