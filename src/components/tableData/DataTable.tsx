"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { ArrowSeparateVertical } from "iconoir-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
    getRowClassName?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 12,
    getRowClassName,
}: DataTableProps<TData, TValue>) {
  /* -------------------- Sorting State -------------------- */
  const [sorting, setSorting] = React.useState<SortingState>([]);

  /* -------------------- Table Instance ------------------- */
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const currentPageSize = table.getState().pagination.pageSize;
  const totalItems = data.length;
  const startItem = pageIndex * currentPageSize + 1;

  /* ---------------- Pagination Numbers ---------------- */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (pageIndex <= 2) {
        pages.push(1, 2, 3);
        pages.push("ellipsis");
        pages.push(totalPages - 1);
      } else if (pageIndex >= totalPages - 3) {
        pages.push("ellipsis");
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1
        );
      } else {
        pages.push("ellipsis");
        pages.push(pageIndex - 1, pageIndex, pageIndex + 1);
        pages.push("ellipsis");
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col rounded-md bg-white overflow-hidden w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={`text-white text-sm font-medium select-none ${
                    header.column.getCanSort()
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {header.column.getCanSort() && (
                      <span className="flex items-center text-xs">
                        {header.column.getIsSorted() === false && (
                          <ArrowSeparateVertical className="h-4 w-4 text-white/50" />
                        )}

                        {header.column.getIsSorted() === "asc" && (
                          <ArrowSeparateVertical className="h-4 w-4 text-white/50" />
                        )}

                        {header.column.getIsSorted() === "desc" && (
                          <ArrowSeparateVertical className="h-4 w-4 text-white/50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}
              className={getRowClassName?.(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ---------------- Pagination ---------------- */}
      {totalItems > pageSize && (
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-5">
          <div className="text-paragraph text-xs font-medium">
            Showing {startItem} results of {totalItems.toLocaleString()}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border-none text-paragraph text-sm font-medium"
            >
              Prev
            </Button>

            {getPageNumbers().map((page, idx) => {
              if (page === "ellipsis") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageIndex === pageNum;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(pageNum)}
                  className={`px-3 py-1 min-w-[32px] rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-[#4c8dea] text-white hover:bg-[#4c8dea]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {pageNum + 1}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border-none text-paragraph text-sm font-medium"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
