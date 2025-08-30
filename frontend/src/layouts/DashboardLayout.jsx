import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar/Sidebar";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  
  
  const getPageTitle = (pathname) => {
    const path = pathname.toLowerCase();
    
    if (path.includes('/dashboard/overview')) return 'Dashboard';
    if (path.includes('/dashboard/employee-list')) return 'Employee List';
    if (path.includes('/dashboard/department')) return 'Departments';
    if (path.includes('/dashboard/progress')) return 'Employee Work Progress';
    if (path.includes('/dashboard/profile')) return 'Profile';
    if (path.includes('/dashboard/users')) return 'Users Management';
    if (path.includes('/dashboard/inquiries')) return 'Inquiries';
    if (path.includes('/dashboard/employee-inquiries')) return 'Employee Inquiries';
    if (path.includes('/dashboard/task')) return 'Task';
    if (path.includes('/dashboard/payment-history')) return 'Payment History';
    if (path.includes('/dashboard/schedule')) return 'Scheduling Management';
    if (path.includes('/dashboard/admin-attendance-logs')) return 'Attendance Management';
    if (path.includes('/dashboard/admin-attendance-report')) return 'Attendance Management';
    if (path.includes('/dashboard/employee-attendance-logs')) return 'Attendance Management';
    if (path.includes('/dashboard/employee-attendance-report')) return 'Attendance Management';
    if (path.includes('/dashboard/leave-request')) return 'Leave Management';
    if (path.includes('/dashboard/leave-balance')) return 'Leave Management'; 
   
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      <div className="dashboard-grid">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="main-content-container">
          {/* Header Section */}
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-flex">
                <div className="header-title-section">
                  <h1>{pageTitle}</h1>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;