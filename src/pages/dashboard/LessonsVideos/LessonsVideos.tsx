// LearningManagementSystem.tsx
import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { ModuleSection } from "@/components/LessonsVideos/ModuleSection";
import { ContentViewer } from "@/components/LessonsVideos/ContentViewer";
import { modules } from "@/components/LessonsVideos/mockData";
import {
  Module,
  ContentItem,
  SelectedContent,
} from "@/components/LessonsVideos/types";
import { contentIconMap } from "@/components/LessonsVideos/contentIcons";
import { Button } from "@/components/ui/button";
import { NavArrowLeft } from "iconoir-react";

const LearningManagementSystem: React.FC = () => {
  const [openModuleId, setOpenModuleId] = useState<string | null>("m1");
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  
  const [userHasPremium] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(
    new Set()
  );
  const [showBookmarks, setShowBookmarks] = useState(false);

  // ✅ NEW: Track completed content items
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Show Module 1 introduction by default on mount
  useEffect(() => {
    const firstModule = modules[0];
    if (firstModule) {
      setSelectedContent({
        type: "module",
        title: firstModule.title,
        description: firstModule.description,
      });
    }
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

  // ✅ UPDATED: mark item as completed when opened
  const handleSelectItem = (item: ContentItem) => {
    setSelectedContent(item);

    setCompletedItems((prev) => {
      const updated = new Set(prev);
      updated.add(item.id);
      return updated;
    });
  };

  const handleToggleBookmark = (itemId: string) => {
    setBookmarkedItems((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(itemId)) {
        newBookmarks.delete(itemId);
      } else {
        newBookmarks.add(itemId);
      }
      return newBookmarks;
    });
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

  // ✅ NEW: Calculate module progress (0–100)
  const getModuleProgress = (module: Module) => {
    if (!module.items.length) return 0;

    const completedCount = module.items.filter((item) =>
      completedItems.has(item.id)
    ).length;

    return Math.round((completedCount / module.items.length) * 100);
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
                  progress: getModuleProgress(module), // ✅ PASS PROGRESS
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
                 <NavArrowLeft className="w-5 h-5"/> Back to Modules
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

                      <button
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(item.id);
                        }}
                      >
                        <Bookmark className="w-4 h-4 fill-paragraph text-paragraph" />
                      </button>
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
            />
          )}
      </div>
    </div>
  );
};

export default LearningManagementSystem;
