import React, { useEffect, useState } from "react";
import SectionRenderer from "@/components/CourseIntroduction/SectionRenderer";
import api from "@/lib/axios";
import { getPublicUrlForKey } from "@/utils/s3Upload";

// ---------------- TYPES ----------------
type BulletSection = {
  id: string;
  type: "bullets";
  title: string;
  items: { description: string }[];
};

type AccordionSection = {
  id: string;
  type: "accordion";
  title: string;
  items: { title: string; content: string }[];
};

type CardsSection = {
  id: string;
  type: "cards";
  title: string;
  items: string[];
};

type LinksSection = {
  id: string;
  type: "links";
  title: string;
  items: { label: string; url: string }[];
};

type Section = BulletSection | AccordionSection | CardsSection | LinksSection;

type Course = {
  title: string;
  description: string;
  sections: Section[];
};

const defaultCourse: Course = {
  title: "",
  description: "",
  sections: [],
};

const resolveFileUrl = (url: string) => {
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return getPublicUrlForKey(url);
};

/* ------------------ COMPONENT ------------------ */

const CourseIntroduction = () => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const courseId =
      localStorage.getItem("selectedCourseId")

    const fetchCourseIntro = async () => {
      try {
        const response = await api.get(`/user/course-intro/${courseId}`);
        const data = (response.data as { data?: any })?.data ?? {};

        const sections: Section[] = [];

        if (data.section_1?.pointers?.length) {
          sections.push({
            id: "section_1",
            type: "cards",
            title: data.section_1.title ?? "Section 1",
            items: data.section_1.pointers
              .map((item: { value?: string }) => item.value)
              .filter(Boolean),
          });
        }

        if (data.section_2?.pointers?.length) {
          sections.push({
            id: "section_2",
            type: "cards",
            title: data.section_2.title ?? "Section 2",
            items: data.section_2.pointers
              .map((item: { value?: string }) => item.value)
              .filter(Boolean),
          });
        }

        if (data.accordion_1?.pointers?.length) {
          sections.push({
            id: "accordion_1",
            type: "accordion",
            title: data.accordion_1.title ?? "Accordion 1",
            items: data.accordion_1.pointers
              .map((item: { title?: string; description?: string }) => ({
                title: item.title ?? "",
                content: item.description ?? "",
              }))
              .filter((item: { title: string; content: string }) =>
                item.title || item.content
              ),
          });
        }

        if (data.accordion_2?.pointers?.length) {
          sections.push({
            id: "accordion_2",
            type: "accordion",
            title: data.accordion_2.title ?? "Accordion 2",
            items: data.accordion_2.pointers
              .map((item: { title?: string; description?: string }) => ({
                title: item.title ?? "",
                content: item.description ?? "",
              }))
              .filter((item: { title: string; content: string }) =>
                item.title || item.content
              ),
          });
        }

        if (data.uploadFiles?.files?.length) {
          sections.push({
            id: "upload_files",
            type: "links",
            title: data.uploadFiles.title ?? "Resources",
            items: data.uploadFiles.files
              .map((file: { nameOfFile?: string; url?: string }) => {
                const resolvedUrl = resolveFileUrl(file.url ?? "");
                if (!resolvedUrl) {
                  return null;
                }
                return {
                  label: file.nameOfFile ?? "File",
                  url: resolvedUrl,
                };
              })
              .filter(Boolean),
          });
        }

        setCourse({
          title: data.courseId?.name ?? "Course Introduction",
          description: data.description ?? "",
          sections,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch course intro", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseIntro();
  }, []);

  return (
    <div className="flex flex-col gap-7">
      {/* ---------- COURSE INFO ---------- */}
      <div className="flex justify-between gap-4 items-start">
        <div className="flex-1 space-y-3 items-start ">
          <h3 className="text-Black_light text-xl md:text-2xl  font-bold">
            {isLoading ? "Loading..." : course.title}
          </h3>
          <p className="text-paragraph text-sm">{course.description}</p>
        </div>
      </div>

      {/* ---------- ALL SECTIONS (DYNAMIC) ---------- */}
      <div className="flex flex-col gap-7">
        {course.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

export default CourseIntroduction;
