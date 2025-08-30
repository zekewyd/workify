import React, { useState , useEffect} from "react";
import DataTable from "react-data-table-component";
import { FaFilter, FaEdit, FaTrash } from "react-icons/fa";
import "./DepartmentList.css";
import api from "../../api/api";
import AddDepartmentModal from "./Modals/AddDepartmentModal";
import UpdateDepartmentModal from "./Modals/UpdateDepartmentModal";
import AssignDepartmentModal from "./Modals/AssignDepartmentModal";

function DepartmentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDepartmentForUpdate, setSelectedDepartmentForUpdate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/department");

        // ensure consistent formatting 
        const formatted = data.map((dept) => ({
          _id: dept._id || "",
          departmentName: dept.departmentName || "",
          jobTitles: Array.isArray(dept.jobTitles) ? dept.jobTitles : [],
        }));

        setDepartments(formatted);
        setError(null);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError("Failed to load departments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);
  
  const uniqueDepartments = [...new Set(departments.map(dept => dept.departmentName))].sort();

  const filteredDepartments = departments.filter(dept => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      dept.departmentName?.toLowerCase().includes(searchLower) ||
      dept.jobTitles?.some(jobTitle => jobTitle?.toLowerCase().includes(searchLower));
    const matchesDepartment = selectedDepartment === "" || dept.departmentName === selectedDepartment;
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

  const handleAddDepartment = (newDepartment) => {
    setDepartments(prev => [...prev, newDepartment]);
  };

  const handleUpdateDepartment = async (id, updatedData) => {
    try {
      const response = await api.put(`/department/${id}`, updatedData);
      setDepartments(prev => 
        prev.map(dept => dept._id === id ? response.data : dept)
      );
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  };

  const handleDeleteDepartment = (id) => {
    setDepartmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    
    try {
      await api.delete(`/department/${departmentToDelete}`);
      setDepartments(prev => prev.filter(dept => dept._id !== departmentToDelete));
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Error deleting department. Please try again.");
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDepartmentToDelete(null);
  };

  const handleOpenUpdateModal = (department) => {
    setSelectedDepartmentForUpdate(department);
    setIsUpdateModalOpen(true);
  };

  const handleAssignDepartment = (assignmentData) => {
    console.log("Department assigned:", assignmentData);
    
  };

  const columns = [
    {
      name: "Department Name",
      selector: row => row.departmentName,
      sortable: true,
      width: "40%",
      sortFunction: (rowA, rowB) => {
        return rowA.departmentName.localeCompare(rowB.departmentName);
      },
    },
    {
      name: "Job Titles",
      selector: row => row.jobTitles.join(", "),
      sortable: true,
      width: "40%",
      sortFunction: (rowA, rowB) => {
        return rowA.jobTitles.join(", ").localeCompare(rowB.jobTitles.join(", "));
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="department-actions">
          <button 
            className="department-action-btn update-btn"
            onClick={() => handleOpenUpdateModal(row)}
            title="Update Department"
          >
            <FaEdit size={14} />
          </button>
          <button 
            className="department-action-btn delete-btn"
            onClick={() => handleDeleteDepartment(row._id)}
            title="Delete Department"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
      width: "20%",
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

  if (loading) {
    return (
      <div className="department-container">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="department-container">
      <div className="department-table-container">
        <div className="department-controls-container">
          <div className="department-search-container">
            <input
              type="text"
              placeholder="Search by department name or job titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="department-search-input"
            />
          </div>
          <button 
            className="add-department-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Department
          </button>
          <button 
            className="assign-department-button"
            onClick={() => setIsAssignModalOpen(true)}
          >
            Assign Department
          </button>
          <div className="department-filter-container">
            <button 
              className={`department-filter-button ${selectedDepartment ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="department-filter-dropdown">
                <div className="department-filter-dropdown-header">
                  <span>Filter by Department</span>
                  <button 
                    className="department-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="department-filter-options">
                  <div 
                    className={`department-filter-option ${selectedDepartment === "" ? 'active' : ''}`}
                    onClick={() => handleDepartmentSelect("")}
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map((department) => (
                    <div
                      key={department}
                      className={`department-filter-option ${selectedDepartment === department ? 'active' : ''}`}
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
        <DataTable
          columns={columns}
          data={filteredDepartments}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>
      
      <AddDepartmentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDepartment={handleAddDepartment}
      />
      <UpdateDepartmentModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        department={selectedDepartmentForUpdate}
        onUpdateDepartment={handleUpdateDepartment}
      />
      
      <AssignDepartmentModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignDepartment={handleAssignDepartment}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="deleteDept-modal-overlay">
          <div className="deleteDept-modal-content">
            <h3 className="deleteDept-modal-header">Confirm Delete</h3>
            <p>Are you sure you want to delete this department? This action cannot be undone.
            </p>
            <div className="deleteDept-modal-footer">
              <button 
                className="deleteDept-cancel-button" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="deleteDept-save-button" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentList;