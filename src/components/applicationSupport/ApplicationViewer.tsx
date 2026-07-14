// ContentViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { SelectedContent } from "./applicationtypes";
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

export const ApplicationViewer: React.FC<ContentViewerProps> = ({
  content,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number | null>(null);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const pdfDevicePixelRatio =
    typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio || 1, 2.5)
      : 1;
  const pdfRenderMode: "canvas" | "svg" = "canvas";

  useEffect(() => {
    setPdfWidth((prevWidth) => {
      if (!pdfContainerRef.current) {
        return prevWidth;
      }

      const nextWidth = Math.floor(pdfContainerRef.current.clientWidth);
      if (nextWidth <= 0) {
        return prevWidth;
      }

      if (prevWidth === nextWidth) {
        return prevWidth;
      }

      return nextWidth;
    });
  }, [content.pdfUrl, content.title, currentSlideIndex]);

  useEffect(() => {
    setCurrentSlideIndex(1);
    setNumPages(0);
    setIsPdfReady(false);
  }, [content.pdfUrl, content.title]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPdfReady(true);
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

    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-Black_light text-xl md:text-2xl font-bold">
            {content.title}
          </h2>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 py-6 px-4 md:p-6 bg-[#EDF4FD] rounded-[20px] overflow-hidden flex flex-col gap-5">
          {!isImage && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <Button
                onClick={() => setIsPdfModalOpen(true)}
                className="bg-primary_heading text-white hover:bg-primary_heading/90"
              >
                View Large
              </Button>
              <div className="text-center flex-1">
                <p className="text-sm font-semibold text-Black_light">
                  Slide {currentSlideIndex} of {numPages || "..."}
                </p>
              </div>
              <div className="flex gap-2">
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
            className="flex-1 flex items-center justify-center w-full overflow-auto min-h-0"
            ref={pdfContainerRef}
          >
            {content.pdfUrl ? (
              isImage ? (
                <img
                  src={content.pdfUrl}
                  alt={content.title}
                  className="max-h-full max-w-full rounded-lg"
                />
              ) : (
                <Document
                  file={content.pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={() => setIsPdfReady(false)}
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
                  {!isPdfReady ? (
                    <div className="flex items-center justify-center min-h-[320px]">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-primary_heading animate-pulse" />
                        <p className="text-paragraph">
                          Preparing PDF preview...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Page
                      pageNumber={currentSlideIndex}
                      renderMode={pdfRenderMode}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={pdfWidth ?? undefined}
                      devicePixelRatio={pdfDevicePixelRatio}
                    />
                  )}
                </Document>
              )
            ) : (
              <div className="text-center">
                <FileText className="w-24 h-24 mx-auto mb-4 text-primary_heading" />
                <p className="text-paragraph">No PDF file available</p>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
          <DialogContent className="max-w-7xl w-[96vw] h-[94vh] p-0 overflow-hidden bg-[#EDF4FD] flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
              <DialogTitle className="text-xl font-semibold text-Black_light">
                {content.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col flex-1 min-h-0 px-6 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                <Button
                  onClick={handlePreviousSlide}
                  disabled={currentSlideIndex === 1}
                  variant="outline"
                  className="border-primary_heading text-primary_heading"
                >
                  Previous
                </Button>
                <div className="text-center flex-1">
                  <p className="text-sm font-semibold text-Black_light">
                    Page {currentSlideIndex} of {numPages || "..."}
                  </p>
                </div>
                <Button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === numPages}
                  variant="outline"
                  className="border-primary_heading text-primary_heading"
                >
                  Next
                </Button>
              </div>

              <div className="flex-1 min-h-0 overflow-auto rounded-[16px] bg-white p-4">
                {content.pdfUrl ? (
                  isImage ? (
                    <div className="flex min-h-full items-center justify-center">
                      <img
                        src={content.pdfUrl}
                        alt={content.title}
                        className="max-h-full max-w-full rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-full items-center justify-center">
                      <Document
                        file={content.pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={() => setIsPdfReady(false)}
                        loading={
                          <div className="text-center">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-primary_heading animate-pulse" />
                            <p className="text-paragraph">Loading PDF...</p>
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
                        {!isPdfReady ? (
                          <div className="text-center">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-primary_heading animate-pulse" />
                            <p className="text-paragraph">
                              Preparing PDF preview...
                            </p>
                          </div>
                        ) : (
                          <Page
                            pageNumber={currentSlideIndex}
                            renderMode={pdfRenderMode}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={
                              typeof window !== "undefined"
                                ? Math.min(1200, window.innerWidth - 160)
                                : 1200
                            }
                            devicePixelRatio={pdfDevicePixelRatio}
                          />
                        )}
                      </Document>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <FileText className="w-24 h-24 mx-auto mb-4 text-primary_heading" />
                    <p className="text-paragraph">No PDF file available</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};
