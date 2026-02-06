import { CheckCircle, GraduationCap, Timer } from "iconoir-react";
import { BarChart2 } from "lucide-react";
import DateInput from "../reusableComponents/DateInput";
type StatItem = {
  id: number;
  value: number | string;
  label: string;
  icon: React.ReactNode;
};

const statsData: StatItem[] = [
  {
    id: 1,
    value: 7,
    label: "In Progress",
    icon: <GraduationCap width={14} height={14} />,
  },
  {
    id: 2,
    value: 4,
    label: "Completed",
    icon: <CheckCircle width={14} height={14} />,
  },
  {
    id: 3,
    value: "01:24 hr",
    label: "Time Spent Learning",
    icon: <Timer width={14} height={14} />,
  },
  {
    id: 4,
    value: 58,
    label: "Mock Test Average Score ",
    icon: <BarChart2 width={14} height={14} />,
  },
];

const StatsCard = () => {
  return (
    <div className="flex flex-col gap-3.5 mt-[-14px]">
      <div className="flex flex-col gap-3.5 ">
        {/* Stats */}
        <div className=" grid grid-cols-2 md:grid-cols-3 gap-4 lg:flex lg:justify-between items-center">
          {statsData.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 ">
              <div className="flex items-center gap-2 md:gap-5">
                {/* Icon */}
                <div className="w-6 h-6 relative bg-primary_blue rounded-[5px] text-white flex items-center justify-center">
                  {item.icon}
                </div>

                {/* Value */}
                <div className="text-[#10375c] text-2xl md:text-3xl font-bold">
                  {item.value}
                </div>
              </div>

              {/* Label */}
              <div className="text-Primary-Font text-xs font-medium">
                {item.label}
              </div>
            </div>
          ))}
          <div className="w-full col-span-2 md:col-auto md:w-auto min-w-52 px-[19px] py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-primary_blue inline-flex flex-col justify-start items-center gap-2.5 text-white-custom">
            <div className="text-[#10375c] text-2xl md:text-3xl font-bold ">
              120
            </div>
            <div className="justify-start text-Primary-Font text-xs font-medium ">
              Days Until Exam
            </div>
            <DateInput className="bg-primary_blue text-white py-2 px-4 border-0 text-xs rounded " />
          </div>
        </div> 
      </div>
    </div>
  );
};

export default StatsCard;
