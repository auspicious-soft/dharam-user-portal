"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/tableData/DataTable";
import { ExamsItem } from "./exams.data";
import { ColumnDef, CellContext } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import ViewReportDialog from "./ViewReportDialog";

type Props = {
  data: ExamsItem[];
  columns: ColumnDef<ExamsItem>[];
};

const ExamsTable = ({ data, columns }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamsItem | null>(null);

  // Wrap columns so we can inject onView handler
  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.header === "Action") {
        return {
          ...col,
          cell: (context: CellContext<ExamsItem, unknown>) =>
            context.row.original.status === "Completed" ? (
              <Button
                onClick={() => {
                  setSelectedExam(context.row.original);
                  setOpen(true);
                }}
                className="h-[34px] text-sm rounded-xl !px-4 !py-2"
              >
                View Report
              </Button>
            ) : null,
        };
      }
      return col;
    });
  }, [columns]);

  return (
    <>
      <DataTable data={data} columns={enhancedColumns} />

      <ViewReportDialog
        open={open}
        onOpenChange={setOpen}
        file={selectedExam}
      />
    </>
  );
};

export default ExamsTable;
