import { useEffect, useState } from "react";
import './AttendanceRecord.css';
import api from "../../../api/api";

const AttendanceRecord = () => {
 const [attendanceData, setAttendanceData] = useState([]);

 // fetch attendance
 useEffect(() => {
    api.get("/attendance-logs", { params: { limit: 5 } }) // limit it to 5
      .then(res => {
        // format and calculate hours for each log
        const logs = res.data.map((log) => {
          const calculated = calculateHours(log.clockIn, log.clockOut, log.status);
          // format date as DD-MM-YYYY 
          const formattedDate = log.date
            ? new Date(log.date).toLocaleDateString('en-GB').replace(/\//g, '-')
            : "--";
          return {
            date: formattedDate,
            clockIn: log.clockIn || "--",
            clockOut: log.clockOut || "--",
            status: log.status ? log.status.toUpperCase() : "--",
            totalHours: calculated.totalHrs,
            regularHours: calculated.regularHrs,
            overtime: calculated.overtime,
          };
        });
        setAttendanceData(logs);
      })
      .catch(err => {
        console.error("Error fetching dashboard attendance records:", err);
        setAttendanceData([]);
      });
  }, []);

// calculate hours
const calculateHours = (clockIn, clockOut, status = "PRESENT") => {
  if (clockIn === '--' || clockOut === '--' || !clockIn || !clockOut) {
    return { totalHrs: '0.0', regularHrs: '0.0', overtime: '0.0' };
  }
  const startTime = new Date(`2024-01-01 ${clockIn}`);
  const endTime = new Date(`2024-01-01 ${clockOut}`);
  const diffMs = endTime - startTime;
  const totalHours = diffMs / (1000 * 60 * 60);

  let regularHrs = 8.0;
  if (status.toUpperCase() === "HALF DAY") regularHrs = 4.0;
  if (status.toUpperCase() === "ABSENT" || status.toUpperCase() === "LEAVE") regularHrs = 0;

  const overtime = regularHrs > 0 ? Math.max(0, totalHours - regularHrs) : 0;

  return {
    totalHrs: parseFloat(totalHours.toFixed(1)),
    regularHrs: parseFloat(regularHrs.toFixed(1)),
    overtime: parseFloat(overtime.toFixed(1))
  };
};

  return (
    <div className="card-white">
      <div className="attendance-header">
        <h3 className="attendance-title">Attendance Record</h3>
        <button className="view-all-link">View All</button>
      </div>
      
      <div className="table-header">
        <div>DATE</div>
        <div>CLOCK IN</div>
        <div>CLOCK OUT</div>
        <div>STATUS</div>
        <div>TOTAL HOURS</div>
        <div>REGULAR HOURS</div>
        <div>OVERTIME</div>
      </div>
    
      <div className="table-body">
        {attendanceData.map((record, index) => (
          <div key={index} className="table-row">
            <div>{record.date}</div>
            <div>{record.clockIn}</div>
            <div>{record.clockOut}</div>
            <div>{record.status}</div>
            <div>{record.totalHours}</div>
            <div>{record.regularHours}</div>
            <div>{record.overtime}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceRecord;