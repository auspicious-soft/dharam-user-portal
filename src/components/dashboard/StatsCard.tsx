import { useEffect, useMemo, useState } from "react";
import { CheckCircle, GraduationCap, Timer } from "iconoir-react";
import { BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateInput from "../reusableComponents/DateInput";

type DashboardStats = {
  inProgress?: number;
  completed?: number;
  timeSpent?: number | string;
  mockTestAvgScore?: number;
};

type StatItem = {
  id: number;
  value: number | string;
  label: string;
  icon: React.ReactNode;
};

type StatsCardProps = {
  stats?: DashboardStats | null;
  daysLeftForScheduledExam?: number | null;
  examDate?: string | null;
  onScheduleExam?: (date: string) => Promise<void>;
  isSchedulingExam?: boolean;
  onShowPlans?: () => void;
};

const formatDateForDisplay = (dateValue?: string | null) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateForInput = (dateValue?: string | null) => {
  if (!dateValue) {
    return "";
  }

  const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return dateValue;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCalendarDayDifference = (dateValue: string, todayValue: string) => {
  const dateParts = dateValue.split("-").map(Number);
  const todayParts = todayValue.split("-").map(Number);

  if (dateParts.length !== 3 || todayParts.length !== 3) {
    return null;
  }

  if (
    dateParts.some((part) => !Number.isFinite(part)) ||
    todayParts.some((part) => !Number.isFinite(part))
  ) {
    return null;
  }

  const [year, month, day] = dateParts;
  const [todayYear, todayMonth, todayDay] = todayParts;
  const dateUtc = Date.UTC(year, month - 1, day);
  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);

  return Math.round((dateUtc - todayUtc) / 86_400_000);
};

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StatsCard = ({
  stats,
  daysLeftForScheduledExam,
  examDate,
  onScheduleExam,
  isSchedulingExam = false,
  onShowPlans,
}: StatsCardProps) => {
  const [selectedDate, setSelectedDate] = useState("");

  const statsData: StatItem[] = useMemo(
    () => [
      {
        id: 1,
        value: stats?.inProgress ?? 0,
        label: "Exam In Progress",
        icon: <GraduationCap width={14} height={14} />,
      },
      {
        id: 2,
        value: stats?.completed ?? 0,
        label: "Exams Completed",
        icon: <CheckCircle width={14} height={14} />,
      },
      {
        id: 3,
        value: stats?.timeSpent ?? "0h 0m",
        label: "Time Spent Watching Lessons",
        icon: <Timer width={14} height={14} />,
      },
      {
        id: 4,
        value: Number(stats?.mockTestAvgScore ?? 0),
        label: "Mock Test Average Score ",
        icon: <BarChart2 width={14} height={14} />,
      },
    ],
    [stats],
  );

  const hasExamDate = Boolean(examDate);
  const formattedExamDate = formatDateForDisplay(examDate);
  const inputExamDate = formatDateForInput(examDate);
  const todayInputValue = getTodayInputValue();
  const calendarDaysUntilExam = inputExamDate
    ? getCalendarDayDifference(inputExamDate, todayInputValue)
    : null;
  const daysUntilExam =
    calendarDaysUntilExam ?? Number(daysLeftForScheduledExam ?? 0);
  const isExamDatePassed =
    hasExamDate &&
    (calendarDaysUntilExam !== null
      ? calendarDaysUntilExam < 0
      : Number(daysLeftForScheduledExam ?? 0) < 0);
  const isExamDay = hasExamDate && !isExamDatePassed && daysUntilExam === 0;
  const isDateUnchanged = hasExamDate && selectedDate === inputExamDate;
  const isSelectedDatePassed =
    Boolean(selectedDate) && selectedDate < todayInputValue;

  useEffect(() => {
    setSelectedDate(inputExamDate);
  }, [inputExamDate]);

  const handleScheduleExam = async () => {
    if (!selectedDate || !onScheduleExam || isSelectedDatePassed) {
      return;
    }

    await onScheduleExam(selectedDate);
    setSelectedDate("");
  };

  return (
    <div className="flex flex-col gap-3.5 mt-[-14px]">
      <div className="flex flex-col gap-3.5 ">
        {onShowPlans ? (
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onShowPlans}
              className="max-h-[44px] !px-5"
            >
              Upgrade / Buy Another Plan
            </Button>
          </div>
        ) : null}

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
          <div className="w-full col-span-2 md:col-auto md:w-auto min-w-60 px-[19px] py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-primary_blue inline-flex flex-col justify-start items-center gap-2.5 text-white-custom">
            <div className="text-[#10375c] text-2xl md:text-3xl font-bold text-center">
              {hasExamDate
                ? isExamDatePassed
                  ? "Exam date has passed"
                  : isExamDay
                    ? "It's your exam day"
                    : daysUntilExam
                : "No exam scheduled"}
            </div>
            {hasExamDate && !isExamDay && !isExamDatePassed ? (
              <div className="justify-start text-Primary-Font text-xs font-medium ">
                Days Until Exam
              </div>
            ) : null}
            {hasExamDate ? (
              <div className="flex flex-col gap-2 items-center">
                <div className="text-xs text-Primary-Font">
                  Exam Date: {formattedExamDate || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <DateInput
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    min={todayInputValue}
                    className="bg-primary_blue text-white py-2 px-4 border-0 text-xs rounded"
                  />
                  <Button
                    size="sm"
                    onClick={handleScheduleExam}
                    disabled={
                      !selectedDate ||
                      isSchedulingExam ||
                      isDateUnchanged ||
                      isSelectedDatePassed
                    }
                  >
                    {isSchedulingExam ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DateInput
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  min={todayInputValue}
                  className="bg-primary_blue text-white py-2 px-4 border-0 text-xs rounded"
                />
                <Button
                  size="sm"
                  onClick={handleScheduleExam}
                  disabled={
                    !selectedDate || isSchedulingExam || isSelectedDatePassed
                  }
                >
                  {isSchedulingExam ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
