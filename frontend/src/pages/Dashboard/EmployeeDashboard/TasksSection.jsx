import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import './TasksSection.css';
import api from "../../../api/api";

const TasksSection = () => {
  const [tasks, setTasks] = useState([]);

  // fetch emp tasks
  useEffect(() => {
    api.get("/tasks") 
      .then(res => {
        let fetchedTasks = res.data.map(task => {
          // use completionDate if completed, otherwise dueDate
          let displayDate;
          if (task.status && task.status.toLowerCase() === "completed" && task.completionDate) {
            displayDate = new Date(task.completionDate).toLocaleDateString("en-GB");
          } else {
            displayDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB") : "--";
          }

          return {
            id: task._id,
            title: task.taskName || task.title,
            date: displayDate,
            status: task.status ? task.status.toLowerCase() : "pending"
          };
        });

        // sort: in progress > pending > completed
        fetchedTasks = fetchedTasks.sort((a, b) => {
          const statusOrder = { "in progress": 1, "pending": 2, "completed": 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setTasks(fetchedTasks.slice(0, 5));
      })
      .catch(err => {
        setTasks([]);
      });
  }, []);

  // count only pending and in progress for header
  const activeCount = tasks.filter(
    t => t.status === "in progress" || t.status === "pending"
  ).length;

  // if no active tasks, display completed tasks instead
  const displayTasks = activeCount > 0
    ? tasks.filter(t => t.status !== "completed")
    : tasks.filter(t => t.status === "completed").slice(0, 5);

  return (
    <div className="card-white">
      <div>
        <h3 className="tasks-title">Tasks ({activeCount})</h3>
        <div className="tasks-list">
          {displayTasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                {task.status === "completed" && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="task-date">{task.date}</div>
              {(task.status === "in progress" || task.status === "pending") && (
                <div className="task-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: task.status === "in progress" ? "50%" : "90%",
                        background: task.status === "pending" ? "#002347" : undefined,
                      }}
                    ></div>
                  </div>
                  <span
                    className="progress-status"
                    style={{
                      color: task.status === "pending" ? "#002347" : undefined,
                    }}
                  >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksSection;