import React, { useEffect, useMemo, useState } from "react";
import { Module, ContentItem, SelectedContent } from "@/components/examStrategy/examtypes";
import { ExamModuleSection } from "@/components/examStrategy/ExamModuleSection";
import { ExamViewer } from "@/components/examStrategy/ExamViewer";
import api from "@/lib/axios";
import { getPublicUrlForKey } from "@/utils/s3Upload";

const ExamStrategy = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const normalizeVideoUrl = useMemo(
    () => (url?: string) => {
      if (!url) return "";

      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtube.com")) {
          const id = parsed.searchParams.get("v");
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }
        if (parsed.hostname.includes("youtu.be")) {
          const id = parsed.pathname.replace("/", "");
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }
      } catch {
        return url;
      }

      return url;
    },
    [],
  );

  const resolveFileUrl = useMemo(
    () => (url?: string) => {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : getPublicUrlForKey(url);
    },
    [],
  );

  useEffect(() => {
    const courseId =
      localStorage.getItem("selectedCourseId")

    const fetchExamStrategy = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/user/exam-strategy/${courseId}`);
        const data = (response.data as { data?: any[] })?.data ?? [];
        const mapped: Module[] = (Array.isArray(data) ? data : [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((module: any) => ({
            id: module._id ?? module.id,
            title: module.name ?? "Module",
            items: (Array.isArray(module.data) ? module.data : []).map(
              (item: any) => {
                const rawType = String(item.fileType ?? "").toUpperCase();
                const type = rawType === "VIDEO" ? "video" : "pdf";
                const link = resolveFileUrl(String(item.fileLink ?? ""));
                return {
                  id: item._id ?? item.id,
                  title: item.fileName ?? "Item",
                  type,
                  pdfUrl: type === "pdf" ? link : undefined,
                  videoUrl:
                    type === "video" ? normalizeVideoUrl(link) : undefined,
                };
              },
            ),
          }));
        setModules(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch exam strategy", error);
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchExamStrategy();
  }, [normalizeVideoUrl, resolveFileUrl]);

  const handleItemClick = (item: ContentItem) => {
    const content: SelectedContent = {
      type: item.type === "pdf" ? "slide" : "video",
      title: item.title,
      pdfUrl: item.pdfUrl,
      videoUrl: item.videoUrl,
    };
    setSelectedContent(content);
    setSelectedItemId(item.id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Section - Modules */}
      <div className={`space-y-4 ${selectedContent ? 'lg:w-2/5' : 'w-full'}`}>
         <h2 className="justify-start text-2xl font-bold w-full lg:w-auto">
          Exam Strategy
        </h2>
        {isLoading ? (
          <div className="p-4 text-sm text-paragraph">
            Loading exam strategy...
          </div>
        ) : modules.length ? (
          modules.map((module, index) => (
            <ExamModuleSection
              key={module.id}
              module={module}
              defaultOpen={index === 0}
              onItemClick={handleItemClick}
              selectedItemId={selectedItemId || undefined}
            />
          ))
        ) : (
          <div className="p-4 text-sm text-paragraph">
            No exam strategy data available.
          </div>
        )}
      </div>

      {/* Right Section - Content Viewer (only shows when content is selected) */}
      {selectedContent && (
        <div className="lg:w-3/5">
          <ExamViewer
            content={selectedContent}
            onClose={() => {
              setSelectedContent(null);
              setSelectedItemId(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ExamStrategy;
