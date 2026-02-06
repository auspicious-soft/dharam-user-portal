import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import { isAuthenticated } from "../auth/Authenticated";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import EnterOtp from "@/pages/auth/EnterOtp";
import CreateNewPassword from "@/pages/auth/CreateNewPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import CourseIntroduction from "@/pages/dashboard/CourseIntroduction/CourseIntroduction";
import LessonsVideos from "@/pages/dashboard/LessonsVideos/LessonsVideos";
import DomainsTasks from "@/pages/dashboard/DomainsTasks/DomainsTasks";
import Questions from "@/pages/dashboard/Questions/Questions";
import Exams from "@/pages/dashboard/Exams/Exams";
import FlashCards from "@/pages/dashboard/FlashCards/FlashCards";
import ApplicationSupport from "@/pages/dashboard/ApplicationSupport/ApplicationSupport";
import ExamStrategy from "@/pages/dashboard/ExamStrategy/ExamStrategy";
import CertificatesPDUs from "@/pages/dashboard/CertificatesPDUs/CertificatesPDUs";
import Announcements from "@/pages/dashboard/Announcements/Announcements";
import Notifications from "@/pages/dashboard/Notifications/Notifications";
import DomainTaskViewer from "@/pages/dashboard/DomainsTasks/DomainTaskViewer";
import Profile from "@/pages/dashboard/Profile/profile";
import ContactUs from "@/pages/dashboard/ContactUs/ContactUs";
import DayQuestion from "@/pages/dashboard/QuestionOfTheDay/DayQuestion";
import FlashCardDetail from "@/pages/dashboard/FlashCards/FlashCardDetail";
import QuestionsView from "@/pages/dashboard/Questions/QuestionsView";
import ViewReports from "@/pages/dashboard/Questions/ViewReports";
import MockExams from "@/pages/dashboard/Exams/MockExams";
import CreateAccount from "@/pages/auth/CreateAccount";
import StartExam from "@/pages/dashboard/Exams/StartExam";
import ExamStart from "@/layouts/ExamStart";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/enter-otp" element={<EnterOtp />} />
        <Route path="/create-new-password" element={<CreateNewPassword />} />
      </Route>
      
      {/*ExamStart routes */}
      <Route element={<ExamStart />}>
        <Route path="/exams/start/:id" element={<StartExam />} />
      </Route>

      {/*dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route element={<DashboardLayout />}>
        {/* Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Course introduction page */}
        <Route path="/course-introduction" element={<CourseIntroduction />} />
        {/* Lessons videos page */}
        <Route path="/lessons-videos" element={<LessonsVideos />} />
        {/* Domains tasks page */}
        <Route path="/domains-tasks" element={<DomainsTasks />} />
        <Route
          path="/domains-tasks/task/:taskId"
          element={<DomainTaskViewer />}
        />
        {/*Question page*/}
        <Route path="/practice-questions" element={<Questions />} />
        <Route
          path="/practice-questions/questions-view/:id"
          element={<QuestionsView />}
        />
        <Route
          path="/practice-questions/view-reports"
          element={<ViewReports />}
        />
        {/*Exams Page*/}
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/mock-exams/:id" element={<MockExams />} />

        <Route path="/exams/view-reports" element={<ViewReports />} />
        {/*Flash Cards*/}
        <Route path="/flash-cards" element={<FlashCards />} />
        <Route
          path="/flash-cards/flash-detail/:id"
          element={<FlashCardDetail />}
        />
        {/*Application Support*/}
        <Route path="/application-support" element={<ApplicationSupport />} />
        {/*Exam Strategy*/}
        <Route path="/exam-strategy" element={<ExamStrategy />} />
        {/*Certificates PDUs*/}
        <Route path="/certificates-pdus" element={<CertificatesPDUs />} />
        {/*Announcements*/}
        <Route path="/announcements" element={<Announcements />} />
        {/*Notifications*/}
        <Route path="/notifications" element={<Notifications />} />

        <Route path="/question-of-the-day" element={<DayQuestion />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
