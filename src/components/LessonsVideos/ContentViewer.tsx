// ContentViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import { FileText, Maximize2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { SelectedContent } from "./types";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Youtube } from "iconoir-react";
import { Button } from "../ui/button";
import LessonsQuizRenderer from "./LessonsQuizRenderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Set up PDF.js worker (Vite-friendly)
pdfjs.GlobalWorkerOptions.workerSrc = PdfWorker;

interface ContentViewerProps {
  content: SelectedContent;
  onClose: () => void;
  onQuestionAttempt?: (
    moduleId: string,
    questionId: string,
    isCorrect: boolean,
  ) => void;
  onVideoProgress?: (
    lessonId: string,
    moduleId: string,
    progressPercent: number,
  ) => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  content,
  onClose,
  onQuestionAttempt,
  onVideoProgress,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [isPdfEnlarged, setIsPdfEnlarged] = useState(false);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const enlargedPdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number | null>(null);
  const [enlargedPdfWidth, setEnlargedPdfWidth] = useState<number | null>(null);
  const pdfDevicePixelRatio =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 3) : 1;
  const pdfRenderMode: "canvas" | "svg" = "canvas";
  const preventContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };
  const isDirectVideoUrl = (url?: string) =>
    Boolean(url && /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url));
  const contentResetKey = content.type === "module" ? content.title : content.id;
  const mediaResetKey =
    content.type === "video"
      ? `${content.id}-${content.videoUrl ?? ""}`
      : contentResetKey;

  useEffect(() => {
    setIsVideoLoading(true);
    setIsPdfEnlarged(false);
  }, [mediaResetKey, content.type]);

  useEffect(() => {
    if (content.type !== "video" || !videoRef.current) {
      return;
    }

    videoRef.current.pause();
    videoRef.current.load();
  }, [mediaResetKey, content.type]);

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    const element = pdfContainerRef.current;
    const updateWidth = () => {
      const nextWidth = Math.floor(element.clientWidth);
      if (nextWidth > 0) setPdfWidth(nextWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => updateWidth());
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!isPdfEnlarged || !enlargedPdfContainerRef.current) return;
    const element = enlargedPdfContainerRef.current;
    const updateWidth = () => {
      const nextWidth = Math.floor(element.clientWidth);
      if (nextWidth > 0) setEnlargedPdfWidth(nextWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => updateWidth());
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [isPdfEnlarged]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Select a module or item to view content</p>
        </div>
      </div>
    );
  }

  // Module Description View
  if (content.type === "module") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-Black_light text-xl md:text-2xl font-bold">
            {content.title}
          </h2>
        </div>
        <div
          className="justify-start text-paragraph text-sm font-medium"
          dangerouslySetInnerHTML={{ __html: content.description || "" }}
        />
      </div>
    );
  }

  // Video View
  if (content.type === "video") {
    const directVideo = isDirectVideoUrl(content.videoUrl);
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-Black_light text-xl md:text-2xl font-bold">
            {content.title}
          </h2>
        </div>
        <div className="flex-1 py-6 px-4 md:p-6 bg-[#EDF4FD] rounded-[20px] relative">
          {isVideoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#EDF4FD] rounded-[20px] z-10">
              <div className="text-center">
                <Youtube className="w-16 h-16 mx-auto mb-4 text-primary_heading animate-pulse" />
                <p className="text-paragraph">Loading Video...</p>
              </div>
            </div>
          )}
          {directVideo ? (
            <video
              key={mediaResetKey}
              ref={videoRef}
              className="w-full aspect-video rounded-[10px]"
              controls
              controlsList="nodownload"
              disablePictureInPicture
              playsInline
              preload="metadata"
              onContextMenu={preventContextMenu}
              onCanPlay={() => setIsVideoLoading(false)}
              onLoadedData={() => setIsVideoLoading(false)}
              onError={() => setIsVideoLoading(false)}
              onTimeUpdate={(event) => {
                const { currentTime, duration } = event.currentTarget;
                if (!duration || !Number.isFinite(duration) || duration <= 0) {
                  return;
                }
                const progressPercent = (currentTime / duration) * 100;
                onVideoProgress?.(content.id, content.moduleId, progressPercent);
              }}
            >
              <source src={content.videoUrl} />
            </video>
          ) : (
            <div onContextMenu={preventContextMenu}>
              <iframe
                key={mediaResetKey}
                src={content.videoUrl}
                className="w-full aspect-video rounded-[10px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsVideoLoading(false)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Slide/PDF View
  if (content.type === "slide") {
    const handlePreviousSlide = () => {
      if (currentSlideIndex > 1) {
        setCurrentSlideIndex(currentSlideIndex - 1);
      }
    };

    const handleNextSlide = () => {
      if (currentSlideIndex < numPages) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      }
    };

    const isImage =
      typeof content.pdfUrl === "string" &&
      /\.(png|jpe?g|gif|webp|svg)$/i.test(content.pdfUrl);

    const renderSlideFile = (
      width: number | null,
      imageClassName = "max-h-full max-w-full rounded-lg",
    ) => {
      if (!content.pdfUrl) {
        return (
          <div className="text-center">
            <FileText className="w-24 h-24 mx-auto mb-4 text-primary_heading" />
            <p className="text-paragraph">No PDF file available</p>
          </div>
        );
      }

      if (isImage) {
        return (
          <img
            src={content.pdfUrl}
            alt={content.title}
            className={imageClassName}
            draggable={false}
            onContextMenu={preventContextMenu}
          />
        );
      }

      return (
        <div onContextMenu={preventContextMenu}>
          <Document
            file={content.pdfUrl}
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
              pageNumber={currentSlideIndex}
              renderMode={pdfRenderMode}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              width={width ?? undefined}
              devicePixelRatio={pdfDevicePixelRatio}
            />
          </Document>
        </div>
      );
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-Black_light text-xl md:text-2xl font-bold">
            {content.title}
          </h2>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 py-6 px-4 md:p-6 bg-[#EDF4FD] rounded-[20px] overflow-hidden flex flex-col gap-5">
          {/* Navigation Controls */}
          {!isImage && (
            <div className="flex justify-between w-full gap-3 flex-wrap">
              <Button
                onClick={handlePreviousSlide}
                disabled={currentSlideIndex === 1}
                variant="link"
                className="text-primary_heading"
              >
                Previous
              </Button>
              <div className="text-center">
                <p className="text-sm font-semibold text-Black_light">
                  Slide {currentSlideIndex} of {numPages || "..."}
                </p>
              </div>

              <Button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === numPages}
                variant="link"
                className="text-primary_heading"
              >
                Next
              </Button>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPdfEnlarged(true)}
              disabled={!content.pdfUrl}
              className="rounded-[10px] h-10 !py-1 !px-4"
            >
              <Maximize2 className="w-4 h-4" />
              Enlarge
            </Button>
          </div>
          {/* PDF Display Area */}
          <div
            className="flex-1 flex items-center justify-center w-full"
            ref={pdfContainerRef}
            onContextMenu={preventContextMenu}
          >
            {renderSlideFile(pdfWidth)}
          </div>
        </div>

        <Dialog open={isPdfEnlarged} onOpenChange={setIsPdfEnlarged}>
          <DialogContent className="w-[96vw] max-w-[1200px] h-[92vh] overflow-hidden p-4 md:p-5">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-Black_light text-lg font-bold">
                {content.title}
              </DialogTitle>
            </DialogHeader>
            {!isImage && (
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <Button
                  onClick={handlePreviousSlide}
                  disabled={currentSlideIndex === 1}
                  variant="link"
                  className="text-primary_heading"
                >
                  Previous
                </Button>
                <p className="text-sm font-semibold text-Black_light">
                  Slide {currentSlideIndex} of {numPages || "..."}
                </p>
                <Button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === numPages}
                  variant="link"
                  className="text-primary_heading"
                >
                  Next
                </Button>
              </div>
            )}
            <div
              ref={enlargedPdfContainerRef}
              className="min-h-0 flex-1 overflow-auto rounded-[10px] bg-[#EDF4FD] p-3 flex justify-center"
              onContextMenu={preventContextMenu}
            >
              {renderSlideFile(
                enlargedPdfWidth,
                "max-w-full rounded-lg object-contain",
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  // Quiz View

  if (content.type === "quiz") {
    if (!content.quiz || content.quiz.length === 0) {
      return (
        <div className="p-5 bg-light-blue rounded-[20px] text-paragraph text-sm">
          {content.quizAllAttempted
            ? "You have already attempted all questions for this module."
            : "Questions are not available yet for this module."}
        </div>
      );
    }

    return (
      <LessonsQuizRenderer
        quiz={content.quiz}
        onClose={onClose}
        onQuestionAttempt={(questionId, isCorrect) =>
          onQuestionAttempt?.(content.moduleId, questionId, isCorrect)
        }
      />
    );
  }

  return null;
};
