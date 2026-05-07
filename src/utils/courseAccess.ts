import type { UserCourse } from "@/utils/userCourses";

export const SELECTED_COURSE_ID_KEY = "selectedCourseId";
export const SELECTED_COURSE_ACCESS_KEY = "selectedCourseAccess";
export const SELECTED_COURSE_PURCHASE_STATUS_KEY = "selectedCoursePurchaseStatus";
export const SELECTED_COURSE_HAS_ACCESS_KEY = "selectedCourseHasAccess";

export type CourseAccess = Pick<
  UserCourse,
  | "hasLessons"
  | "hasDomainTask"
  | "hasPracticeQuestion"
  | "hasMockExam"
  | "hasFlashCards"
  | "hasApplicationSupport"
  | "hasExamStrategy"
  | "hasCertificates"
>;

export const emptyCourseAccess: CourseAccess = {
  hasLessons: false,
  hasDomainTask: false,
  hasPracticeQuestion: false,
  hasMockExam: false,
  hasFlashCards: false,
  hasApplicationSupport: false,
  hasExamStrategy: false,
  hasCertificates: false,
};

export const toCourseAccess = (
  course?: UserCourse | null,
): CourseAccess => ({
  hasLessons: Boolean(course?.hasLessons),
  hasDomainTask: Boolean(course?.hasDomainTask),
  hasPracticeQuestion: Boolean(course?.hasPracticeQuestion),
  hasMockExam: Boolean(course?.hasMockExam),
  hasFlashCards: Boolean(course?.hasFlashCards),
  hasApplicationSupport: Boolean(course?.hasApplicationSupport),
  hasExamStrategy: Boolean(course?.hasExamStrategy),
  hasCertificates: Boolean(course?.hasCertificates),
});

export const persistSelectedCourseAccess = (course?: UserCourse | null) => {
  localStorage.setItem(
    SELECTED_COURSE_ACCESS_KEY,
    JSON.stringify(toCourseAccess(course)),
  );
};

const ALLOWED_PURCHASE_STATUSES = new Set([
  "FREE_TRIAL",
  "FREE TRIAL",
  "FREETRIAL",
  "SUBSCRIPTION",
]);

const normalizePurchaseStatus = (status?: string | null) => {
  const normalized = String(status ?? "").trim().toUpperCase();
  return normalized || null;
};

export const hasPurchasedCourseAccess = (status?: string | null) =>
  ALLOWED_PURCHASE_STATUSES.has(String(status ?? "").trim().toUpperCase());

export const persistSelectedCoursePurchaseAccess = (
  course?: UserCourse | null,
) => {
  const normalizedStatus = normalizePurchaseStatus(course?.purchaseStatus);
  localStorage.setItem(
    SELECTED_COURSE_PURCHASE_STATUS_KEY,
    normalizedStatus ?? "",
  );
  localStorage.setItem(
    SELECTED_COURSE_HAS_ACCESS_KEY,
    hasPurchasedCourseAccess(normalizedStatus) ? "true" : "false",
  );
};

export const readSelectedCourseAccess = (): CourseAccess => {
  const raw = localStorage.getItem(SELECTED_COURSE_ACCESS_KEY);
  if (!raw) {
    return emptyCourseAccess;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CourseAccess>;
    return {
      hasLessons: Boolean(parsed.hasLessons),
      hasDomainTask: Boolean(parsed.hasDomainTask),
      hasPracticeQuestion: Boolean(parsed.hasPracticeQuestion),
      hasMockExam: Boolean(parsed.hasMockExam),
      hasFlashCards: Boolean(parsed.hasFlashCards),
      hasApplicationSupport: Boolean(parsed.hasApplicationSupport),
      hasExamStrategy: Boolean(parsed.hasExamStrategy),
      hasCertificates: Boolean(parsed.hasCertificates),
    };
  } catch {
    return emptyCourseAccess;
  }
};

export const readSelectedCourseHasAccess = (): boolean => {
  const raw = localStorage.getItem(SELECTED_COURSE_HAS_ACCESS_KEY);
  if (raw != null) {
    return raw === "true";
  }

  const storedStatus = localStorage.getItem(SELECTED_COURSE_PURCHASE_STATUS_KEY);
  if (!storedStatus) {
    return true;
  }
  return hasPurchasedCourseAccess(storedStatus);
};
