import { useState, type MouseEvent } from "react";
import { ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { Module } from "./types";
import DomainModuleIcon from "@/assets/domain-module-icon.png";
import DomainQuestionIcon from "@/assets/domain-question-icon.png";
import { Link } from "react-router-dom";

interface Props {
  module: Module;
  defaultOpen?: boolean;
  userHasPremium: boolean;
  onBuyPremiumDomain?: (module: Module) => void;
  isPremiumPurchasing?: boolean;
  bookmarkedItems: Set<string>;
  onToggleBookmark: (id: string) => void;
}

export const DomainsModuleSection = ({
  module,
  defaultOpen = false,
  userHasPremium,
  onBuyPremiumDomain,
  isPremiumPurchasing = false,
  bookmarkedItems,
  onToggleBookmark,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  const isInactiveModule =
    String(module.status ?? "ACTIVE").toUpperCase() === "INACTIVE";
  const hasAnyUnlockedItems = module.items.some((item) => !item.isLocked);

  const moduleShortCode = module.title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handlePremiumClick = (e: MouseEvent) => {
    e.stopPropagation();
    onBuyPremiumDomain?.(module);
  };

  return (
    <div className="space-y-1.5">
      {/* MODULE HEADER */}
      <div className="flex items-center justify-between bg-light-blue rounded-lg px-3 py-2 cursor-pointer"
      onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <img src={DomainModuleIcon} alt="Domain Module" className="w-8 h-8" />

          <div className="flex flex-col gap-1">
            <h3 className="text-Black_light text-base font-semibold">
              {module.title}
            </h3>
            <p className="text-paragraph text-xs font-medium">
              {module.task} Tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isInactiveModule && (
            <button
              onClick={handlePremiumClick}
              disabled={isPremiumPurchasing}
              className="px-3 py-0 min-h-[22px] rounded-full text-[10px] font-medium
              bg-gradient-to-r from-[#ff6402] to-[#fdb22b] bg-clip-text text-transparent border border-orange-400"
            >
              {isPremiumPurchasing ? "Processing..." : "Premium"}
            </button>
          )}

          <button >
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      {/* MODULE ITEMS */}
      {open && (
        <div
          className={`rounded-lg px-3 py-2 ml-2.5 ${
            hasAnyUnlockedItems ? "bg-light-blue" : "bg-Black_light/5"
          }`}
        >
          {module.items.map((item, index) => {
            const isItemLocked =
              Boolean(item.isLocked) ||
              (Boolean(module.isPremium) && !userHasPremium && !isInactiveModule);
            const isBookmarked = bookmarkedItems.has(item.id);

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between py-2 border-b last:border-b-0
                  ${isItemLocked ? "cursor-not-allowed " : "cursor-pointer"}
                `}
              >
                <Link
                  to={isItemLocked ? "#" : `/domains-tasks/task/${item.id}`}
                  onClick={(e) => {
                    if (isItemLocked) {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center gap-3 w-full ${
                    isItemLocked ? "pointer-events-none opacity-60" : "cursor-pointer"
                  }`}
                >
                  <img
                    src={DomainQuestionIcon}
                    alt="Task"
                    className="w-8 h-8"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-paragraph font-medium">
                      {item.taskLabel ?? `${moduleShortCode} ${index + 1}`}
                    </p>
                    <h4 className="text-Black_light text-sm font-semibold whitespace-normal break-words leading-5">
                      {item.taskName ?? item.title}
                    </h4>
                  </div>
                </Link>

                  <div
                    className={`flex items-center gap-2
                    ${
                      isItemLocked
                        ? "cursor-not-allowed pointer-events-none"
                        : "cursor-pointer"
                    }`}
                  >
                <button
                  disabled={isItemLocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(item.id);
                  }}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isBookmarked
                        ? "fill-paragraph text-paragraph"
                        : "text-paragraph"
                    }`}
                  />
                </button>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
