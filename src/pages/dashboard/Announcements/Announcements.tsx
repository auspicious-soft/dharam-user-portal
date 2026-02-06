import CourseSelect from "@/components/reusableComponents/CourseSelect";
import { DataTable } from "@/components/tableData/DataTable";
import { announcementColumns } from "@/components/Announcements/announcements.column";
import { announcementTableData } from "@/components/Announcements/announcements.data";
import { useState } from "react";

const Announcements = () => {
    const [data, setData] = useState(announcementTableData);
  
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
         Announcements
        </h2> 

        <div className="flex flex-wrap flex-1 w-full gap-2 lg:gap-4 lg:justify-end">
          <CourseSelect />
        </div>
      </div>
      <DataTable 
       columns={announcementColumns(handleMarkRead)}
       data={data}
        getRowClassName={(row) =>
          !row.isRead ? "bg-light-blue" : ""
        } 
      />
    </div>
  );
};

export default Announcements;
