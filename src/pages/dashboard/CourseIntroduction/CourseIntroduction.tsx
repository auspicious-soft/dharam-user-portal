import React, { useEffect, useRef, useState } from "react";
import SectionRenderer from "@/components/CourseIntroduction/SectionRenderer";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { getPublicUrlForKey } from "@/utils/s3Upload";
import { Document, Page, pdfjs } from "react-pdf";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { FileText } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

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
  items: ResourceItem[];
};

type Section = BulletSection | AccordionSection | CardsSection | LinksSection;

type ResourceItem = {
  label: string;
  url: string;
  fileType?: string;
};

type ValuePointer = {
  value?: string;
};

type AccordionPointer = {
  title?: string;
  description?: string;
};

type UploadFileItem = {
  nameOfFile?: string;
  url?: string;
  fileType?: string;
  type?: string;
};

type CourseIntroResponseData = {
  section_1?: { title?: string; pointers?: ValuePointer[] };
  section_2?: { title?: string; pointers?: ValuePointer[] };
  accordion_1?: { title?: string; pointers?: AccordionPointer[] };
  accordion_2?: { title?: string; pointers?: AccordionPointer[] };
  uploadFiles?: { title?: string; files?: UploadFileItem[] };
  courseId?: { name?: string };
  description?: string;
};

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

type ResourcePreviewType = "pdf" | "video" | "unsupported";

const resolveFileUrl = (url: string) => {
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return getPublicUrlForKey(url);
};
pdfjs.GlobalWorkerOptions.workerSrc = PdfWorker;

const PDF_REGEX = /\.pdf(\?|#|$)/i;
const DIRECT_VIDEO_REGEX = /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?|#|$)/i;
const VIDEO_PROVIDER_REGEX = /(youtube\.com|youtu\.be|vimeo\.com)/i;
const PDF_CONTENT_TYPE_REGEX = /application\/pdf/i;
const PDF_WORD_REGEX = /\bpdf\b/i;

const getPreviewType = (item: ResourceItem): ResourcePreviewType => {
  const decodedUrl = decodeURIComponent(item.url ?? "");
  const label = item.label ?? "";

  // Prefer strong PDF signals first so mislabeled backend "Video" still opens as PDF.
  if (
    PDF_REGEX.test(item.url) ||
    PDF_CONTENT_TYPE_REGEX.test(decodedUrl) ||
    PDF_WORD_REGEX.test(label)
  ) {
    return "pdf";
  }
  if (
    DIRECT_VIDEO_REGEX.test(item.url) ||
    VIDEO_PROVIDER_REGEX.test(item.url)
  ) {
    return "video";
  }

  const normalizedFileType = String(item.fileType ?? "")
    .trim()
    .toUpperCase();
  if (normalizedFileType === "PDF") {
    return "pdf";
  }
  if (normalizedFileType === "VIDEO") {
    return "video";
  }

  return "unsupported";
};

const isDirectVideoUrl = (url: string) => DIRECT_VIDEO_REGEX.test(url);

const getVideoIframeUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return rawUrl;
      }
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : rawUrl;
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
};

/* ------------------ COMPONENT ------------------ */

const CourseIntroduction = () => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfWidth, setPdfWidth] = useState<number | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfDevicePixelRatio =
    typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio || 1, 3)
      : 1;
  const pdfRenderMode: "canvas" | "svg" = "canvas";

  const selectedResourceType = selectedResource
    ? getPreviewType(selectedResource)
    : null;

  useEffect(() => {
    if (!selectedResource || selectedResourceType !== "pdf") {
      return;
    }

    if (!pdfContainerRef.current) {
      return;
    }

    const element = pdfContainerRef.current;
    const updateWidth = () => {
      const nextWidth = Math.floor(element.clientWidth);
      if (nextWidth > 0) {
        setPdfWidth(nextWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [selectedResource, selectedResourceType]);

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");

    const fetchCourseIntro = async () => {
      try {
        const response = await api.get(`/user/course-intro/${courseId}`);
        const data =
          (response.data as { data?: CourseIntroResponseData })?.data ?? {};

        const sections: Section[] = [];

        if (data.section_1?.pointers?.length) {
          sections.push({
            id: "section_1",
            type: "cards",
            title: data.section_1.title ?? "Section 1",
            items: data.section_1.pointers
              .map((item) => item.value)
              .filter((item): item is string => Boolean(item)),
          });
        }

        if (data.section_2?.pointers?.length) {
          sections.push({
            id: "section_2",
            type: "cards",
            title: data.section_2.title ?? "Section 2",
            items: data.section_2.pointers
              .map((item) => item.value)
              .filter((item): item is string => Boolean(item)),
          });
        }

        if (data.accordion_1?.pointers?.length) {
          sections.push({
            id: "accordion_1",
            type: "accordion",
            title: data.accordion_1.title ?? "Accordion 1",
            items: data.accordion_1.pointers
              .map((item) => ({
                title: item.title ?? "",
                content: item.description ?? "",
              }))
              .filter(
                (item: { title: string; content: string }) =>
                  item.title || item.content,
              ),
          });
        }

        if (data.accordion_2?.pointers?.length) {
          sections.push({
            id: "accordion_2",
            type: "accordion",
            title: data.accordion_2.title ?? "Accordion 2",
            items: data.accordion_2.pointers
              .map((item) => ({
                title: item.title ?? "",
                content: item.description ?? "",
              }))
              .filter(
                (item: { title: string; content: string }) =>
                  item.title || item.content,
              ),
          });
        }

        if (data.uploadFiles?.files?.length) {
          sections.push({
            id: "upload_files",
            type: "links",
            title: data.uploadFiles.title ?? "Resources",
            items: data.uploadFiles.files
              .map((file) => {
                const resolvedUrl = resolveFileUrl(file.url ?? "");
                if (!resolvedUrl) {
                  return null;
                }
                return {
                  label: file.nameOfFile ?? "File",
                  url: resolvedUrl,
                  fileType: file.fileType ?? file.type,
                };
              })
              .filter((item): item is ResourceItem => Boolean(item)),
          });
        }

        setCourse({
          title: data.courseId?.name ?? "Course Introduction",
          description: data.description ?? "",
          sections,
        });
      } catch (error) {
        console.error("Failed to fetch course intro", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseIntro();
  }, []);

  const handleOpenResource = (item: ResourceItem) => {
    setSelectedResource(item);
    setCurrentPage(1);
    setNumPages(0);
  };

  const onDocumentLoadSuccess = ({
    numPages: loadedPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(loadedPages);
    setCurrentPage(1);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-7">
          {isLoading ? (
            <div className="rounded-[20px] bg-[#EDF4FD] p-6 text-center text-sm text-paragraph">
              Loading course introduction...
            </div>
          ) : course.sections.length === 0 ? (
            <div className="rounded-[20px] bg-[#EDF4FD] p-6 text-center text-sm text-paragraph">
              No course introduction content is available at the moment.
            </div>
          ) : (
            course.sections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                onLinkClick={
                  section.type === "links" ? handleOpenResource : undefined
                }
              />
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="h-full flex flex-col">
          {selectedResource ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-Black_light text-xl md:text-2xl font-bold pr-4">
                  {selectedResource.label}
                </h2>
                <Button
                  variant="link"
                  className="text-primary_heading"
                  onClick={() => setSelectedResource(null)}
                >
                  Close
                </Button>
              </div>

              <div className="flex-1 py-6 px-4 md:p-6 bg-[#EDF4FD] rounded-[20px] overflow-hidden flex flex-col gap-5 min-h-[500px]">
                {selectedResourceType === "video" && (
                  <div className="w-full h-full flex items-center justify-center">
                    {isDirectVideoUrl(selectedResource.url) ? (
                      <video
                        src={selectedResource.url}
                        controls
                        className="w-full aspect-video rounded-[10px]"
                      />
                    ) : (
                      <iframe
                        src={getVideoIframeUrl(selectedResource.url)}
                        title={selectedResource.label}
                        className="w-full aspect-video rounded-[10px]"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                )}

                {selectedResourceType === "pdf" && (
                  <>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="link"
                        className="text-primary_heading"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <p className="text-sm font-semibold text-Black_light">
                        Slide {currentPage} of {numPages || "..."}
                      </p>
                      <Button
                        variant="link"
                        className="text-primary_heading"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(numPages, prev + 1))
                        }
                        disabled={numPages === 0 || currentPage === numPages}
                      >
                        Next
                      </Button>
                    </div>

                    <div
                      className="flex-1 flex items-center justify-center w-full"
                      ref={pdfContainerRef}
                    >
                      <Document
                        file={selectedResource.url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <FileText className="w-16 h-16 mx-auto mb-4 text-primary_heading animate-pulse" />
                              <p className="text-paragraph">Loading PDF...</p>
                            </div>
                          </div>
                        }
                        error={
                          <div className="text-center text-red-600">
                            <p>Failed to load PDF</p>
                            <p className="text-sm text-paragraph mt-2">
                              Please check the file path or URL
                            </p>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={currentPage}
                          renderMode={pdfRenderMode}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          width={pdfWidth ?? undefined}
                          devicePixelRatio={pdfDevicePixelRatio}
                        />
                      </Document>
                    </div>
                  </>
                )}

                {selectedResourceType === "unsupported" && (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm text-paragraph">
                      This file type is not supported in the in-app preview.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : course.sections.length > 0 ? (
            <div className="flex-1 min-h-[220px] bg-[#EDF4FD] rounded-[20px] flex items-center justify-center px-4">
              <p className="text-sm text-paragraph text-center">
                Select a file from Course Material to preview it here.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CourseIntroduction;
