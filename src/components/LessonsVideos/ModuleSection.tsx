// ModuleSection.tsx
import React from "react";
import { ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { Module, ContentItem } from "./types";
import { contentIconMap } from "./contentIcons";
import CircularProgress from "./CircularProgress";
import ModuleIcon from "@/assets/module-icon.png";

interface ModuleSectionProps {
  module: Module;
  isOpen: boolean;
  onToggle: () => void;
  onSelectItem: (item: ContentItem) => void;
  onSelectModule: (module: Module) => void;
  userHasPremium: boolean;
  selectedId: string | undefined;
  bookmarkedItems: Set<string>;
  onToggleBookmark: (itemId: string) => void;
}

export const ModuleSection: React.FC<ModuleSectionProps> = ({
  module,
  isOpen,
  onToggle,
  onSelectItem,
  onSelectModule,
  userHasPremium,
  selectedId,
  bookmarkedItems,
  onToggleBookmark,
}) => {
  const canAccessModule = !module.isPremium || userHasPremium;
  const isModuleSelected = selectedId === module.title;

  const handleModuleClick = () => {
    // Always show module introduction when clicking on module title
    onSelectModule(module);
  };

  const handleItemClick = (item: ContentItem) => {
    // Only allow clicking if user has access
    if (canAccessModule) {
      onSelectItem(item);
    }
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleBookmarkClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    onToggleBookmark(itemId);
  };

  return (
    <div className="space-y-1.5">
      <div
        className={`relative z-10 overflow-hidden flex items-center justify-between pl-2 pr-2 py-2 bg-light-blue rounded-lg transition-all  ${
          isModuleSelected ? "" : ""
        }`}
      >
        <div
          className="absolute left-0 top-0 h-full  bg-[#c5e3ff] rounded-lg transition-all duration-500"
          style={{ width: `${module.progress ?? 0}%` }}
        />
        <div
          className="flex-1 cursor-pointer relative z-10"
          onClick={handleModuleClick}
        >
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <img
                src={ModuleIcon}
                alt="Module icon"
                className="max-w-[32px] rounded-full"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-900 text-sm md:text-base font-semibold flex items-center gap-2 flex-wrap">
                  {module.title}
                </h3>
                <p className="text-paragraph text-xs font-medium">
                  • &nbsp;{module.videos} Videos &nbsp;&nbsp; •&nbsp;&nbsp;
                  {module.slides} Slides &nbsp; •&nbsp; {module.questions}{" "}
                  Questions
                </p>
              </div>
            </div>
            {module.isPremium && (
              <button
                style={{
                  background:
                    "linear-gradient(#f0f8ff, #f0f8ff) padding-box, linear-gradient(60deg, #ff6402, #fdb22b) border-box",
                  border: "1px solid transparent",
                }}
                className="px-4 py-0 min-h-[22px] rounded-[99px] text-[10px] font-medium
    bg-gradient-to-r from-[#ff6402] to-[#fdb22b] bg-clip-text text-[#ff6402]"
              >
                Premium
              </button>
            )}
            {(!module.isPremium || userHasPremium) && (
              <CircularProgress value={module.progress ?? 0} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleArrowClick}
            className="p-1 text-[#464646] transition-colors"
          >
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className={`px-2 rounded-lg ml-2.5 ${
            !canAccessModule ? "bg-Black_light/5 cursor-not-allowed" : "bg-light-blue"
          }`}
        >
          {module.items.length > 0 ? (
            module.items.map((item) => {
              const isItemLocked = !canAccessModule;
              const isItemSelected = selectedId === item.id;
              const isBookmarked = bookmarkedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center justify-between border-b border-[#dce5ed] py-2 last:border-b-0 transition-colors ${
                    isItemLocked ? "cursor-not-allowed" : "cursor-pointer"
                  } ${isItemSelected ? "" : ""}`}
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

                  <div
                    className={`flex items-center gap-2
                    ${
                      isItemLocked
                        ? "cursor-not-allowed pointer-events-none"
                        : "cursor-pointer"
                    } ${isItemSelected ? "" : ""}`}
                  >
                    <button
                      className="p-2 hover:bg-gray-100 transition-colors"
                      onClick={(e) => handleBookmarkClick(e, item.id)}
                    >
                      <Bookmark
                        className={`w-4 h-4 transition-colors ${
                          isBookmarked
                            ? "fill-paragraph text-paragraph"
                            : "text-paragraph"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-paragraph text-base">
              No items available in this module
            </div>
          )}
        </div>
      )}
    </div>
  );
};
