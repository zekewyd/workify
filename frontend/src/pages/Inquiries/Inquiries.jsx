import React, { useState, useEffect} from "react";
import DataTable from "react-data-table-component";
import { FaCheckCircle, FaTimesCircle, FaFilter } from "react-icons/fa";
import ApproveModal from "./Modals/ApproveModal";
import DeclineModal from "./Modals/DeclineModal";
import "./Inquiries.css";
import api from "../../api/api";

const Inquiries = () => {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = ["Pending", "Approved", "Declined"];

  // fetch inquiries
  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const res = await api.get("/inquiries");
        setInquiries(res.data);
      } catch (err) {
        alert("Error fetching inquiries: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  // Filter inquiries based on search term and selected status
  const filteredInquiries = inquiries
    .filter(inquiry => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = inquiry.name.toLowerCase().includes(searchLower);
      const matchesStatus = selectedStatus === "" || inquiry.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // normalize statuses
      const statusA = (a.status || "").toLowerCase();
      const statusB = (b.status || "").toLowerCase();

      // approved/declinec should be at the bottom
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

  // approve inquiry
  const handleApprove = async (inquiry) => {
    try {
      const res = await api.patch(`/inquiries/${inquiry._id}/approve`);
      setInquiries(prev =>
        prev.map(item =>
          item._id === inquiry._id ? { ...item, status: res.data.status, declineNotes: "" } : item
        )
      );
    } catch (err) {
      alert("Error approving inquiry: " + (err.response?.data?.message || err.message));
    }
  };

  // decline inquiry
  const handleDecline = async (inquiry, notes) => {
    try {
      const res = await api.patch(`/inquiries/${inquiry._id}/decline`, { declineNotes: notes });
      setInquiries(prev =>
        prev.map(item =>
          item._id === inquiry._id ? { ...item, status: res.data.status, declineNotes: res.data.declineNotes } : item
        )
      );
    } catch (err) {
      alert("Error declining inquiry: " + (err.response?.data?.message || err.message));
    }
  };

  const openApproveModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsApproveModalOpen(true);
  };

  const openDeclineModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDeclineModalOpen(true);
  };

  const columns = [
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
      width: "15%",
    },
    {
      name: "Request Name",
      selector: row => row.requestName,
      sortable: true,
      width: "15%",
    },
    {
      name: "Type",
      selector: row => row.type,
      sortable: true,
      width: "12%",
    },
    {
      name: "Description",
      selector: row => row.description,
      sortable: true,
      width: "28%",
      wrap: true,
    },
    {
      name: "Status",
      selector: row => row.status,
      center: true,
      width: "15%",
      cell: (row) => (
        <span className={`inquiries-status-badge ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      center: true,
      width: "15%",
      cell: (row) => (
        <div className="flex gap-2 justify-center">
          {row.status === "Pending" && (
            <>
              <button
                className="approve-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openApproveModal(row);
                }}
                title="Approve"
              >
                <FaCheckCircle size={16} />
              </button>
              <button
                className="decline-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeclineModal(row);
                }}
                title="Decline"
              >
                <FaTimesCircle size={16} />
              </button>
            </>
          )}
          {row.status !== "Pending" && (
            <span className="completed">Completed</span>
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

  return (
    <div className="inquiries-container">
      <div className="inquiries-table-container">
        <div className="inquiries-controls-container">
          <div className="inquiries-search-container">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inquiries-search-input"
            />
          </div>
          <div className="inquiries-filter-container">
            <button 
              className={`inquiries-filter-button ${selectedStatus ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="inquiries-filter-dropdown">
                <div className="inquiries-filter-dropdown-header">
                  <span>Filter by Status</span>
                  <button 
                    className="inquiries-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="inquiries-filter-options">
                  <div 
                    className={`inquiries-filter-option ${selectedStatus === "" ? 'active' : ''}`}
                    onClick={() => handleStatusSelect("")}
                  >
                    All Status
                  </div>
                  {statusOptions.map(status => (
                    <div 
                      key={status}
                      className={`inquiries-filter-option ${selectedStatus === status ? 'active' : ''}`}
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

      <ApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        inquiry={selectedInquiry}
        onApprove={handleApprove}
      />

      <DeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        inquiry={selectedInquiry}
        onDecline={handleDecline}
      />
    </div>
  );
};

export default Inquiries;