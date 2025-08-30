import React, { useState, useEffect} from "react";
import DataTable from "react-data-table-component";
import { FaFilter } from "react-icons/fa";
import SubmitInquiryModal from "./Modals/SubmitInquiryModal";
import "./EmployeeInquiries.css";
import api from '../../api/api';

const EmployeeInquiries = () => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [employeeInquiries, setEmployeeInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = ["Pending", "Approved", "Declined"];

  // fetch emp inquiries
  useEffect(() => {
    const fetchEmployeeInquiries = async () => {
      setLoading(true);
      try {
        const res = await api.get("/inquiries"); 
        setEmployeeInquiries(res.data);
      } catch (err) {
        alert("Error fetching your inquiries: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeInquiries();
  }, []);

  const filteredInquiries = employeeInquiries
  .filter(inquiry => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = inquiry.requestName.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatus === "" || inquiry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    const statusA = (a.status || "").toLowerCase();
    const statusB = (b.status || "").toLowerCase();

    // approved/declined shud be at the bottom
    const isAAtBottom = statusA === "approved" || statusA === "declined";
    const isBAtBottom = statusB === "approved" || statusB === "declined";
    if (isAAtBottom && !isBAtBottom) return 1;
    if (!isAAtBottom && isBAtBottom) return -1;

    return 0;
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedStatus("");
    setIsFilterOpen(false);
  };

  const columns = [
    {
      name: "Request Name",
      selector: row => row.requestName,
      sortable: true,
      width: "25%",
    },
    {
      name: "Type",
      selector: row => row.type,
      sortable: true,
      width: "20%",
    },
    {
      name: "Description",
      selector: row => row.description,
      sortable: true,
      width: "35%",
      wrap: true,
    },
    {
      name: "Status",
      selector: row => row.status,
      center: true,
      width: "15%",
      cell: (row) => (
        <span className={`employee-status-badge ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
  ];

  if (loading) return <div>Loading your inquiries...</div>;

  const handleSubmitInquiry = (inquiryData) => {
    const newInquiry = {
      id: employeeInquiries.length + 1,
      requestName: inquiryData.requestName,
      type: inquiryData.type,
      description: inquiryData.description,
      status: "Pending"
    };
    setEmployeeInquiries(prev => [...prev, newInquiry]);
  };

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

  return (
    <div className="employee-inquiries-container">
      <div className="employee-inquiries-table-container">
        <div className="employee-inquiries-controls-container">
          <div className="employee-inquiries-search-container">
            <input
              type="text"
              placeholder="Search by Request Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="employee-inquiries-search-input"
            />
          </div>
          <button 
            className="submit-inquiry-button"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Submit Inquiry
          </button>
          <div className="employee-inquiries-filter-container">
            <button 
              className={`employee-inquiries-filter-button ${selectedStatus ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="employee-inquiries-filter-dropdown">
                <div className="employee-inquiries-filter-dropdown-header">
                  <span>Filter by Status</span>
                  <button 
                    className="employee-inquiries-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="employee-inquiries-filter-options">
                  <div 
                    className={`employee-inquiries-filter-option ${selectedStatus === "" ? 'active' : ''}`}
                    onClick={() => handleStatusSelect("")}
                  >
                    All Status
                  </div>
                  {statusOptions.map(status => (
                    <div 
                      key={status}
                      className={`employee-inquiries-filter-option ${selectedStatus === status ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(status)}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredInquiries}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>

      <SubmitInquiryModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitInquiry}
      />
    </div>
  );
};

export default EmployeeInquiries;