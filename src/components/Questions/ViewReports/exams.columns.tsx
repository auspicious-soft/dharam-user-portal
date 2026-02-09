import { ColumnDef } from "@tanstack/react-table";
import { ExamsItem } from "./exams.data";
import { Button } from "@/components/ui/button";

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
cell: ({ row }) => {
  const { score, status } = row.original;
  const isCompleted = status === "Completed";

  return (
    <div className="flex gap-5 items-center">
      <span className="text-sm">{score}</span>
      <span
        className={`text-sm font-medium italic ${
          isCompleted ? "text-[#6aa56d]" : "text-[#d25a5a]"
        }`}
      >
        {status}
      </span>
    </div>
  );
},
},

  { 
    header: "Action",
    cell: ({ row }) =>
      row.original.status === "Completed" ? (
        <Button
          onClick={() => (row.original)}
          className="h-[44px]"
        >
          View Report
        </Button>
      ) : null,
  },
];
