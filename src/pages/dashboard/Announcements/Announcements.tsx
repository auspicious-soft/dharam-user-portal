import { DataTable } from "@/components/tableData/DataTable";
import { announcementColumns } from "@/components/Announcements/announcements.column";
import { AnnouncementType } from "@/components/Announcements/announcement.type";
import { useEffect, useState } from "react";
import TableSearch from "@/components/reusableComponents/TableSearch";
import api from "@/lib/axios";

const Announcements = () => {
    const [data, setData] = useState<AnnouncementType[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setDebouncedSearch(searchInput);
      }, 400);

      return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
      const courseId =
        localStorage.getItem("selectedCourseId")

      const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
          const response = await api.get("/user/notifications", {
            params: {
              page: 1,
              limit: 10,
              courseId,
              search: debouncedSearch,
              type: "ANNOUNCEMENT",
            },
          });
          const items =
            (response.data as { data?: { data?: any[] } })?.data?.data ?? [];
          const mapped: AnnouncementType[] = (Array.isArray(items) ? items : [])
            .map((item: any) => {
              const sentOn = item.sentOn || item.createdAt || item.updatedAt;
              const date = sentOn
                ? new Date(sentOn).toLocaleDateString("en-GB")
                : "";

              return {
                id: item._id ?? item.id,
                date,
                subject: item.title ?? "",
                text: item.description ?? "",
                category: item.type ?? "",
                isRead: Boolean(item.isRead),
              };
            });

          setData(mapped);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch announcements", error);
          setData([]);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchAnnouncements();
    }, [debouncedSearch]);
  
    const handleMarkRead = async (id: string) => {
      const courseId =
        localStorage.getItem("selectedCourseId") 

      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );

      try {
        await api.put("/user/notifications", null, {
          params: { courseId, id },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to mark announcement as read", error);
        // revert optimistic update
        setData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isRead: false } : item
          )
        );
      }
    };
  return (
    <div className="flex flex-col gap-5 ">
      <div className="flex justify-between flex-col lg:flex-row gap-4 items-center">
        <h2 className="justify-start text-2xl font-bold w-full lg:w-auto">
         Announcements
        </h2> 

        <div className="flex flex-wrap flex-1 w-full gap-2 lg:gap-4 lg:justify-end">
          <TableSearch value={searchInput} onChange={setSearchInput} />
        </div>
      </div>
      {isLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading announcements...</div>
      ) : (
        <DataTable 
          columns={announcementColumns(handleMarkRead)}
          data={data}
          getRowClassName={(row) =>
            !row.isRead ? "bg-light-blue" : ""
          } 
        />
      )}
    </div>
  );
};

export default Announcements;
