import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import ContactUs from "../pages/ContactUs/ContactUs";
import Inquiries from "../pages/Inquiries/Inquiries";
import EmployeeInquiries from "../pages/Inquiries/EmployeeInquiries";
import Users from "../pages/Users/Users";
import AdminAttendanceLogs from "../pages/Attendance/AdminAttendance/AdminAttendanceLogs";
import AdminAttendanceReport from "../pages/Attendance/AdminAttendance/AdminAttendanceReport";
import SchedulingPage from "../pages/Schedule/SchedulingPage";
import DashboardOverview from "../pages/Dashboard/DashboardOverview/DashboardOverview";
import EmployeeDashboard from "../pages/Dashboard/EmployeeDashboard/EmployeeDashboard";
import Task from "../pages/Task/Task";
import EmployeeAttendanceLogs from "../pages/Attendance/EmployeeAttendance/EmployeeAttendanceLogs";
import EmployeeAttendanceReport from "../pages/Attendance/EmployeeAttendance/EmployeeAttendanceReport";
import EmployeeLeaveManagement from "../pages/LeaveManagement/EmployeeLeave/EmployeeLeaveManagement";
import AdminLeaveRequest from "../pages/LeaveManagement/AdminLeave/AdminLeaveRequest";
import AdminLeaveBalance from "../pages/LeaveManagement/AdminLeave/AdminLeaveBalances";
import EmployeeDetails from "../pages/EmployeeList/EmployeeDetails";
import EmployeeList from "../pages/EmployeeList/EmployeeList";
import Progress from "../pages/Progress/Progress";
import DepartmentList from "../pages/Departments/DepartmentList";
import Profile from "../pages/Profile/Profile";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home/Home";
import DashboardLayout from "./../layouts/DashboardLayout";
import Login from "./../pages/Login/Login";
import RoleRoute from "./RoleRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/contact", element: <ContactUs /> },
      { path: "/login", element: <Login /> },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <RoleRoute allowed={["admin", "hr", "employee"]}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      // admin/hr landing
      {
        index: true,
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <DashboardOverview />
          </RoleRoute>
        ),
      },

      // employee landing
      {
        path: "employee-dashboard",
        element: (
          <RoleRoute allowed={["employee"]}>
            <EmployeeDashboard />
          </RoleRoute>
        ),
      },

      { path: "profile", element: <Profile /> },

      // shared
      {
        path: "task",
        element: (
          <RoleRoute allowed={["employee", "hr", "admin"]}>
            <Task />
          </RoleRoute>
        ),
      },
      {
        path: "progress",
        element: (
          <RoleRoute allowed={["employee", "hr", "admin"]}>
            <Progress />
          </RoleRoute>
        ),
      },

      // admin/hr only
      {
        path: "inquiries",
        element: (
          <RoleRoute allowed={["admin", "hr",]}>
            <Inquiries />
          </RoleRoute>
        ),
      },
      {
        path: "users",
        element: (
          <RoleRoute allowed={["admin"]}>
            <Users />
          </RoleRoute>
        ),
      },
      {
        path: "employee-list",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <EmployeeList />
          </RoleRoute>
        ),
      },
      {
        path: "department",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <DepartmentList />
          </RoleRoute>
        ),
      },
      {
        path: "schedule",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <SchedulingPage />
          </RoleRoute>
        ),
      },

      // admin/hr leave management
      {
        path: "leave-request",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <AdminLeaveRequest />
          </RoleRoute>
        ),
      },
      {
        path: "leave-balance",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <AdminLeaveBalance />
          </RoleRoute>
        ),
      },

      {
        path: "details/:email",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <EmployeeDetails />
          </RoleRoute>
        ),
      },
      {
        path: "admin-attendance-logs",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <AdminAttendanceLogs />
          </RoleRoute>
        ),
      },
      {
        path: "admin-attendance-report",
        element: (
          <RoleRoute allowed={["admin", "hr"]}>
            <AdminAttendanceReport />
          </RoleRoute>
        ),
      },

      // employee only
      {
        path: "employee-attendance-logs",
        element: (  
          <RoleRoute allowed={["employee"]}>
            <EmployeeAttendanceLogs />
          </RoleRoute>
        ),
      },
      {
        path: "employee-attendance-report",
        element: (
          <RoleRoute allowed={["employee"]}>
            <EmployeeAttendanceReport />
          </RoleRoute>
        ),
      },
      {
        path: "employee-leave-management",
        element: (
          <RoleRoute allowed={["employee"]}>
            <EmployeeLeaveManagement />
          </RoleRoute>
        ),
      },
      {
        path: "employee-inquiries",
        element: (
          <RoleRoute allowed={["employee"]}>
            <EmployeeInquiries />
          </RoleRoute>
        ),
      },
    ],
  },

  {
    path: "/unauthorized",
    element: <h1>Unauthorized Access</h1>,
  },
]);

export default router;