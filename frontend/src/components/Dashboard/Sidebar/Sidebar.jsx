import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import {
  FaChartLine,
  FaClipboard,
  FaEnvelope,
  FaUserAlt,
  FaUsers,
  FaSignOutAlt,
  FaBuilding,
  FaClock,
  FaFileAlt,
  FaCalendarAlt,
  FaCalendarCheck, 
  FaChevronDown,
  FaChevronRight,
  FaWallet,
} from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { NavLink, useNavigate } from "react-router-dom";
import { getUserRole } from "../../../utils/auth"; 
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  // const [leaveOpen, setLeaveOpen] = useState(false);
  const navigate = useNavigate();
  const role = getUserRole(); 

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleAttendance = () => {
    setAttendanceOpen(!attendanceOpen);
  };

  // const toggleLeave = () => {
  //   setLeaveOpen(!leaveOpen);
  // };

  return (
    <div className="sidebar-container">
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hamburger-button"
      >
        {isOpen ? (
          <XMarkIcon className="hamburger-icon" />
        ) : (
          <Bars3Icon className="hamburger-icon" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div
          className="logo-container"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src="/src/assets/logo-noback.png"
            alt="Workify Logo"
            className="logo"
          />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-content">
            <ul>
              {/* admin and HR */}
              {(role === "admin" || role === "hr") && (
                <>
                  <li>
                    <NavLink
                      to="/dashboard"
                      end
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <RxDashboard className="nav-icon" />
                      <span>Dashboard</span>
                    </NavLink>
                  </li>

                  {/* Users - Admin only */}
                  {role === "admin" && (
                    <li>
                      <NavLink
                        to="/dashboard/users"
                        className={({ isActive }) =>
                          isActive ? "nav-item active" : "nav-item"
                        }
                      >
                        <FaUsers className="nav-icon" />{" "}
                        <span>Users</span>
                      </NavLink>
                    </li>
                  )}

                  <li>
                    <NavLink
                      to="/dashboard/employee-list"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaUserAlt className="nav-icon" />{" "}
                      <span>Employee List</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/department"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaBuilding className="nav-icon" />{" "}
                      <span>Departments</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/schedule"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaCalendarAlt className="nav-icon" /> 
                      <span>Schedule</span>
                    </NavLink>
                  </li>
                  
                  {/* attendance dropdown */}
                  <li>
                    <div 
                      className="nav-item dropdown-toggle"
                      onClick={toggleAttendance}
                      style={{ cursor: "pointer" }}
                    >
                      <FaClock className="nav-icon" />
                      <span>Attendance</span>
                      {attendanceOpen ? (
                        <FaChevronDown className="dropdown-icon" />
                      ) : (
                        <FaChevronRight className="dropdown-icon" />
                      )}
                    </div>

                    {attendanceOpen && (
                      <ul className="dropdown-menu">
                        <li>
                          <NavLink
                            to="/dashboard/admin-attendance-logs"
                            className={({ isActive }) =>
                              isActive ? "nav-item sub-item active" : "nav-item sub-item"
                            }
                          >
                            <FaClock  className="nav-icon" />
                            <span> Logs</span>
                          </NavLink>
                        </li>
                        {/* <li>
                          <NavLink
                            to="/dashboard/admin-attendance-report"
                            className={({ isActive }) =>
                              isActive ? "nav-item sub-item active" : "nav-item sub-item"
                            }
                          >
                            <FaFileAlt className="nav-icon" />
                            <span>Report</span>
                          </NavLink>
                        </li> */}
                      </ul>
                    )}
                  </li>

                  {/* leave management dropdown */}
                  {/* <li>
                    <div 
                      className="nav-item dropdown-toggle"
                      onClick={toggleLeave}
                      style={{ cursor: "pointer" }}
                    >
                      <FaCalendarCheck className="nav-icon" />
                      <span>Leave Management</span>
                      {leaveOpen ? (
                        <FaChevronDown className="dropdown-icon" />
                      ) : (
                        <FaChevronRight className="dropdown-icon" />
                      )}
                    </div>

                    {leaveOpen && (
                      <ul className="dropdown-menu">
                        <li>
                          <NavLink
                            to="/dashboard/leave-request"
                            className={({ isActive }) =>
                              isActive ? "nav-item sub-item active" : "nav-item sub-item"
                            }
                          >
                            <FaCalendarCheck className="nav-icon" />
                            <span>Leave Request</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/dashboard/leave-balance"
                            className={({ isActive }) =>
                              isActive ? "nav-item sub-item active" : "nav-item sub-item"
                            }
                          >
                            <FaWallet className="nav-icon" />
                            <span>Leave Balance</span>
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li> */}

                  <li>
                    <NavLink
                      to="/dashboard/task"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaClipboard className="nav-icon" /> <span>Task</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/progress"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaChartLine className="nav-icon" /> <span>Progress</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/inquiries"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaEnvelope className="nav-icon" /> <span>Inquiries</span>
                    </NavLink>
                  </li>
                </>
              )}

              {/* employee */}
              {role === "employee" && (
                <>
                  <li>
                    <NavLink
                      to="/dashboard/employee-dashboard"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <RxDashboard className="nav-icon" />
                      <span>Employee Dashboard</span>
                    </NavLink>
                  </li>

                  {/* attendance dropdown for employee */}
                  <li>
                    <div 
                      className="nav-item dropdown-toggle"
                      onClick={toggleAttendance}
                      style={{ cursor: "pointer" }}
                    >
                      <FaClock className="nav-icon" />
                      <span>Attendance</span>
                      {attendanceOpen ? (
                        <FaChevronDown className="dropdown-icon" />
                      ) : (
                        <FaChevronRight className="dropdown-icon" />
                      )}
                    </div>

                    {attendanceOpen && (
                      <ul className="dropdown-menu">
                        <li>
                          <NavLink
                            to="/dashboard/employee-attendance-logs"
                            className={({ isActive }) =>
                              isActive ? "nav-item sub-item active" : "nav-item sub-item"
                            }
                          >
                            <FaClock  className="nav-icon" />
                            <span>Logs</span>
                          </NavLink>
                        </li>
                        {/* <li>
                          <NavLink
                            to="/dashboard/employee-attendance-report"
                            className={({ isActive }) =>
                              isActive ? "nav-item sub-item active" : "nav-item sub-item"
                            }
                          >
                            <FaFileAlt className="nav-icon" />
                            <span>Report</span>
                          </NavLink>
                        </li> */}
                      </ul>
                    )}
                  </li>

                  {/* leave management dropdown for employee */}
                  {/* <li>
                    <NavLink
                      to="/dashboard/employee-leave-management"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaCalendarCheck className="nav-icon" />
                      <span>Leave Management</span>
                    </NavLink>
                  </li> */}

                  <li>
                    <NavLink
                      to="/dashboard/progress"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaChartLine className="nav-icon" /> <span>Progress</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/employee-inquiries"
                      className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                      }
                    >
                      <FaEnvelope className="nav-icon" /> <span>Inquiries</span>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="nav-item logout-button">
              <FaSignOutAlt className="nav-icon" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;