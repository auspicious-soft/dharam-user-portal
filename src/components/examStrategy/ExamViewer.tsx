// ContentViewer.tsx
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { SelectedContent } from "./examtypes";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Youtube } from "iconoir-react";
import { Button } from "../ui/button";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;  

interface ContentViewerProps {
  content: SelectedContent;
  onClose: () => void;
}

export const ExamViewer: React.FC<ContentViewerProps> = ({
  content,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);

  const [isVideoLoading, setIsVideoLoading] = useState(true);

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
          <div className="flex justify-between w-full">
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
          {/* PDF Display Area */}
          <div className="flex-1 flex items-center justify-center ">
            {content.pdfUrl ? (
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
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : (
              <div className="text-center">
                <FileText className="w-24 h-24 mx-auto mb-4 text-primary_heading" />
                <p className="text-paragraph">No PDF file available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
