// LearningManagementSystem.tsx
import React, { useEffect, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { ModuleSection } from "@/components/LessonsVideos/ModuleSection";
import { ContentViewer } from "@/components/LessonsVideos/ContentViewer";
import {
  Module,
  ContentItem,
  SelectedContent,
} from "@/components/LessonsVideos/types";
import { contentIconMap } from "@/components/LessonsVideos/contentIcons";
import { Button } from "@/components/ui/button";
import { NavArrowLeft } from "iconoir-react";
import api from "@/lib/axios";
import { getPublicUrlForKey } from "@/utils/s3Upload";
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";

const LearningManagementSystem: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);

  const [userHasPremium] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(
    new Set()
  );
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [moduleQuiz, setModuleQuiz] = useState<Record<string, QuizQuestion[]>>(
    {}
  );
  const [attemptedQuestionsByModule, setAttemptedQuestionsByModule] = useState<
    Record<string, Set<string>>
  >({});
  const attemptedLessonsRef = useRef<Set<string>>(new Set());

  const resolveFileUrl = (url: string) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : getPublicUrlForKey(url);
  };

  const mapQuestions = (questions: any[]): QuizQuestion[] => {
    return (Array.isArray(questions) ? questions : [])
      .map((question) => {
        const type = String(question.type ?? "").toUpperCase();

        if (type === "MCQ") {
          const options = (question.mcq ?? []).map(
            (option: any, index: number) => ({
              id: String.fromCharCode(97 + index),
              text: option.text ?? "",
            })
          );
          const correctAnswers = (question.mcq ?? [])
            .map((option: any, index: number) =>
              option.isCorrect ? String.fromCharCode(97 + index) : null
            )
            .filter(Boolean) as string[];
          const maxSelection =
            typeof question.maxSelection === "number" &&
            question.maxSelection > 0
              ? question.maxSelection
              : Math.max(1, correctAnswers.length || 1);
          const correctAnswer = correctAnswers[0] ?? "a";

          return {
            id: question._id,
            type: "mcq",
            question: question.question ?? "",
            qExplanation: question.explaination ?? "",
            options,
            correctAnswer,
            correctAnswers,
            maxSelection,
            isAttempted: Boolean(question.isAttempted),
          } as QuizQuestion;
        }

        if (type === "FIB") {
          const fibItems = Array.isArray(question.fib) ? question.fib : [];
          const orderedFibItems = fibItems.filter((item: any) => {
            const order = Number(item.correctOrder);
            return Number.isFinite(order) && order > 0;
          });
          const maxSelection =
            typeof question.maxSelection === "number" &&
            question.maxSelection > 0
              ? question.maxSelection
              : Math.max(
                  1,
                  ...orderedFibItems.map((item: any) =>
                    Number(item.correctOrder) || 0
                  )
                );

          let blankIndex = 1;
          const questionTemplate = String(question.question ?? "").replace(
            /BLANK/g,
            () => `__${blankIndex++}__`
          );

          const blanks = Array.from({ length: maxSelection }, (_, index) => {
            const blankOrder = index + 1;
            const matches = orderedFibItems.filter(
              (item: any) => Number(item.correctOrder) === blankOrder
            );
            return {
              id: String(blankOrder),
              correctAnswers: matches.map((item: any) => item.answer ?? ""),
            };
          });

          return {
            id: question._id,
            type: "fillblank",
            question: question.question ?? "",
            qExplanation: question.explaination ?? "",
            questionTemplate,
            blanks,
            options: fibItems.map((blank: any) => blank.answer ?? ""),
            isAttempted: Boolean(question.isAttempted),
          } as QuizQuestion;
        }

        if (type === "DND") {
          const draggableItems = (question.dnd?.options ?? []).map(
            (option: any) => ({
              id: option.id,
              text: option.text ?? "",
            })
          );
          const dropZones = (question.dnd?.pairs ?? []).map((pair: any) => ({
            id: pair.leftId,
            label: pair.leftText ?? "",
            correctItemId: pair.rightId,
            displayText: pair.leftText ?? "",
          }));

          return {
            id: question._id,
            type: "dragdrop",
            question: question.question ?? "",
            qExplanation: question.explaination ?? "",
            draggableItems,
            dropZones,
            isAttempted: Boolean(question.isAttempted),
          } as QuizQuestion;
        }

        return null;
      })
      .filter(Boolean) as QuizQuestion[];
  };

  const fetchQuestions = async (moduleId: string) => {
    try {
      const response = await api.get(`/user/get-questions?moduleId=${moduleId}`);
      const questions = (response.data as { data?: any[] })?.data ?? [];
      const mapped = mapQuestions(questions);
      const attemptedIds = mapped
        .filter((question) => question.isAttempted)
        .map((question) => question.id);
      const availableQuestions = mapped.filter(
        (question) => !question.isAttempted
      );
      const allAttempted =
        mapped.length > 0 && availableQuestions.length === 0;

      setAttemptedQuestionsByModule((prev) => {
        const existing = prev[moduleId] ?? new Set<string>();
        const merged = new Set(existing);
        attemptedIds.forEach((id) => merged.add(id));

        setModules((prevModules) =>
          prevModules.map((module) => {
            if (module.id !== moduleId) return module;
            const totalQuestions = Math.max(
              module.questions ?? 0,
              mapped.length
            );
            if (!totalQuestions) return module;
            const progress = Math.min(
              100,
              Math.round((merged.size / totalQuestions) * 100)
            );
            return { ...module, progress };
          })
        );

        return { ...prev, [moduleId]: merged };
      });
      setModuleQuiz((prev) => ({ ...prev, [moduleId]: availableQuestions }));
      return { questions: availableQuestions, allAttempted };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch module questions", error);
      return { questions: [], allAttempted: false };
    }
  };

  useEffect(() => {
    const courseId =
      localStorage.getItem("selectedCourseId") 

    const fetchLessonsVideos = async () => {
      try {
        const response = await api.get(`/user/lessons-videos/${courseId}`);
        const data = (response.data as { data?: any[] })?.data ?? [];

        const bookmarked = new Set<string>();

        const mappedModules: Module[] = (Array.isArray(data) ? data : [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((module: any) => {
            const lessons = (module.lessons ?? [])
              .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
              .map((lesson: any) => {
                const rawType = String(lesson.fileType ?? "").toUpperCase();
                const type = rawType === "VIDEO" ? "video" : "slide";
                const resolvedUrl = resolveFileUrl(lesson.fileLink ?? "");

                if (lesson.isBookmarked) {
                  bookmarked.add(lesson._id);
                }

                return {
                  id: lesson._id,
                  title: lesson.lessonName ?? lesson.fileName ?? "Lesson",
                  duration: lesson.duration ?? "",
                  type,
                  moduleId: module._id,
                  videoUrl: type === "video" ? resolvedUrl : undefined,
                  pdfUrl: type === "slide" ? resolvedUrl : undefined,
                } as ContentItem;
              });

            if ((module.questions ?? 0) > 0) {
              lessons.push({
                id: `${module._id}-quiz`,
                title: "Questions",
                duration: `${module.questions} Questions`,
                type: "quiz",
                moduleId: module._id,
                quiz: [],
              });
            }

            const videosCount =
              typeof module.videos === "number"
                ? module.videos
                : lessons.filter((item) => item.type === "video").length;
            const slidesCount =
              typeof module.files === "number"
                ? module.files
                : lessons.filter((item) => item.type === "slide").length;

            return {
              id: module._id,
              title: (module.module ?? "Module").trim(),
              description: module.moduleIntroduction ?? "",
              videos: videosCount,
              slides: slidesCount,
              questions: module.questions ?? 0,
              isPremium: false,
              items: lessons,
              progress: module.progress ?? 0,
            } as Module;
          });

        setModules(mappedModules);
        setBookmarkedItems(bookmarked);

        const firstModule = mappedModules[0];
        if (firstModule) {
          setOpenModuleId(firstModule.id);
          setSelectedContent({
            type: "module",
            title: firstModule.title,
            description: firstModule.description,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch lessons videos", error);
      }
    };

    fetchLessonsVideos();
  }, []);

  const handleToggleModule = (moduleId: string) => {
    setOpenModuleId(openModuleId === moduleId ? null : moduleId);
  };

  const handleSelectModule = (module: Module) => {
    setSelectedContent({
      type: "module",
      title: module.title,
      description: module.description,
    });
  };

  // mark item as completed when opened
  const handleSelectItem = async (item: ContentItem) => {
    if (item.type === "quiz") {
      const existing = moduleQuiz[item.moduleId];
      let quizData = existing;
      let allAttempted = false;

      if (!quizData) {
        const result = await fetchQuestions(item.moduleId);
        quizData = result.questions;
        allAttempted = result.allAttempted;
      } else {
        const attemptedCount =
          attemptedQuestionsByModule[item.moduleId]?.size ?? 0;
        const remainingCount = quizData.length;
        const totalQuestions = Math.max(
          modules.find((module) => module.id === item.moduleId)?.questions ?? 0,
          remainingCount + attemptedCount
        );
        allAttempted = totalQuestions > 0 && attemptedCount >= totalQuestions;
      }

      setSelectedContent({
        ...item,
        quiz: quizData,
        quizAllAttempted: allAttempted,
      });
    } else {
      setSelectedContent(item);
      void markLessonAttempted(item.id);
    }
  };

  const markLessonAttempted = async (lessonId: string) => {
    if (attemptedLessonsRef.current.has(lessonId)) return;
    attemptedLessonsRef.current.add(lessonId);

    try {
      await api.post("/user/mark-attempted", {
        type: "LESSON",
        lessonId,
        isAttempted: true,
      });
    } catch (error) {
      attemptedLessonsRef.current.delete(lessonId);
      // eslint-disable-next-line no-console
      console.error("Failed to mark lesson attempted", error);
    }
  };

  const handleToggleBookmark = async (itemId: string) => {
    let nextIsBookmarked = false;

    setBookmarkedItems((prev) => {
      const newBookmarks = new Set(prev);
      nextIsBookmarked = !newBookmarks.has(itemId);
      if (nextIsBookmarked) {
        newBookmarks.add(itemId);
      } else {
        newBookmarks.delete(itemId);
      }
      return newBookmarks;
    });

    try {
      await api.post("/user/bookmark", {
        type: "LESSON",
        lessonId: itemId,
        isBookmarked: nextIsBookmarked,
      });
    } catch (error) {
      // revert optimistic update
      setBookmarkedItems((prev) => {
        const newBookmarks = new Set(prev);
        if (nextIsBookmarked) {
          newBookmarks.delete(itemId);
        } else {
          newBookmarks.add(itemId);
        }
        return newBookmarks;
      });
      // eslint-disable-next-line no-console
      console.error("Failed to update bookmark", error);
    }
  };

  const getBookmarkedItemsData = () => {
    const bookmarkedData: ContentItem[] = [];
    modules.forEach((module) => {
      module.items.forEach((item) => {
        if (bookmarkedItems.has(item.id)) {
          bookmarkedData.push(item);
        }
      });
    });
    return bookmarkedData;
  };

  const handleViewBookmarks = () => {
    setShowBookmarks(!showBookmarks);
  };

  const hasBookmarks = bookmarkedItems.size > 0;

  // Calculate module progress (0-100)
  const getModuleProgress = (module: Module) => {
    return module.progress ?? 0;
  };

  const handleQuestionAttempt = (
    moduleId: string,
    questionId: string,
    isCorrect: boolean,
  ) => {
    if (!isCorrect) return;

    setAttemptedQuestionsByModule((prev) => {
      const existing = prev[moduleId] ?? new Set<string>();
      if (existing.has(questionId)) return prev;

      const nextSet = new Set(existing);
      nextSet.add(questionId);

      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.id !== moduleId) return module;
          const availableCount = moduleQuiz[moduleId]?.length ?? 0;
          const totalQuestions = Math.max(
            module.questions ?? 0,
            availableCount + nextSet.size
          );
          if (!totalQuestions) return module;
          const progress = Math.min(
            100,
            Math.round((nextSet.size / totalQuestions) * 100)
          );
          return { ...module, progress };
        })
      );

      setModuleQuiz((prevQuiz) => {
        const current = prevQuiz[moduleId];
        if (!current) return prevQuiz;
        const filtered = current.filter((question) => question.id !== questionId);
        return { ...prevQuiz, [moduleId]: filtered };
      });

      return { ...prev, [moduleId]: nextSet };
    });
  };

  return (
    <div className="flex flex-col gap-5 ">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="justify-start text-2xl font-bold ">Lessons & Videos</h2>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleViewBookmarks}
            className={`transition-colors relative max-h-[44px] ${
              showBookmarks ? "bg-primary_heading text-white" : ""
            }`}
          >
            <Bookmark
              className={`w-4 h-4 transition-all ${
                hasBookmarks ? "fill-current" : ""
              }`}
            />
            My Bookmarks
            {hasBookmarks && (
              <span className="absolute -top-1 -right-1 bg-primary_heading text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {bookmarkedItems.size}
              </span>
            )}
          </Button>

          <Button
            variant="secondary"
            className=" bg-gradient-to-r from-[#ff6402] to-[#fdb22b] max-h-[44px] !px-5"
          >
            Get Full Access
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* LEFT PANEL */}
        <div className="space-y-2.5">
          {!showBookmarks ? (
            modules.map((module) => (
              <ModuleSection
                key={module.id}
                module={{
                  ...module,
                  progress: getModuleProgress(module),
                }}
                isOpen={openModuleId === module.id}
                onToggle={() => handleToggleModule(module.id)}
                onSelectItem={handleSelectItem}
                onSelectModule={handleSelectModule}
                userHasPremium={userHasPremium}
                selectedId={
                  selectedContent && "id" in selectedContent
                    ? selectedContent.id
                    : selectedContent?.title
                }
                bookmarkedItems={bookmarkedItems}
                onToggleBookmark={handleToggleBookmark}
              />
            ))
          ) : (
            <div className="bg-light-blue rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-Black_light">
                  My Bookmarks ({bookmarkedItems.size})
                </h2>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-primary_blue hover:text-primary_heading text-sm font-medium flex items-center gap-1"
                >
                  <NavArrowLeft className="w-5 h-5" /> Back to Modules
                </button>
              </div>

              {hasBookmarks ? (
                <div className="">
                  {getBookmarkedItemsData().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        handleSelectItem(item);
                        setShowBookmarks(false);
                      }}
                      className="flex items-center justify-between border-b border-[#dce5ed] py-2 last:border-b-0 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          {contentIconMap[item.type]}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <h3 className=" text-paragraph text-sm font-semibold">
                            {item.title}
                          </h3>
                          <p className="text-paragraph text-xs font-medium">
                            {item.duration}
                          </p>
                        </div>
                      </div>

                      {item.type !== "quiz" && (
                        <button
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(item.id);
                          }}
                        >
                          <Bookmark className="w-4 h-4 fill-paragraph text-paragraph" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No bookmarks yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        {selectedContent && (
          <ContentViewer
            content={selectedContent}
            onClose={() => setSelectedContent(null)}
            onQuestionAttempt={handleQuestionAttempt}
          />
        )}
      </div>
    </div>
  );
};

export default LearningManagementSystem;
