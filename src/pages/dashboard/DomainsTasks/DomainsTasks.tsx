import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Module } from "@/components/DomainsTasks/types";
import { DomainsModuleSection } from "@/components/DomainsTasks/DomainsModuleSection";
import { NavArrowLeft } from "iconoir-react";
import DomainQuestionIcon from "@/assets/domain-question-icon.png";
import { Link } from "react-router-dom";
import api from "@/lib/axios";

const DomainsTasks = () => {
  const [userHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const [bookmarkedItems, setBookmarkedItems] = React.useState<Set<string>>(
    new Set()
  );

  const toggleBookmark = async (itemId: string) => {
    let nextIsBookmarked = false;

    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      nextIsBookmarked = !next.has(itemId);
      if (nextIsBookmarked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });

    try {
      await api.post("/user/bookmark", {
        type: "TASK",
        taskId: itemId,
        isBookmarked: nextIsBookmarked,
      });
    } catch (error) {
      setBookmarkedItems((prev) => {
        const next = new Set(prev);
        if (nextIsBookmarked) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
      // eslint-disable-next-line no-console
      console.error("Failed to update task bookmark", error);
    }
  };

  const [showBookmarks, setShowBookmarks] = React.useState(false);

  const hasBookmarks = bookmarkedItems.size > 0;

  const getBookmarkedItemsData = () => {
    const data: {
      id: string;
      title: string;
      taskLabel?: string;
      taskName?: string;
      moduleTitle: string;
    }[] = [];

    modules.forEach((module) => {
      module.items.forEach((item) => {
        if (bookmarkedItems.has(item.id)) {
          data.push({
            id: item.id,
            title: item.title,
            taskLabel: item.taskLabel,
            taskName: item.taskName,
            moduleTitle: module.title,
          });
        }
      });
    });

    return data;
  };

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");
    if (!courseId) return;

    const fetchDomainsTasks = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/user/domain-tasks/${courseId}`);
        const data = (response.data as { data?: any[] })?.data ?? [];

        const nextBookmarkedItems = new Set<string>();
        const mappedModules: Module[] = (Array.isArray(data) ? data : []).map(
          (module: any) => {
            const rawItems =
              (Array.isArray(module.tasks) && module.tasks) ||
              (Array.isArray(module.items) && module.items) ||
              (Array.isArray(module.domainTasks) && module.domainTasks) ||
              (Array.isArray(module.taskList) && module.taskList) ||
              [];

            const items = rawItems
              .filter(
                (item: any) =>
                  !item.status || String(item.status).toUpperCase() === "ACTIVE"
              )
              .map((item: any, index: number) => {
                const id =
                  item._id ??
                  item.id ??
                  item.taskId ??
                  `${module._id}-${index}`;

                if (item.isBookmarked) {
                  nextBookmarkedItems.add(String(id));
                }

                return {
                  id,
                  title:
                    item.taskName ??
                    item.taskLabel ??
                    item.title ??
                    item.task ??
                    item.name ??
                    "Task",
                  taskLabel: item.taskLabel ?? undefined,
                  taskName: item.taskName ?? undefined,
                  isPremium: item.isPremium ?? false,
                };
              });

            const taskCount =
              typeof module.task === "number"
                ? module.task
                : typeof module.tasks === "number"
                ? module.tasks
                : typeof module.totalTasks === "number"
                ? module.totalTasks
                : items.length;

            return {
              id: module._id ?? module.id ?? `${module.title}-${module.order ?? 0}`,
              title: module.domain ?? module.title ?? module.module ?? "Domain",
              task: taskCount,
              isPremium: module.isPremium ?? false,
              items,
            } as Module;
          }
        );

        setModules(mappedModules);
        setBookmarkedItems(nextBookmarkedItems);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch domain tasks", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDomainsTasks();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="justify-start text-2xl font-bold">Domains & Tasks</h2>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`relative max-h-[44px] ${showBookmarks ? "bg-primary_heading text-white" : ""}`}
          >
            <Bookmark
              className={`w-4 h-4 ${hasBookmarks ? "fill-current" : ""}`}
            />
            My Bookmarks
            {hasBookmarks && (
              <span className="absolute -top-1 -right-1 bg-primary_heading text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {bookmarkedItems.size}
              </span>
            )}
          </Button>

          {!userHasPremium && (
            <Button
              variant="secondary"
              className=" bg-gradient-to-r from-[#ff6402] to-[#fdb22b] max-h-[44px] !px-5"
            >
              Get Full Access
            </Button>
          )}
        </div>
      </div>

      {/* MODULE LIST */}
      <div className="space-y-2.5">
        {!showBookmarks ? (
          isLoading ? (
            <div className="p-4 text-sm text-paragraph">
              Loading domains and tasks...
            </div>
          ) : modules.length ? (
            modules.map((module, index) => (
              <DomainsModuleSection
                key={module.id}
                module={module}
                defaultOpen={index === 0}
                userHasPremium={userHasPremium}
                bookmarkedItems={bookmarkedItems}
                onToggleBookmark={toggleBookmark}
              />
            ))
          ) : (
            <div className="p-4 text-sm text-paragraph">
              No domains or tasks available yet.
            </div>
          )
        ) : (
          <div className="bg-light-blue rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-Black_light">
                My Bookmarks ({bookmarkedItems.size})
              </h2>

              <button
                onClick={() => setShowBookmarks(false)}
                className="text-primary_blue hover:text-primary_heading text-sm font-medium flex items-center gap-1"
              >
                <NavArrowLeft className="w-5 h-5" /> Back to Domains
              </button>
            </div>

            {hasBookmarks ? (
              getBookmarkedItemsData().map((item, index) => {
                const moduleShortCode = item.moduleTitle
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-[#dce5ed] py-2 last:border-b-0"
                  >
                    <Link
                      to={`/domains-tasks/task/${item.id}`}
                      className="flex items-center gap-3 w-full"
                    >
                      <img
                        src={DomainQuestionIcon}
                        alt="Task"
                        className="w-8 h-8"
                      />
                      <div>
                        <p className="text-xs text-paragraph font-medium">
                          {item.taskLabel ?? `${moduleShortCode} ${index + 1}`}
                        </p>
                        <h4 className="text-Black_light text-sm font-semibold truncate max-w-[320px]">
                          {item.taskName ?? item.title}
                        </h4>
                      </div>
                    </Link>

                    <button
                      onClick={() => toggleBookmark(item.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Bookmark className="w-4 h-4 fill-paragraph text-paragraph" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bookmarks yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainsTasks;
