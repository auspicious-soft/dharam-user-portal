import React from "react";

interface Tab<T extends string> {
  value: T;
  label: string;
}

interface ReusableFilterTabsProps<T extends string> {
  value: T;
  onValueChange: React.Dispatch<React.SetStateAction<T>>;
  tabs: Tab<T>[];
}

const ReusableFilterTabs = <T extends string>({
  value,
  onValueChange,
  tabs,
}: ReusableFilterTabsProps<T>) => {
  return (
    <div className="flex gap-[2px] bg-primary_blue p-[2px] rounded-full">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
            value === tab.value
              ? "bg-white text-primary_blue"
              : "text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ReusableFilterTabs;
