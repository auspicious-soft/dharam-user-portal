"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/tableData/DataTable";
import { ExamsItem } from "./exams.data";
import { ColumnDef, CellContext } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import ViewReportDialog, { ReportData } from "./ViewReportDialog";

type Props = {
  data: ExamsItem[];
  columns: ColumnDef<ExamsItem>[];
  onViewReport?: (exam: ExamsItem) => void;
  reportData?: ReportData | null;
  reportLoading?: boolean;
};

const ExamsTable = ({
  data,
  columns,
  onViewReport,
  reportData,
  reportLoading,
}: Props) => {
  const [open, setOpen] = useState(false);

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
                    onViewReport?.(context.row.original);
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
  }, [columns, onViewReport]);

  return (
    <>
      <DataTable data={data} columns={enhancedColumns} />

      <ViewReportDialog
        open={open}
        onOpenChange={setOpen}
        report={reportData}
        isLoading={reportLoading}
      />
    </>
  );
};

export default ExamsTable;
