import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFilter, FaEdit, FaBan, FaCheckCircle } from "react-icons/fa";
import AddUserModal from "./Modals/AddUsersModal";
import UserUpdateModal from "./Modals/UpdateUsersModal";
import "./Users.css";
import api from "../../api/api";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const uniqueRoles = [...new Set(users.map(user => user.role))].sort();

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.department?.departmentName?.toLowerCase().includes(searchLower);
    const matchesRole = selectedRole === "" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedRole("");
    setIsFilterOpen(false);
  };

  const handleAddUser = async (newUser) => {
    try {
      const response = await api.post("/users/create", newUser);
      setUsers(prevUsers => [response.data, ...prevUsers]);
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error adding user:", err);
      setError(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const response = await api.put(`/users/${userId}`, updatedData);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? response.data : user
        )
      );
      setIsUpdateModalOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await api.patch(`/users/${userId}/disable`);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isDisabled: true } : user
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error disabling user:", err);
      setError(err.response?.data?.message || "Failed to disable user");
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      const response = await api.put(`/users/${userId}`, { isDisabled: false });
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? response.data : user
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error enabling user:", err);
      setError(err.response?.data?.message || "Failed to enable user");
    }
  };

  const columns = [
    {
      name: "Username",
      selector: row => row.username,
      sortable: true,
      width: "15%",
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      width: "21%",
    },
    {
      name: "Role",
      selector: row => row.role,
      sortable: true,
      width: "12%",
    },
    {
      name: "Department",
      selector: row => row.department?.departmentName || "N/A",
      sortable: true,
      width: "12%",
    },
    {
      name: "Hired Date",
      selector: row => row.createdAt,
      sortable: true,
      width: "12%",
      cell: (row) => (
        <span>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A'}
        </span>
      ),
    },
    {
      name: "Status",
      selector: row => row.isDisabled ? "Disabled" : "Active",
      center: true,
      width: "13%",
      cell: (row) => (
        <span className={`users-status-badge ${row.isDisabled ? 'disabled' : 'active'}`}>
          {row.isDisabled ? "Disabled" : "Active"}
        </span>
      ),
    },
    {
      name: "Action",
      center: true,
      width: "15%",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            style={{
              backgroundColor: '#ff5003',
              color: 'white',
              border: 'none',
              padding: '10px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserForUpdate(row);
              setIsUpdateModalOpen(true);
            }}
          >
            <FaEdit size={14} />
          </button>
          {!row.isDisabled ? (
            <button
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to disable this user?")) {
                  handleDisableUser(row._id);
                }
              }}
            >
              <FaBan size={14} />
            </button>
          ) : (
            <button
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '10px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to enable this user?")) {
                  handleEnableUser(row._id);
                }
              }}
              title="Enable User"
            >
              <FaCheckCircle size={14} />
            </button>
          )}
        </div>
      ),
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
      <div className="users-container">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={fetchUsers}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-table-container">
        <div className="users-controls-container">
          <div className="users-search-container">
            <input
              type="text"
              placeholder="Search by username, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="users-search-input"
            />
          </div>
          <button className="add-user-button" onClick={() => setIsModalOpen(true)}>
            Add Account
          </button>
          <div className="users-filter-container">
            <button 
              className={`users-filter-button ${selectedRole ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="users-filter-dropdown">
                <div className="users-filter-dropdown-header">
                  <span>Filter by Role</span>
                  <button 
                    className="users-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="users-filter-options">
                  <div 
                    className={`users-filter-option ${selectedRole === "" ? 'active' : ''}`}
                    onClick={() => handleRoleSelect("")}
                  >
                    All Roles
                  </div>
                  {uniqueRoles.map(role => (
                    <div 
                      key={role}
                      className={`users-filter-option ${selectedRole === role ? 'active' : ''}`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>

      <UserUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        user={selectedUserForUpdate}
        onUpdateUser={handleUpdateUser}
      />

      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
};

export default Users;