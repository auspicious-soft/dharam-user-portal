import React from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Module } from "@/components/DomainsTasks/types";
import { DomainsModuleSection } from "@/components/DomainsTasks/DomainsModuleSection";
import { NavArrowLeft } from "iconoir-react";
import DomainQuestionIcon from "@/assets/domain-question-icon.png";
import { Link } from "react-router-dom";

const DomainsTasks = () => {
  const [userHasPremium] = React.useState(false);

  const [bookmarkedItems, setBookmarkedItems] = React.useState<Set<string>>(
    new Set()
  );

  const toggleBookmark = (itemId: string) => {
    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const [showBookmarks, setShowBookmarks] = React.useState(false);

  const hasBookmarks = bookmarkedItems.size > 0;

  const getBookmarkedItemsData = () => {
    const data: { id: string; title: string; moduleTitle: string }[] = [];

    modules.forEach((module) => {
      module.items.forEach((item) => {
        if (bookmarkedItems.has(item.id)) {
          data.push({
            id: item.id,
            title: item.title,
            moduleTitle: module.title,
          });
        }
      });
    });

    return data;
  };

  const [modules] = React.useState<Module[]>([
    {
      id: "d1",
      title: "Strategic Program Management",
      task: 8,
      isPremium: false,
      items: [
        {
          id: "d1-1",
          title:
            "Perform an initial program assessment by vCare Project Management",
        },
        { id: "d1-2", title: "Dummy Name of the slide" },
        { id: "d1-3", title: "Dummy Name of the quiz" },
      ],
    },
    {
      id: "d2",
      title: "Benefits Management",
      task: 6,
      isPremium: true,
      items: [
        { id: "d2-1", title: "Benefits realization overview" },
        { id: "d2-2", title: "Dummy Name of the slide" },
      ],
    },
  ]);

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
                          {moduleShortCode} {index + 1}
                        </p>
                        <h4 className="text-Black_light text-sm font-semibold truncate max-w-[320px]">
                          {item.title}
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
