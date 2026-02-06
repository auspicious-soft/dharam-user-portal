import { ColumnDef } from "@tanstack/react-table";
import { AnnouncementType } from "./announcement.type";
import { Button } from "../ui/button";

export const announcementColumns= (
  onMarkRead: (id: string) => void
): ColumnDef<AnnouncementType>[] => [ 
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: true, 
  },
  {
    accessorKey: "subject", 
    header: "Subject",
    enableSorting: false,
  },
  {
    accessorKey: "text",
    header: "Text", 
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    enableSorting: true,
  },
{
  header: "Action",
  cell: ({ row }) => {
    const isRead = row.original.isRead;

    return (
      <div className="">
        {!isRead ? (
          <Button
            className="max-h-[32px] !rounded-[10px] text-sm"
            onClick={() => onMarkRead(row.original.id)}
          >
            Mark as read
          </Button>
        ) : (
          <span className="block w-6" />
        )}
      </div>
    );
  },
},



];