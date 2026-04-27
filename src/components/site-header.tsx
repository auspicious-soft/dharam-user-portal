import { SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { useCallback, useEffect, useState } from "react";
import { NavUser } from "./nav-user";
import CourseSelect from "./reusableComponents/CourseSelect";

export function SiteHeader() {
  const [user, setUser] = useState<{ name: string; avatar: string }>({
    name: "User",
    avatar: "",
  });

  const resolveAvatar = (image?: string | null) => {
    if (!image) return "";
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    const base = import.meta.env.VITE_AWS_S3_PUBLIC_BASE_URL ?? "";
    if (!base) {
      return image;
    }

    const baseHasSlash = base.endsWith("/");
    const imageHasSlash = image.startsWith("/");
    if (baseHasSlash && imageHasSlash) {
      return `${base}${image.slice(1)}`;
    }
    if (!baseHasSlash && !imageHasSlash) {
      return `${base}/${image}`;
    }
    return `${base}${image}`;
  };

  const readUserFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return { name: "User", avatar: "" };
    }

    const raw = localStorage.getItem("user");
    if (!raw) {
      return { name: "User", avatar: "" };
    }

    try {
      const parsed = JSON.parse(raw) as {
        firstname?: string | null;
        lastname?: string | null;
        email?: string | null;
        image?: string | null;
      };
      const name =
        [parsed.firstname, parsed.lastname]
          .filter(Boolean)
          .join(" ")
          .trim() || parsed.email || "User";
      return { name, avatar: resolveAvatar(parsed.image ?? "") };
    } catch {
      return { name: "User", avatar: "" };
    }
  }, []);

  useEffect(() => {
    const updateUser = () => setUser(readUserFromStorage());
    updateUser();

    window.addEventListener("storage", updateUser);
    window.addEventListener("userUpdated", updateUser as EventListener);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("userUpdated", updateUser as EventListener);
    };
  }, [readUserFromStorage]);

  return (
    <header className="sticky top-0 z-10 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-14 md:h-16 shrink-0 items-center gap-2 bg-light-blue transition-[width,height] ease-linear py-1">
      <div className="flex w-full items-center justify-between gap-1 px-3 lg:gap-2 lg:px-3">
        <SidebarTrigger className="-ml-1" />
        <div className="flex gap-2 lg:gap-5 lg:px-3 flex-1 justify-end items-center ">
        <CourseSelect />
        <SidebarFooter>
         <NavUser user={user} />
         </SidebarFooter>
         </div>
      </div>
    </header>
  )
}
