// ContentViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import { FileText, Maximize2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { SelectedContent } from "./examtypes";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Youtube } from "iconoir-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// Set up PDF.js worker (Vite-friendly)
pdfjs.GlobalWorkerOptions.workerSrc = PdfWorker;

interface ContentViewerProps {
  content: SelectedContent;
  onClose: () => void;
}

export const ExamViewer: React.FC<ContentViewerProps> = ({ content }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPdfEnlarged, setIsPdfEnlarged] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const enlargedPdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number | null>(null);
  const [enlargedPdfWidth, setEnlargedPdfWidth] = useState<number | null>(null);
  const pdfDevicePixelRatio =
    typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio || 1, 2.5)
      : 1;
  const pdfRenderMode: "canvas" | "svg" = "canvas";

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
  // Video View
  if (content.type === "video") {
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
          <iframe
            src={content.videoUrl}
            className="w-full aspect-video rounded-[10px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsVideoLoading(false)}
          />
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
          />
        );
      }

      return (
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
              // style={{ filter: "contrast(1.03) saturate(1.04)" }}
            />
        </Document>
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
            <div className="flex justify-between items-center w-full">
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
              <div className="text-center">
                <p className="text-sm font-semibold text-Black_light">
                  Slide {currentSlideIndex} of {numPages || "..."}
                </p>
              </div>
              <div className="flex justify-end flex-wrap gap-2">
                <Button
                  onClick={handlePreviousSlide}
                  disabled={currentSlideIndex === 1}
                  variant="link"
                  className="text-primary_heading"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === numPages}
                  variant="link"
                  className="text-primary_heading"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* PDF Display Area */}
          <div
            className="flex-1 flex items-center justify-center w-full"
            ref={pdfContainerRef}
          >
            {renderSlideFile(pdfWidth)}
          </div>
        </div>

        <Dialog open={isPdfEnlarged} onOpenChange={setIsPdfEnlarged}>
          <DialogContent className="max-w-none w-[100vw] h-[100vh] p-0 m-0 overflow-hidden bg-[#EDF4FD] flex flex-col">
            {/* <DialogHeader className="pr-8">
              <DialogTitle className="text-Black_light text-lg font-bold">
                {content.title}
              </DialogTitle>
            </DialogHeader> */}
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

  return null;
};
