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

/* -------------------- Types -------------------- */

type DomainScore = {
  name: string;
  percentage: number;
};

type ReportData = {
  score: number;
  timeSpent: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  domains: DomainScore[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/* -------------------- Dummy Data -------------------- */

const dummyReportData: ReportData = {
  score: 66,
  timeSpent: "04:20:16 hrs",
  correct: 16,
  incorrect: 16,
  unanswered: 16,
  domains: [
    { name: "Domain 1", percentage: 66 },
    { name: "Domain 2", percentage: 72 },
    { name: "Domain 3", percentage: 58 },
  ],
};

/* -------------------- Components -------------------- */

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

/* -------------------- Main Dialog -------------------- */

const ViewReportDialog = ({ open, onOpenChange }: Props) => {
  const report = dummyReportData;

  const total = report.correct + report.incorrect + report.unanswered;

  const correctPercent = (report.correct / total) * 100;
  const incorrectPercent = (report.incorrect / total) * 100;
  const unansweredPercent = (report.unanswered / total) * 100;

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
            You’ve Scored
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>

          <div className="text-center text-primary_heading text-3xl md:text-[50px] font-bold leading-snug">
            {report.score}%
          </div>
        </DialogHeader>

        {/* Total Time Spent */}
        <div className="px-4 py-[13px] bg-white rounded-lg flex justify-between border border-[#0a4ba8]/10">
          <p className="text-paragraph text-base font-medium">
            Total Time Spent
          </p>
          <p className="text-primary_heading text-base font-semibold">
            {report.timeSpent}
          </p>
        </div>

        {/* Progress Bar */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          <SummaryCard label="Correct" value={report.correct} color="#53A32D" />
          <SummaryCard
            label="Incorrect"
            value={report.incorrect}
            color="#ff2121"
          />
          <SummaryCard
            label="Unanswered"
            value={report.unanswered}
            color="#ffa421"
          />
        </div>

        {/* Score Breakdown */}
        <div className="p-4 lg:p-5 bg-white rounded-lg border border-[#0a4ba8]/10">
          <h3 className="text-sm font-semibold mb-2">Score Breakdown</h3>

          {report.domains.map((domain, index) => (
            <div key={index} className="flex justify-between py-2">
              <span className="text-paragraph text-base font-medium">
                {domain.name}
              </span>
              <span className="text-primary_heading text-base font-semibold">
                {domain.percentage}% Correct
              </span>
            </div>
          ))}
        </div>

        {/* Close Button */}
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
