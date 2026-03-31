import { NavLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Logo from "@/assets/auth-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ExamHeader() {
  const [user, setUser] = useState<{ name: string; avatar: string }>({
    name: "User",
    avatar: "",
  });

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
      return { name, avatar: parsed.image ?? "" };
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
    <header className="sticky top-0 z-10 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex  shrink-0 items-center gap-2 bg-light-blue transition-[width,height] ease-linear py-3">
      <div className="flex w-full items-center justify-between gap-1 px-3 lg:gap-2 lg:px-3">
        <NavLink to="/" className="flex gap-[10px] items-center">
          <img src={Logo} alt="Logo" className="max-w-[58px]" />
          <div className="justify-start text-[#0a4ba8] text-sm font-bold leading-5">
            vCare <br />
            Project Management
          </div>
        </NavLink>
        <div className="flex gap-2 justify-end items-center ">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
            <AvatarFallback className="rounded-full">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-Desc-464646 text-sm font-medium leading-[30px]">
              {user.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
