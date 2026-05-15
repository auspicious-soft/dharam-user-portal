import { ColumnDef } from "@tanstack/react-table";
import { ExamsItem } from "./exams.data";
import { Button } from "@/components/ui/button";

const isCompletedAttempt = (item: ExamsItem) => {
  const current = String(item.currentStatus ?? "").toUpperCase();
  const status = String(item.status ?? "").toUpperCase();
  return current === "COMPLETED" || status === "COMPLETED" || status === "COMPLETE";
};

export const ExamsColumns: ColumnDef<ExamsItem>[] = [
  {
    accessorKey: "examName",
    header: "Category Name",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "timeTaken",
    header: "Time Taken",
  },
  {
    accessorKey: "attemptNumber",
    header: "Attempt Number",
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => <span className="text-sm">{row.original.score}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.currentStatus || row.original.status || "-"}
      </span>
    ),
  },

  { 
    header: "Action",
    cell: ({ row }) =>
      isCompletedAttempt(row.original) ? (
        <Button
          onClick={() => (row.original)}
          className="h-[44px]"
        >
          View Report
        </Button>
      ) : null,
  },
];
