import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FaClipboardList, FaTasks, FaUsers } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./DashboardOverview.css";
import api from "../../../api/api";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [remainingTasks, setRemainingTasks] = useState(0); 
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [newHiredEmployees, setNewHiredEmployees] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  // fetch tasks and calculate totals for stats
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks");
        let inProgress = 0; 
        let completed = 0;
        let pending = 0;

        res.data.forEach(task => {
          const status = (task.status || "").toLowerCase();
          if (status === "in progress") inProgress += 1;
          if (status === "completed") completed += 1;
          if (status === "pending") pending += 1;
        });

        setRemainingTasks(inProgress);
        setCompletedTasks(completed);
        setPendingTaskCount(pending); 
        setTotalTaskCount(res.data.length); 
      } catch (err) {
        setRemainingTasks(0);
        setCompletedTasks(0);
        setPendingTaskCount(0);
        setTotalTaskCount(0);
      }
    };

    fetchTasks();
  }, []);

function parseDueDate(input) {
  if (!input) return null;
  const iso = new Date(input);
  if (!isNaN(iso.getTime())) return iso;
  const parts = String(input).trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    let mm = parseInt(parts[0], 10);
    let dd = parseInt(parts[1], 10);
    let yy = parseInt(parts[2], 10);
    if (isNaN(mm) || isNaN(dd) || isNaN(yy)) return null;
    if (yy < 100) yy = 2000 + yy;
    return new Date(yy, mm - 1, dd);
  }
  return null;
}

// fetch upcoming tasks
useEffect(() => {
  const fetchUpcomingTasks = async () => {
    try {
      const res = await api.get("/tasks");
      const today = new Date();

      const filtered = res.data
        .filter(task => {
          const due = parseDueDate(task.dueDate);
          // display in progress tasks only
          return due && (task.status || "").toLowerCase() === "in progress";
        })
        .sort((a, b) => parseDueDate(a.dueDate) - parseDueDate(b.dueDate))
        .slice(0, 8);

      const mapped = filtered.map(task => ({
        taskName: task.taskName,
        assignedTo: task.assignedTo?.fullName || '',
        dueDate: task.dueDate,
      }));

      setUpcomingTasks(mapped);
    } catch (err) {
      setUpcomingTasks([]);
    }
  };

  fetchUpcomingTasks();
}, []);

  // fetch total employees count
  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const res = await api.get("/emp-info/all");
        setTotalEmployees(res.data.length);
      } catch (err) {
        setTotalEmployees(0);
      }
    };

    fetchTotalEmployees();
  }, []);

  // fetch new hired employees
  useEffect(() => {
    const fetchNewHiredEmployees = async () => {
      try {
        const { data } = await api.get("/emp-info/all");

        // map frontend
        const mapped = data.map((p) => {
          const u = p.userID || {};
          const dept = u.department || {};
          const fmtMDY = (d) =>
            d ? new Date(d).toLocaleDateString("en-US") : "";

          return {
            name: `${p.firstName || ""} ${p.middleName ? p.middleName + " " : ""}${p.lastName || ""}`.trim(),
            department: dept.departmentName || "",
            jobTitle: u.jobTitle || "",
            hiredDate: fmtMDY(p.hireDate),
            hireDateSort: p.hireDate ? new Date(p.hireDate) : new Date(0), // for sorting
          };
        });

        // sort by hire date descending and take the first 2
        const sorted = mapped
          .sort((a, b) => b.hireDateSort - a.hireDateSort)
          .slice(0, 2);

        setNewHiredEmployees(sorted);
      } catch (err) {
        setNewHiredEmployees([]);
        console.error("Error fetching new hired employees:", err);
      }
    };

    fetchNewHiredEmployees();
  }, []);

  // fetch all emp with their dept
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const res = await api.get("/user-department");
        const users = res.data;

        // create map, count dept name
        const deptMap = {};
        users.forEach(user => {
          const deptName = user.department?.departmentName || "Unknown";
          if (deptMap[deptName]) {
            deptMap[deptName] += 1;
          } else {
            deptMap[deptName] = 1;
          }
        });

        // convert to array for chart/table
        const deptArr = Object.entries(deptMap).map(([name, value]) => ({
          name,
          value
        }));

        setDepartmentData(deptArr);
      } catch (err) {
        setDepartmentData([]);
        console.error("Error fetching department data:", err);
      }
    };

    fetchDepartmentData();
  }, []);

  const handletotalEmployeesClick = () => {
    navigate('/dashboard/employee-list');
  };

  const handleRemainingTasksClick = () => {
    navigate('/dashboard/progress');
  };

  const handleCompletedTasksClick = () => {
    navigate('/dashboard/progress');
  };

  const handlePendingTasksClick = () => {
    navigate('/dashboard/task');
  };

  // circular progress bar calculation
  const progressPercent = totalTaskCount > 0 ? (pendingTaskCount / totalTaskCount) * 100 : 0;

  // Colors for pie chart segments
  const COLORS = ['#002347', '#003366', '#003f7d', '#FF8e00', '#fd7702', '#FF5003'];

  // Function to determine urgency class based on due date
  const getDueDateClass = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) return 'due-date-urgent';
    if (diffDays <= 7) return 'due-date-soon';
    return 'due-date-future';
  };

  return (
    <div className="hr-dashboard-container">
      <div className="hr-dashboard-stats-row">
        <div className="hr-stat-card stat-card-totalEmployees" onClick={handletotalEmployeesClick} style={{ cursor: 'pointer' }}>
          <div className="hr-stat-header">
            <h3>Total Employee</h3>
          </div>
          <div className="hr-stat-main">
            <div className="hr-stat-number">{totalEmployees}</div>
            <FaUsers className="stat-icon" />
          </div>
          <div className="hr-stat-subtext">
            Employees of Lunara Co.
          </div>
          <div className="hr-stat-link">Details &rarr;</div>
        </div>

        <div className="hr-stat-card stat-card-remainingTask" onClick={handleRemainingTasksClick} style={{ cursor: 'pointer' }}>
          <div className="hr-stat-header">
            <h3>Remaining Tasks</h3>
          </div>
          <div className="hr-stat-main">
            <div className="hr-stat-number">{remainingTasks}</div>
            <FaClipboardList className="stat-icon" />
          </div>
          <div className="hr-stat-subtext">In progress tasks</div>
          <div className="hr-stat-link">Progress &rarr;</div>
        </div>

        <div className="hr-stat-card stat-card-completedTask" onClick={handleCompletedTasksClick} style={{ cursor: 'pointer' }}>
          <div className="hr-stat-header">
            <h3>Completed Tasks</h3>
          </div>
          <div className="hr-stat-main">
            <div className="hr-stat-number">{completedTasks}</div>
            <FaTasks className="stat-icon" />
          </div>
          <div className="hr-stat-subtext">Finished tasks</div>
          <div className="hr-stat-link">Details &rarr;</div>
        </div>

        <div className="hr-stat-card stat-card-pendingTasks" 
          onClick={handlePendingTasksClick} style={{ cursor: 'pointer' }}>
          <div className="hr-stat-header">
            <h3>Pending Tasks</h3>
          </div>
          <div className="hr-semi-circle-progress-container">
            <svg
              className="hr-semi-circle-progress"
              width="120"
              height="60"
              viewBox="0 0 120 60"
            >
              <path
                className="hr-progress-bg-semi"
                d="M 10 60 A 50 50 0 0 1 110 60"
                strokeWidth="12"
                fill="none"
              />
              <path
                className="hr-progress-bar-semi"
                d="M 10 60 A 50 50 0 0 1 110 60"
                strokeWidth="12"
                fill="none"
                strokeDasharray="157"
                strokeDashoffset={157 * (1 - progressPercent / 100)}
              />
              <text
                x="60"
                y="45"
                textAnchor="middle"
                dominantBaseline="middle"
                className="hr-progress-text-semi"
              >
                {pendingTaskCount}/{totalTaskCount}
              </text>
            </svg>
          </div>
          <div className="hr-stat-subtext-small">
            Pending Tasks out of Total Tasks
          </div>
          <div className="hr-stat-link-pending">Details &rarr;</div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="hr-charts-tables-row">
        {/* Left Column - Pie Chart and New Hires Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pie Chart for Employees per Department */}
          <div className="hr-pie-chart-container">
            <h3 className="hr-pie-chart-title">Employees by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} employees`, 'Count']}
                  labelFormatter={(name) => `Department: ${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* New Hired Employees Table - Below Pie Chart */}
          <div className="hr-new-hires-container">
            <h3 className="hr-new-hires-title">New Hired Employees</h3>
            <div className="hr-new-hires-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Job Title</th>
                    <th>Hired Date</th>
                  </tr>
                </thead>
                <tbody>
                  {newHiredEmployees.map((employee, index) => (
                    <tr key={index}>
                      <td className="employee-name">{employee.name}</td>
                      <td className="employee-department">{employee.department}</td>
                      <td className="employee-job-title">{employee.jobTitle}</td>
                      <td className="employee-hired-date">
                        {new Date(employee.hiredDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Upcoming Due Date Tasks Table */}
        <div className="hr-tasks-table-container">
          <h3 className="hr-tasks-table-title">Upcoming Due Date Tasks</h3>
          <div className="hr-tasks-table">
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map((task, index) => (
                  <tr key={index}>
                    <td className="task-name">
                      {task.taskName}
                    </td>
                    <td className="task-assigned">{task.assignedTo}</td>
                    <td>
                      <span className={`task-due-date ${getDueDateClass(task.dueDate)}`}>
                        {parseDueDate(task.dueDate)?.toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;