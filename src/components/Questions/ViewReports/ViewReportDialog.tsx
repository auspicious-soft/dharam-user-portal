"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import ReportIcon from "@/assets/report-icon.png";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export type { ReportQuestionItem } from "./reportQuestions";

export type DomainScore = {
  name: string;
  percentage: number;
  correct: number;
  total: number;
};

export type RemarkRange = {
  start: number;
  end: number;
  remarks: string;
};

export type ReportData = {
  score: number;
  timeSpent: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  remarks?: string;
  remarkRanges?: RemarkRange[];
  domains: DomainScore[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: ReportData | null;
  isLoading?: boolean;
  showViewQuestions?: boolean;
  onViewQuestions?: () => void;
};

const SummaryCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div
    className="text-white rounded-xl px-4 py-[14px] flex justify-between items-center"
    style={{ backgroundColor: color }}
  >
    <span className="text-base font-medium">{label}</span>
    <span className="text-base font-medium">{value}</span>
  </div>
);

const ViewReportDialog = ({
  open,
  onOpenChange,
  report,
  isLoading,
  showViewQuestions = false,
  onViewQuestions,
}: Props) => {
  const total = report
    ? report.correct + report.incorrect + report.unanswered
    : 0;

  const correctPercent = total ? ((report?.correct ?? 0) / total) * 100 : 0;
  const incorrectPercent = total ? ((report?.incorrect ?? 0) / total) * 100 : 0;
  const unansweredPercent = total
    ? ((report?.unanswered ?? 0) / total) * 100
    : 0;

  const formatPercent = (value?: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return "0";
    return value % 1 === 0 ? String(value) : value.toFixed(2);
  };

  const formatDomainName = (name: string) => {
    const formattedName = name
      .replace(/^(?:\s*-\s*\d+\s*-?\s*)+/, "")
      .replace(/(?:\s*-\s*\d+\s*)+$/, "")
      .trim();

    return formattedName || name;
  };

  const overallRemark = report?.remarks?.trim() ?? "";

  const getRemarkLabel = (percentage: number) => {
    const matchedRemark = report?.remarkRanges
      ?.filter((range) => percentage >= range.start && percentage <= range.end)
      .sort((a, b) => b.start - a.start)[0];

    if (matchedRemark?.remarks) return matchedRemark.remarks;
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="gap-4">
          <img
            src={ReportIcon}
            alt="Report Icon"
            className="max-w-[80px] md:max-w-[100px] m-auto"
          />

          <DialogTitle className="text-center text-2xl lg:text-3xl font-bold">
            You've Scored
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>

          <div className="text-center text-primary_heading text-3xl md:text-[50px] font-bold leading-snug">
            {formatPercent(report?.score)}%
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="text-sm text-paragraph text-center">
            Loading report...
          </div>
        ) : null}

        <div className="px-4 py-[13px] bg-white rounded-lg flex justify-between border border-[#0a4ba8]/10">
          <p className="text-paragraph text-base font-medium">
            Total Time Spent
          </p>
          <p className="text-primary_heading text-base font-semibold">
            {report?.timeSpent ?? "-"}
          </p>
        </div>

        <div className="flex w-full h-2 rounded-full overflow-hidden gap-1">
          <div
            className="bg-[#53A32D] rounded-full"
            style={{ width: `${correctPercent}%` }}
          />
          <div
            className="bg-[#ff2121] rounded-full"
            style={{ width: `${incorrectPercent}%` }}
          />
          <div
            className="bg-[#ffa421] rounded-full"
            style={{ width: `${unansweredPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          <SummaryCard
            label="Correct"
            value={report?.correct ?? 0}
            color="#53A32D"
          />
          <SummaryCard
            label="Incorrect"
            value={report?.incorrect ?? 0}
            color="#ff2121"
          />
          <SummaryCard
            label="Unanswered"
            value={report?.unanswered ?? 0}
            color="#ffa421"
          />
        </div>

        {overallRemark ? (
          <div className="px-4 py-[13px] bg-white rounded-lg border border-[#0a4ba8]/10 flex justify-between gap-2">
            <p className="text-paragraph text-base font-medium">Overall Performance</p>
            <p className="text-primary_heading text-base font-semibold text-right">
              {overallRemark}
            </p>
          </div>
        ) : null}

        <div className="p-4 lg:p-5 bg-white rounded-lg border border-[#0a4ba8]/10">
          <h3 className="text-sm font-semibold mb-2">Score Breakdown</h3>

          {report?.domains?.length ? (
            report.domains.map((domain, index) => {
              const remarkLabel = getRemarkLabel(domain.percentage);

              return (
              <div key={index} className="flex justify-between gap-3 py-2">
                <span className="text-paragraph text-base font-medium">
                  {formatDomainName(domain.name)}
                </span>
                <div className="flex flex-wrap justify-end gap-2 text-right">
                  <span className="text-primary_heading text-base font-semibold">
                    {formatPercent(domain.percentage)}% Correct ({domain.correct}
                    /{domain.total})
                  </span>
                  {remarkLabel ? (
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#0751AB]"
                    >
                      {remarkLabel}
                    </span>
                  ) : null}
                </div>
              </div>
              );
            })
          ) : (
            <div className="text-sm text-paragraph">No breakdown available.</div>
          )}
        </div>

        {showViewQuestions ? (
          <Button
            variant="link"
            className="w-full"
            onClick={onViewQuestions}
          >
            Show Question
          </Button>
        ) : null}

        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReportDialog;
