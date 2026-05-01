export type UserCourse = {
  _id: string;
  name: string;
  order: number;
  status?: string | null;
  purchaseStatus?: string | null;
  daysLeft?: number | null;
};

type RawCourse = {
  _id?: string | null;
  id?: string | null;
  name?: string | null;
  title?: string | null;
  order?: number | string | null;
  status?: string | null;
  purchaseStatus?: string | null;
  daysLeft?: number | string | null;
  courseId?: RawCourse | null;
  course?: RawCourse | null;
};

const readCourseArray = (payload: unknown): RawCourse[] => {
  const unwrapped = (payload as { data?: unknown })?.data ?? payload;

  if (Array.isArray(unwrapped)) {
    return unwrapped as RawCourse[];
  }

  if (unwrapped && typeof unwrapped === "object") {
    const container = unwrapped as {
      courses?: unknown;
      list?: unknown;
      rows?: unknown;
      items?: unknown;
    };
    const candidate =
      container.courses ?? container.list ?? container.rows ?? container.items;

    if (Array.isArray(candidate)) {
      return candidate as RawCourse[];
    }
  }

  return [];
};

const pickText = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const pickNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeUserCourses = (payload: unknown): UserCourse[] => {
  const rawCourses = readCourseArray(payload);
  const mapped = rawCourses
    .map((item, index) => {
      const nested = item.courseId ?? item.course ?? item;
      const id = pickText(nested?._id, nested?.id, item._id, item.id);
      if (!id) {
        return null;
      }

      return {
        _id: id,
        name:
          pickText(nested?.name, nested?.title, item.name, item.title) ||
          `Course ${index + 1}`,
        order: pickNumber(nested?.order ?? item.order, Number.MAX_SAFE_INTEGER),
        status: item.status ?? nested?.status ?? null,
        purchaseStatus: item.purchaseStatus ?? nested?.purchaseStatus ?? null,
        daysLeft: pickNumber(item.daysLeft ?? nested?.daysLeft, 0),
      } satisfies UserCourse;
    })
    .filter((course): course is UserCourse => Boolean(course));

  const dedupedById = new Map<string, UserCourse>();
  mapped.forEach((course) => {
    if (!dedupedById.has(course._id)) {
      dedupedById.set(course._id, course);
    }
  });

  return [...dedupedById.values()].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name),
  );
};
