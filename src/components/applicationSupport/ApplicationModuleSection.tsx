import { useState, type MouseEvent } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Module, ContentItem } from "../applicationSupport/applicationtypes";
import { contentIconMap } from "../applicationSupport/applicationContentIcons";
import ApplicationModuleIcon from "@/assets/application-module.png";
interface Props {
  module: Module;
  defaultOpen?: boolean;
  userHasPremium?: boolean;
  onBuyPremiumModule?: (module: Module) => void;
  isPremiumPurchasing?: boolean;
  onDeleteModule?: (id: string) => void;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onItemClick?: (item: ContentItem) => void;
  selectedItemId?: string; // Add this prop to track selected item
}

export const ApplicationModuleSection = ({
  module,
  defaultOpen = false,
  userHasPremium = false,
  onBuyPremiumModule,
  isPremiumPurchasing = false,
  onItemClick,
  selectedItemId,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const isInactiveModule =
    String(module.status ?? "ACTIVE").toUpperCase() === "INACTIVE";
  const isModuleLocked = isInactiveModule || (module.isPremium && !userHasPremium);

  const handlePremiumClick = (e: MouseEvent) => {
    e.stopPropagation();
    onBuyPremiumModule?.(module);
  };

  return (
    <div className="space-y-[6px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-light-blue rounded-lg pl-2 pr-4 py-2">
        <div
          onClick={() => setOpen(!open)}
          className="flex-1 underline-offset-1 hover:underline cursor-pointer"
        >
          <div className="flex items-center gap-[10px]">
            <img src={ApplicationModuleIcon} alt="Module icon" className="max-w-[32px]" />
            <div className="flex flex-col gap-1">
              <h3 className="self-stretch justify-start text-Black_light text-base font-semibold">
                {module.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isInactiveModule ? (
            <button
              onClick={handlePremiumClick}
              disabled={isPremiumPurchasing}
              className="px-3 py-0 min-h-[22px] rounded-full text-[10px] font-medium
              bg-gradient-to-r from-[#ff6402] to-[#fdb22b] bg-clip-text text-transparent border border-orange-400"
            >
              {isPremiumPurchasing ? "Processing..." : "Premium"}
            </button>
          ) : null}
          <button className="text-gray-600">
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="pl-2.5 lg:pl-5">
        <div
          className={`space-y-2 pl-2.5 px-2 rounded-lg ${
            isModuleLocked ? "bg-Black_light/5" : "bg-light-blue"
          }`}
        >
          {module.items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const isLocked = isModuleLocked || Boolean(item.isLocked);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between border-b border-[#dce5ed] py-2 last:border-b-0 px-2 rounded transition-colors ${
                  isLocked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? ""
                    : ""
                }`}
                onClick={() => {
                  if (!isLocked) {
                    onItemClick?.(item);
                  }
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <div className={isLocked ? "opacity-45" : ""}>
                    {contentIconMap[item.type]}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3
                      className={`self-stretch justify-start text-sm font-semibold ${
                        isLocked
                          ? "text-[#9aa8b5]"
                          : isSelected
                            ? "text-Black_light"
                            : "text-paragraph"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
};
