import { DataTable } from "@/components/tableData/DataTable";
import { NotificationsColumns } from "@/components/notifications/notifications.column";
import { NotificationsTableData } from "@/components/notifications/notifications.data";
import { useState } from "react";
import TableSearch from "@/components/reusableComponents/TableSearch";

const Notifications = () => {

  const [data, setData] = useState(NotificationsTableData);

  const handleMarkRead = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };
  return (
    <div className="flex flex-col gap-5 ">
       <div className="flex justify-between flex-col lg:flex-row gap-4 items-center">
        <h2 className="justify-start text-2xl font-bold w-full lg:w-auto">
         Notifications
        </h2>  

        <div className="flex flex-wrap flex-1 w-full gap-2 lg:gap-4 lg:justify-end">
           <TableSearch />
        </div>
      </div>
     <DataTable
        columns={NotificationsColumns(handleMarkRead)}
        data={data}
        getRowClassName={(row) =>
          !row.isRead ? "bg-light-blue" : ""
        } 
      />
    </div>
  );
};

export default Notifications;
