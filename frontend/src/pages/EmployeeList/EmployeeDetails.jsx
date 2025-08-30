import React, { useState, useEffect } from "react";
import PersonalInfoEdit from "./InfoEditModals/PersonalInfoEdit";
import ParentsInfoEdit from "./InfoEditModals/ParentsInfoEdit";
import EmergencyInfoEdit from "./InfoEditModals/EmergencyInfoEdit";
import "./EmployeeDetails.css";

function EmployeeDetails({ employee, onClose, onSectionUpdate, currentUser }) {
  if (!employee) return null;

function normalizeEmployeeData(data) {
  return {
    ...data,
    sssNo: data.sssNo || data.sss || "",
    tinNo: data.tinNo || data.tin || "",
    philHealthNo: data.philHealthNo || data.philhealth || data.philhealthNo || "",
    gsisNo: data.gsisNo || data.gsis || "",
  };
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

  const [activeEditModal, setActiveEditModal] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(employee);

  useEffect(() => {
    setCurrentEmployee(normalizeEmployeeData(employee));
  }, [employee]);

  const isAdmin = currentUser && currentUser.role === 'Admin';

  const handleSectionUpdate = (employeeId, section, data) => {
    if (section === "emergency") {
      setCurrentEmployee(prev => ({
        ...prev,
        contactName: data.contactName,
        contactPhoneNumber: data.contactNo,
        contactRelationship: data.relationship
      }));
    } else if (section === "parents") {
      setCurrentEmployee(prev => ({
        ...prev,
        motherMaidenName: data.motherName,
        motherPhoneNumber: data.mPhoneNo,
        motherOccupation: data.mOccupation,
        motherStatus: capitalizeFirst(data.mStatus),
        motherAddress: data.mAddress,
        fatherMaidenName: data.fatherName,
        fatherPhoneNumber: data.fPhoneNo,
        fatherOccupation: data.fOccupation,
        fatherStatus: capitalizeFirst(data.fStatus),
        fatherAddress: data.fAddress
      }));
    } else {
      const normalized = normalizeEmployeeData(data);
      setCurrentEmployee((prev) => ({
        ...prev,
        ...normalized
      }));
    }
    setActiveEditModal(null);
  };
  
  const handleEmployeeUpdate = (employeeId, data) => {
    
    setCurrentEmployee(prev => ({
      ...prev,
      ...data
    }));

    if (onSectionUpdate) {
      onSectionUpdate(employeeId, 'employee', data);
    }
  };

  const openSectionEdit = (section) => {
    setActiveEditModal(section);
  };

  const closeSectionEdit = () => {
    setActiveEditModal(null);
  };

  const renderEditIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#666"
      viewBox="0 0 24 24"
      style={{ cursor: 'pointer' }}
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );

  return (
    <>
      {/* Main Employee Details Modal */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
          <div className="employee-modal-container">
            <div className="employee-left-panel">
              <div className="employee-avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100"
                  height="100"
                  fill="#000000"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M12 14c-5 0-9 2.5-9 5v1h18v-1c0-2.5-4-5-9-5z" />
                </svg>
              </div>
              <h2 className="employee-name">{currentEmployee.name}</h2>
              <p className="employee-email">{currentEmployee.email}</p>
              <div className="employee-info-item">
                <label>Employee Number</label>
                <div className="employee-info-value">{currentEmployee.employeeNumber || "N/A"}</div>
              </div>
              <div className="employee-info-item">
                <label>Hired Date</label>
                <div className="employee-info-value">{currentEmployee.hiredDate}</div>
              </div>
              <div className="employee-info-item">
                <label>Job Title</label>
                <div className="employee-info-value">{currentEmployee.jobTitle || "Sales Manager"}</div>
              </div>
              <div className="employee-info-item">
                <label>Department</label>
                <div className="employee-info-value">{currentEmployee.department}</div>
              </div>
              <div className="employee-info-item">
                <label>Current Role</label>
                <div className="employee-info-value">{currentEmployee.currentRole || currentEmployee.role || 'Employee'}</div>
              </div>
            </div>
            <div className="employee-right-panel">
              <div className="section-header-container">
                <div className="section-header">PERSONAL INFORMATION</div>
                <div className="edit-icon" onClick={() => openSectionEdit('personal')}>
                  {renderEditIcon()}
                </div>
              </div>
              <div className="personal-info-grid">
                <div className="input-group medium">
                  <label>First Name</label>
                  <input type="text" value={currentEmployee.firstName || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Middle Name</label>
                  <input type="text" value={currentEmployee.middleName || ""} readOnly />
                </div>
                <div className="input-group wide">
                  <label>Last Name</label>
                  <input type="text" value={currentEmployee.lastName || ""} readOnly />
                </div>
                <div className="input-group narrow">
                  <label>Age</label>
                  <input type="text" value={currentEmployee.age || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Birth Date</label>
                  <input type="text" value={currentEmployee.birthDate || ""} readOnly />
                </div>
                <div className="input-group wide">
                  <label>Birth Place</label>
                  <input type="text" value={currentEmployee.birthPlace || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Civil Status</label>
                  <input type="text" value={currentEmployee.civilStatus || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Nationality</label>
                  <input type="text" value={currentEmployee.nationality || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Gender</label>
                  <input
                    type="text"
                    value={
                      currentEmployee.gender
                        ? currentEmployee.gender.charAt(0).toUpperCase() + currentEmployee.gender.slice(1)
                        : ""
                    } readOnly />
                </div>
                <div className="input-group medium">
                  <label>Phone Number</label>
                  <input type="text" value={currentEmployee.phoneNumber || ""} readOnly />
                </div>
                <div className="input-group full-width">
                  <label>Full Address</label>
                  <input type="text" value={currentEmployee.fullAddress || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Government Number: SSS</label>
                  <input type="text" value={currentEmployee.sssNo || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>TIN</label>
                  <input type="text" value={currentEmployee.tinNo || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>Philhealth</label>
                  <input type="text" value={currentEmployee.philHealthNo || ""} readOnly />
                </div>
                <div className="input-group medium">
                  <label>GSIS</label>
                  <input type="text" value={currentEmployee.gsisNo || ""} readOnly />
                </div>
              </div>

              <div className="section-header-container">
                <div className="section-header">PARENTS INFORMATION</div>
                <div className="edit-icon" onClick={() => openSectionEdit('parents')}>
                  {renderEditIcon()}
                </div>
              </div>
              <div className="parents-info-grid">
                <div className="input-group medium">
                  <label>Mother's Maiden Name</label>
                  <input type="text" value={currentEmployee.motherMaidenName || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" value={currentEmployee.motherPhoneNumber || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Occupation</label>
                  <input type="text" value={currentEmployee.motherOccupation || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <input type="text" value={currentEmployee.motherStatus || ""} readOnly />
                </div>
                <div className="input-group full-width">
                  <label>Address</label>
                  <input type="text" value={currentEmployee.motherAddress || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Father's Maiden Name</label>
                  <input type="text" value={currentEmployee.fatherMaidenName || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" value={currentEmployee.fatherPhoneNumber || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Occupation</label>
                  <input type="text" value={currentEmployee.fatherOccupation || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <input type="text" value={currentEmployee.fatherStatus || ""} readOnly />
                </div>
                <div className="input-group full-width">
                  <label>Address</label>
                  <input type="text" value={currentEmployee.fatherAddress || ""} readOnly />
                </div>
              </div>

              <div className="section-header-container">
                <div className="section-header">EMERGENCY INFORMATION</div>
                <div className="edit-icon" onClick={() => openSectionEdit('emergency')}>
                  {renderEditIcon()}
                </div>
              </div>
              <div className="contact-info-grid">
                <div className="input-group">
                  <label>Name</label>
                  <input type="text" value={currentEmployee.contactName || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" value={currentEmployee.contactPhoneNumber || ""} readOnly />
                </div>
                <div className="input-group">
                  <label>Relationship</label>
                  <input type="text" value={currentEmployee.contactRelationship || ""} readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Edit Modals */}
      {activeEditModal === 'personal' && (
        <PersonalInfoEdit
          employee={currentEmployee}
          onSave={(data) => handleSectionUpdate(currentEmployee._id, "personal", data)}
          onClose={closeSectionEdit}
        />
      )}

      {activeEditModal === 'parents' && (
        <ParentsInfoEdit
          employee={currentEmployee}
          onSave={(data) => handleSectionUpdate(currentEmployee._id, "parents", data)}
          onClose={closeSectionEdit}
        />
      )}

      {activeEditModal === 'emergency' && (
        <EmergencyInfoEdit
          employee={currentEmployee}
          onSave={(data) => handleSectionUpdate(currentEmployee._id, "emergency", data)}
          onClose={closeSectionEdit}
        />
      )}
    </>
  );
}

export default EmployeeDetails;