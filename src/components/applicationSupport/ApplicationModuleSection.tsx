import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Module, ContentItem } from "../applicationSupport/applicationtypes";
import { contentIconMap } from "../applicationSupport/applicationContentIcons";
import ApplicationModuleIcon from "@/assets/application-module.png";
interface Props {
  module: Module;
  defaultOpen?: boolean;
  onDeleteModule?: (id: string) => void;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onItemClick?: (item: ContentItem) => void;
  selectedItemId?: string; // Add this prop to track selected item
}

export const ApplicationModuleSection = ({
  module,
  defaultOpen = false,
  onItemClick,
  selectedItemId,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);

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
          <button className="text-gray-600">
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="pl-2.5 lg:pl-5">
        <div className="space-y-2 pl-2.5 px-2 bg-light-blue rounded-lg">
          {module.items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between border-b border-[#dce5ed] py-2 last:border-b-0 cursor-pointer px-2 rounded transition-colors ${
                  isSelected
                    ? ""
                    : ""
                }`}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <div className="flex items-center gap-[10px]">
                  {contentIconMap[item.type]}
                  <div className="flex flex-col gap-1">
                    <h3
                      className={`self-stretch justify-start text-sm font-semibold ${
                        isSelected ? "text-Black_light" : "text-paragraph"
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
