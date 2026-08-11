import { ColumnDef } from "@tanstack/react-table";
import { NotificationsType } from "./notifications.type";
import { Button } from "../ui/button";
import Linkify from "@/components/reusableComponents/Linkify";

export const NotificationsColumns = (
  onMarkRead: (id: string) => void
): ColumnDef<NotificationsType>[] => [ 
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
    cell: ({ row }) => <Linkify text={row.original.text} />,
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