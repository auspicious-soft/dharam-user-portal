"use client";

import { DataTable } from "@/components/tableData/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FileItem } from "./questions.data";

type Props = {
  data: FileItem[];
  columns: ColumnDef<FileItem>[];
};

const QuestionsTable = ({ data, columns }: Props) => {
  return <DataTable data={data} columns={columns} />;
};

export default QuestionsTable; 
