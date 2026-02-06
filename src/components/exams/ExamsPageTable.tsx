"use client";

import { DataTable } from "@/components/tableData/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FileItem } from "./examsPage.data";

type Props = {
  data: FileItem[];
  columns: ColumnDef<FileItem>[];
};

const ExamsPageTable = ({ data, columns }: Props) => {
  return <DataTable data={data} columns={columns} />;
};

export default ExamsPageTable; 
 