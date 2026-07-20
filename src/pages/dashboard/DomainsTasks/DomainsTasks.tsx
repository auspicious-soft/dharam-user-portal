/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Module } from "@/components/DomainsTasks/types";
import { DomainsModuleSection } from "@/components/DomainsTasks/DomainsModuleSection";
import { NavArrowLeft } from "iconoir-react";
import DomainQuestionIcon from "@/assets/domain-question-icon.png";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";

const DomainsTasks = () => {
  const navigate = useNavigate();
  const [userHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [purchasingDomainId, setPurchasingDomainId] = useState<string | null>(
    null
  );

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
      console.error("Failed to update task bookmark", error);
    }
  };

  const [showBookmarks, setShowBookmarks] = React.useState(false);

  const hasBookmarks = bookmarkedItems.size > 0;
  const hasInactiveDomains = modules.some(
    (module) => String(module.status ?? "ACTIVE").toUpperCase() === "INACTIVE"
  );

  const resolveRedirectUrl = (responseData: unknown): string | null => {
    const parsed = responseData as
      | {
          url?: string;
          checkoutUrl?: string;
          data?: { url?: string; checkoutUrl?: string };
        }
      | undefined;

    return (
      parsed?.data?.url ??
      parsed?.data?.checkoutUrl ??
      parsed?.url ??
      parsed?.checkoutUrl ??
      null
    );
  };

  const getOrderValue = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const handleBuyPremiumDomain = async (module: Module) => {
    if (!module?.id) {
      toast.error("Invalid domain selected.");
      return;
    }

    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/domains-tasks`
        : "/domains-tasks";

    setPurchasingDomainId(module.id);

    try {
      const response = await api.post("/user/create-purchase", {
        type: "INDIVIDUAL",
        amount: module.price ?? null,
        purchasedProduct: module.id,
        purchaseType: "DOMAIN_TASK",
        success_url: callbackUrl,
        cancel_url: callbackUrl,
      });

      const redirectUrl = resolveRedirectUrl(response.data);
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      const message =
        (response.data as { message?: string })?.message ??
        "Purchase request created successfully.";
      toast.success(message);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Unable to create purchase.";
      toast.error(message);
    } finally {
      setPurchasingDomainId(null);
    }
  };

  const getBookmarkedItemsData = () => {
    const data: {
      id: string;
      title: string;
      taskLabel?: string;
      taskName?: string;
      moduleTitle: string;
      isLocked?: boolean;
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
              isLocked: Boolean(item.isLocked),
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
        const rawModules = Array.isArray(data) ? data : [];
        const nextBookmarkedItems = new Set<string>();
        const orderedRawModules = [...rawModules].sort((a: any, b: any) => {
          const firstOrder = getOrderValue(a?.order, rawModules.indexOf(a));
          const secondOrder = getOrderValue(b?.order, rawModules.indexOf(b));
          return firstOrder - secondOrder;
        });

        const mappedModules: Module[] = orderedRawModules.map(
          (module: any, moduleIndex: number) => {
            const moduleStatus = String(module.status ?? "ACTIVE").toUpperCase();
            const rawItems =
              (Array.isArray(module.tasks) && module.tasks) ||
              (Array.isArray(module.items) && module.items) ||
              (Array.isArray(module.domainTasks) && module.domainTasks) ||
              (Array.isArray(module.taskList) && module.taskList) ||
              [];

            const orderedRawItems = [...rawItems].sort((a: any, b: any) => {
              const firstOrder = getOrderValue(a?.order, rawItems.indexOf(a));
              const secondOrder = getOrderValue(b?.order, rawItems.indexOf(b));
              return firstOrder - secondOrder;
            });

            const items = orderedRawItems
              .map((item: any, index: number) => {
                const id =
                  item._id ??
                  item.id ??
                  item.taskId ??
                  `${module._id}-${index}`;
                const itemStatus = String(item.status ?? "ACTIVE").toUpperCase();
                const isLocked = itemStatus === "INACTIVE";

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
                  order: getOrderValue(item.order, index),
                  status: itemStatus,
                  taskLabel: item.taskLabel ?? undefined,
                  taskName: item.taskName ?? undefined,
                  isPremium: item.isPremium ?? false,
                  isLocked,
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
              order: getOrderValue(module.order, moduleIndex),
              status: moduleStatus,
              task: taskCount,
              price:
                typeof module.price === "number"
                  ? module.price
                  : module.price != null
                    ? Number(module.price)
                    : null,
              isPremium: Boolean(module.isPremium),
              items,
            } as Module;
          }
        );

        setModules(mappedModules);
        setBookmarkedItems(nextBookmarkedItems);
      } catch (error) {
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

          {!userHasPremium && hasInactiveDomains && (
            <Button
              variant="secondary"
              className=" bg-gradient-to-r from-[#ff6402] to-[#fdb22b] max-h-[44px] !px-5"
              onClick={() => navigate("/dashboard")}
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
                onBuyPremiumDomain={handleBuyPremiumDomain}
                isPremiumPurchasing={purchasingDomainId === module.id}
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
                const isTaskLocked = Boolean(item.isLocked);
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
                      to={isTaskLocked ? "#" : `/domains-tasks/task/${item.id}`}
                      onClick={(e) => {
                        if (isTaskLocked) {
                          e.preventDefault();
                        }
                      }}
                      className={`flex items-center gap-3 w-full ${
                        isTaskLocked ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <img
                        src={DomainQuestionIcon}
                        alt="Task"
                        className="w-8 h-8"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-paragraph font-medium">
                          {item.taskLabel ?? `${moduleShortCode} ${index + 1}`}
                        </p>
                        <h4 className="text-Black_light text-sm font-semibold whitespace-normal break-words leading-5">
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
