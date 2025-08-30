import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFilter, FaEdit,} from "react-icons/fa";
import EmployeeDetails from "./EmployeeDetails";
import EmployeeUpdateModal from "./Modals/EmployeeUpdateModal";
import AddEmployeeModal from "./Modals/addEmployeeModal";
import "./EmployeeList.css";
import api from "../../api/api";

function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeForUpdate, setSelectedEmployeeForUpdate] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [availableDepartments, setAvailableDepartments] = useState([]);

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(searchLower);
    const matchesDepartment = selectedDepartment === "" || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedDepartment("");
    setIsFilterOpen(false);
  };

  const parseDate = (dateString) => {
    const [month, day, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleEmployeeUpdate = (employeeId, updatedData) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp._id === employeeId 
          ? { ...emp, ...updatedData }
          : emp
      )
    );
    console.log(`Employee ${employeeId} updated with:`, updatedData);
  };

// fetch employees
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/emp-info/all");

      const normalized = data.map((p) => {
        const u = p.userID || {};
        const dept = u.department || {};
        const parents = p.parents || {};
        const emergency = p.emergency || {};

        const fmtMDY = (d) =>
          d ? new Date(d).toLocaleDateString("en-US") : "";
        const fmtLong = (d) =>
          d
            ? new Date(d).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "";
        const title = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

        return {
          // table columns 
          employeeNumber: p.employeeNo || "",
          name: `${p.firstName || ""} ${p.middleName ? p.middleName + " " : ""}${p.lastName || ""}`.trim(),
          email: u.email || "",
          department: dept.departmentName || "",
          jobTitle: u.jobTitle || "",
          hiredDate: fmtMDY(p.hireDate),

          // ids to keep around
          _id: u._id || p._id,     // stable id for row
          userId: u._id,           
          pInfoID: p._id,

          // personal info
          firstName: p.firstName || "",
          middleName: p.middleName || "",
          lastName: p.lastName || "",
          currentRole: title(u.role || "employee"),
          phoneNumber: p.phoneNumber || "",
          gender: title(p.gender || ""),
          age: p.age ?? "",
          birthDate: fmtLong(p.birthDate),
          birthPlace: p.birthPlace || "",
          civilStatus: p.civilStatus || "",
          nationality: p.nationality || "",
          fullAddress: p.fullAddress || "",
          sss: p.sssNo || "",
          tin: p.tinNo || "",
          philhealth: p.philHealthNo || "",
          gsis: p.gsisNo || "",

          // parents info
          motherMaidenName: parents.motherName || "",
          motherPhoneNumber: parents.mPhoneNo || "",
          motherOccupation: parents.mOccupation || "",
          motherStatus: title(parents.mStatus || ""),
          motherAddress: parents.mAddress || "",
          fatherMaidenName: parents.fatherName || "",
          fatherPhoneNumber: parents.fPhoneNo || "",
          fatherOccupation: parents.fOccupation || "",
          fatherStatus: title(parents.fStatus || ""),
          fatherAddress: parents.fAddress || "",

          // emergency info
          contactName: emergency.contactName || "",
          contactPhoneNumber: emergency.contactNo || "",
          contactRelationship: emergency.relationship || "",
        };
      });

      setEmployees(normalized);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  fetchEmployees();
}, []);

// fetch available departments for filter
useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/department");
      const departmentNames = data.map(dept => dept.departmentName).sort();
      setAvailableDepartments(departmentNames);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  fetchDepartments();
}, []);


  // define columns for react-data-table-component with custom sorting
  const columns = [
    {
      name: "Employee No.",
      selector: row => row.employeeNumber,
      sortable: true,
      width: "13%",
      sortFunction: (rowA, rowB) => {
        return rowA.employeeNumber.localeCompare(rowB.employeeNumber);
      },
    },
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
      width: "18%",
      sortFunction: (rowA, rowB) => {
        return rowA.name.localeCompare(rowB.name);
      },
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      width: "20%",
      sortFunction: (rowA, rowB) => {
        return rowA.email.localeCompare(rowB.email);
      },
    },
    {
      name: "Department",
      selector: row => row.department,
      sortable: true,
      width: "13%",
      sortFunction: (rowA, rowB) => {
        return rowA.department.localeCompare(rowB.department);
      },
    },
    {
      name: "Job Title",
      selector: row => row.jobTitle,
      sortable: true,
      width: "15%",
      sortFunction: (a, b) => a.jobTitle.localeCompare(b.jobTitle),
    },
    {
      name: "Hired Date",
      selector: row => row.hiredDate,
      sortable: true,
      width: "11%",
      sortFunction: (rowA, rowB) => {
        const dateA = parseDate(rowA.hiredDate);
        const dateB = parseDate(rowB.hiredDate);
        return dateB - dateA; 
      },
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="employee-actions">
          <button 
            className="employee-action-btn update-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEmployeeForUpdate(row);
              setIsUpdateModalOpen(true);
            }}
            title="Update Employee"
          >
            <FaEdit size={14} />
          </button>
        </div>
      ),
      width: "10%",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#003f7d',
        fontWeight: 'bold',
        color: '#fff',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        minHeight: '55px',
        fontSize: '12px',
        backgroundColor: '#ffffff',
        color: '#000000',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',
      },
    },
  };

  
  const handleRowClicked = (row) => {
    setSelectedEmployee(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="employee-list-container">
      <div className="employee-list-table-container">
        <div className="employee-controls-container">
          <div className="employee-search-container">
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="employee-search-input"
            />
          </div>
          <div className="employee-controls-buttons">
            <button 
              className="employee-add-button"
              onClick={() => setIsAddEmployeeModalOpen(true)}
            >Add Employee
            </button>
            <div className="employee-filter-container">
              <button 
                className={`employee-filter-button ${selectedDepartment ? 'active' : ''}`}
                onClick={toggleFilter}
              >
                <FaFilter />
              </button>
              {isFilterOpen && (
                <div className="employee-filter-dropdown">
                  <div className="employee-filter-dropdown-header">
                    <span>Filter by Department</span>
                    <button 
                      className="employee-clear-filter-btn"
                      onClick={clearFilter}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="employee-filter-options">
                    <div 
                      className={`employee-filter-option ${selectedDepartment === "" ? 'active' : ''}`}
                      onClick={() => handleDepartmentSelect("")}
                    >
                      All Departments
                    </div>
                    {availableDepartments.map(department => (
                      <div 
                        key={department}
                        className={`employee-filter-option ${selectedDepartment === department ? 'active' : ''}`}
                        onClick={() => handleDepartmentSelect(department)}
                      >
                        {department}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredEmployees}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          onRowClicked={handleRowClicked}
          pointerOnHover
        />
      </div>
      {isModalOpen && (
        <EmployeeDetails employee={selectedEmployee} onClose={closeModal} />
      )}
      <EmployeeUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        employee={selectedEmployeeForUpdate}
        onUpdateEmployee={handleEmployeeUpdate}
      />
      {isAddEmployeeModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddEmployeeModalOpen(false)}
          onSave={(newEmployee) => {
            console.log("New employee data:", newEmployee);
            setIsAddEmployeeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default EmployeeList;