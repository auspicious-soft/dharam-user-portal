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
import {
  type CourseAccess,
  emptyCourseAccess,
  readSelectedCourseAccess,
} from "@/utils/courseAccess";

type SidebarItem = {
  key: string;
  title: string;
  url: string;
  icon: React.ComponentType;
  alwaysVisible?: boolean;
  accessKey?: keyof CourseAccess;
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
    alwaysVisible: true,
  },
  {
    key: "courseIntroduction",
    title: "Course Introduction",
    url: "/course-introduction",
    icon: OpenBook,
    alwaysVisible: true,
  },
  {
    key: "lessonsVideos",
    title: "Lessons & Videos",
    url: "/lessons-videos",
    icon: MediaVideo,
    accessKey: "hasLessons",
  },
  {
    key: "domainsTasks",
    title: "Domains and Tasks",
    url: "/domains-tasks",
    icon: TaskList,
    accessKey: "hasDomainTask",
  },
  {
    key: "practiceQuestions",
    title: "Practice Questions",
    url: "/practice-questions",
    icon: QuestionMark,
    accessKey: "hasPracticeQuestion",
  },
  {
    key: "mockExams",
    title: "Mock Exams",
    url: "/exams",
    icon: JournalPage,
    accessKey: "hasMockExam",
  },
  {
    key: "flashCards",
    title: "Flash Cards",
    url: "/flash-cards",
    icon: MultiplePagesEmpty,
    accessKey: "hasFlashCards",
  },
  {
    key: "applicationSupport",
    title: "Application Support",
    url: "/application-support",
    icon: HeadsetHelp,
    accessKey: "hasApplicationSupport",
  },
  {
    key: "examStrategy",
    title: "Exam Strategy",
    url: "/exam-strategy",
    icon: Strategy,
    accessKey: "hasExamStrategy",
  },
  {
    key: "myCertificatesPdus",
    title: "My Certificates/PDUs",
    url: "/certificates-pdus",
    icon: EmptyPage,
    accessKey: "hasCertificates",
  },
  {
    key: "announcements",
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
    alwaysVisible: true,
  },
  {
    key: "notifications",
    title: "Notifications",
    url: "/notifications",
    icon: BellNotification,
    alwaysVisible: true,
  },
  {
    key: "questionOfTheDay",
    title: "Question of the day",
    url: "/question-of-the-day",
    icon: BrightStar,
    alwaysVisible: true,
  },
];

const resolveVisibleItems = (access: CourseAccess) =>
  navMain.filter((item) => {
    if (item.alwaysVisible || !item.accessKey) {
      return true;
    }
    return Boolean(access[item.accessKey]);
  });

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [courseAccess, setCourseAccess] = React.useState<CourseAccess>(
    emptyCourseAccess,
  );
  const [navigationLabels, setNavigationLabels] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    const updateCourseAccess = () => {
      setCourseAccess(readSelectedCourseAccess());
    };

    updateCourseAccess();
    window.addEventListener("storage", updateCourseAccess);
    window.addEventListener("courseChanged", updateCourseAccess as EventListener);

    return () => {
      window.removeEventListener("storage", updateCourseAccess);
      window.removeEventListener(
        "courseChanged",
        updateCourseAccess as EventListener,
      );
    };
  }, []);

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
      resolveVisibleItems(courseAccess).map((item) => ({
        ...item,
        title: navigationLabels[item.key] || item.title,
      })),
    [courseAccess, navigationLabels],
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <NavLink to="/" className="flex gap-[10px] items-center">
          <img src={Logo} alt="Logo" className="max-w-[58px]" />
          <div className="justify-start text-[#0a4ba8] text-sm font-bold leading-5">
            vCareProject Management
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
