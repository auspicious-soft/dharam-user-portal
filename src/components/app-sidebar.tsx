import * as React from "react";
import { Megaphone } from "lucide-react";
import Logo from "@/assets/auth-logo.png";
import NeedHelpIcon from "@/assets/needhelp-icon.png";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import api from "@/lib/axios";
import {
  BellNotification,
  BrightStar,
  EmptyPage,
  HeadsetHelp,
  JournalPage,
  MediaVideo,
  MultiplePagesEmpty,
  OpenBook,
  QuestionMark,
  Strategy,
  TaskList,
  ViewGrid,
} from "iconoir-react";
import { NavLink } from "react-router-dom";

type SidebarItem = {
  key: string;
  title: string;
  url: string;
  icon: React.ComponentType;
};

type NavigationItem = {
  key?: string | null;
  name?: string | null;
};

const navMain: SidebarItem[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    url: "/dashboard",
    icon: ViewGrid,
  },
  {
    key: "courseIntroduction",
    title: "Course Introduction",
    url: "/course-introduction",
    icon: OpenBook,
  },
  {
    key: "lessonsVideos",
    title: "Lessons & Videos",
    url: "/lessons-videos",
    icon: MediaVideo,
  },
  {
    key: "domainsTasks",
    title: "Domains and Tasks",
    url: "/domains-tasks",
    icon: TaskList,
  },
  {
    key: "practiceQuestions",
    title: "Practice Questions",
    url: "/practice-questions",
    icon: QuestionMark,
  },
  {
    key: "mockExams",
    title: "Mock Exams",
    url: "/exams",
    icon: JournalPage,
  },
  {
    key: "flashCards",
    title: "Flash Cards",
    url: "/flash-cards",
    icon: MultiplePagesEmpty,
  },
  {
    key: "applicationSupport",
    title: "Application Support",
    url: "/application-support",
    icon: HeadsetHelp,
  },
  {
    key: "examStrategy",
    title: "Exam Strategy",
    url: "/exam-strategy",
    icon: Strategy,
  },
  {
    key: "myCertificatesPdus",
    title: "My Certificates/PDUs",
    url: "/certificates-pdus",
    icon: EmptyPage,
  },
  {
    key: "announcements",
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
  },
  {
    key: "notifications",
    title: "Notifications",
    url: "/notifications",
    icon: BellNotification,
  },
  {
    key: "questionOfTheDay",
    title: "Question of the day",
    url: "/question-of-the-day",
    icon: BrightStar,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navigationLabels, setNavigationLabels] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    let isMounted = true;

    const fetchNavigations = async () => {
      try {
        const response = await api.get("/user/navigations");
        if (isMounted) {
          console.log("user/navigations response:", response.data);
          const items =
            ((response.data as { data?: NavigationItem[] })?.data ?? []) as
              | NavigationItem[]
              | undefined;

          const labels = (items ?? []).reduce<Record<string, string>>(
            (acc, item) => {
              const key = String(item.key ?? "").trim();
              const name = String(item.name ?? "").trim();

              if (key && name) {
                acc[key] = name;
              }

              return acc;
            },
            {},
          );

          setNavigationLabels(labels);
        }
      } catch (error) {
        console.error("Failed to fetch user navigations:", error);
      }
    };

    void fetchNavigations();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleNavItems = React.useMemo(
    () =>
      navMain.map((item) => ({
        ...item,
        title: navigationLabels[item.key] || item.title,
      })),
    [navigationLabels],
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <NavLink to="/" className="flex gap-[10px] items-center">
          <img src={Logo} alt="Logo" className="max-w-[58px]" />
          <div className="justify-start text-[#0a4ba8] text-sm font-bold leading-5">
            vCareProjectManagement
          </div>
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavLink to="/contact-us" className="self-stretch p-4 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#556378]/10 inline-flex justify-start items-center gap-2.5">
          <img className="w-7" src={NeedHelpIcon} alt="Need Help Icon " />
          <div className="justify-start text-paragraph text-sm font-bold leading-5">
            Need Help?
          </div>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
