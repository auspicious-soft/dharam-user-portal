import React from "react";
import ExamsTable from "../../../components/Questions/ViewReports/ExamsTabTable";
import { examsData } from "@/components/Questions/ViewReports/exams.data";
import { ExamsColumns } from "@/components/Questions/ViewReports/exams.columns";

const ViewReports = () => {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold md:leading-[46px]">
          Reports
        </h2>
      </div>
      <ExamsTable data={examsData} columns={ExamsColumns} />
    </div>
  );
};

export default ViewReports;
