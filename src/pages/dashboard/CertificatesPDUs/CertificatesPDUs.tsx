import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableSearch from "@/components/reusableComponents/TableSearch";
import { coursesCardData } from "@/components/CertificatesPDUs/CertificatesTab/coursesCard.data";
import { Button } from "@/components/ui/button";
import { Download } from "iconoir-react";

const CertificatesPDUs: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4 items-center ">
        <h2 className="justify-start text-2xl font-bold ">My Certificates</h2>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3 mt-3">
        <Select>
          <SelectTrigger className="max-w-72 py-[11px]">
            <SelectValue placeholder="Select A Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Category1">Category 1</SelectItem>
            <SelectItem value="Category2">Category 2</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 md:gap-3 items-center">
          <TableSearch />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coursesCardData.map((course) => {
          return (
            <div
              key={course.id}
              className="p-3 pb-5 rounded-lg inline-flex flex-col justify-start items-start gap-5 relative bg-[#DBE8FB]"
            >
              <Button className="transition-colors max-h-[38px] !px-4 absolute top-5 right-5">
                <Download className="w-4 h-4 transition-all " />
                Download
              </Button>
              <img
                src={course.image}
                alt="Courses"
                className="w-full rounded-sm"
              />

              <div className="flex flex-wrap items-start gap-4 w-full">
              <div className="flex flex-col gap-1 flex-1">
                <h4 className="text-Black_light text-lg font-bold capitalize">
                  {course.name}
                </h4>
                <p className="text-paragraph text-sm font-medium"> {course.dis}</p>
                </div>

                 <div className="px-[15.6px] py-2 bg-primary_blue rounded-lg flex flex-col items-center">
                <div className="text-white text-xl font-semibold">
                    {course.rank}
                  </div>
                   <div className="text-white text-sm font-medium">PDUs</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificatesPDUs;
