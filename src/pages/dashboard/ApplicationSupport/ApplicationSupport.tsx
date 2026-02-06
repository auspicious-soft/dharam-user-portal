import React, { useState } from "react";
import {
  Module,
  ContentItem,
  SelectedContent,
} from "@/components/applicationSupport/applicationtypes";
import { ApplicationViewer } from "@/components/applicationSupport/ApplicationViewer";
import { ApplicationModuleSection } from "@/components/applicationSupport/ApplicationModuleSection";

const modules: Module[] = [
  {
    id: "e1",
    title: "Name Goes Here",
    items: [
      {
        id: "1",
        title: "Dummy Name of the PDF",
        type: "pdf",
        pdfUrl: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
      },
      {
        id: "2",
        title: "Dummy Name of the video",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "3",
        title: "Dummy Name of the PDF",
        type: "pdf",
        pdfUrl: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
      },
    ],
  },
  {
    id: "e2",
    title: "Name Goes Here",
    items: [
      {
        id: "1",
        title: "Dummy Name of the PDF",
        type: "pdf",
        pdfUrl: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
      },
      {
        id: "2",
        title: "Dummy Name of the video",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "3",
        title: "Dummy Name of the PDF",
        type: "pdf",
        pdfUrl: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
      },
    ],
  },
];

const ApplicationSupport = () => {
  const [selectedContent, setSelectedContent] =
    useState<SelectedContent | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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
    <div className="flex flex-col lg:flex-row gap-6 ">
      {/* Left Section - Modules */}
      <div className={`space-y-4 ${selectedContent ? "lg:w-2/5" : "w-full"}`}>
        <h2 className="justify-start text-2xl font-bold w-full lg:w-auto">
          Application Support
        </h2>
        {modules.map((module, index) => (
          <ApplicationModuleSection
            key={module.id}
            module={module}
            defaultOpen={index === 0}
            onItemClick={handleItemClick}
            selectedItemId={selectedItemId || undefined}
          />
        ))}
      </div>
      {selectedContent && (
        <div className="lg:w-3/5">
          <ApplicationViewer
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

export default ApplicationSupport;
