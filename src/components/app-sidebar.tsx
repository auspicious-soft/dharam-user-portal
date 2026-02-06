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

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: ViewGrid,
    },
    {
      title: "Course Introduction",
      url: "/course-introduction",
      icon: OpenBook,
    },
    {
      title: "Lessons & Videos",
      url: "/lessons-videos",
      icon: MediaVideo,
    },
    {
      title: "Domains and Tasks",
      url: "/domains-tasks",
      icon: TaskList,
    },
    {
      title: "Practice Questions",
      url: "/practice-questions",
      icon: QuestionMark,
    },
    {
      title: "Mock Exams",
      url: "/exams",
      icon: JournalPage,
    },
    {
      title: "Flash Cards",
      url: "/flash-cards",
      icon: MultiplePagesEmpty,
    },
    {
      title: "Application Support",
      url: "/application-support",
      icon: HeadsetHelp,
    },
    {
      title: "Exam Strategy",
      url: "/exam-strategy",
      icon: Strategy,
    },
    {
      title: "My Certificates/PDUs",
      url: "/certificates-pdus",
      icon: EmptyPage,
    },
    {
      title: "Announcements",
      url: "/announcements",
      icon: Megaphone,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: BellNotification,
    },
        {
      title: "Question of the day",
      url: "/question-of-the-day",
      icon: BrightStar,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
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
