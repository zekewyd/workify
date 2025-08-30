import React, { useState, useEffect } from 'react';
import './addEmployeeModal.css';
import api from "../../../api/api";

const AddEmployeeModal = ({ onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    hireDate: '',
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    birthDate: '',
    birthPlace: '',
    civilStatus: '',
    nationality: '',
    gender: '',
    phoneNumber: '',
    fullAddress: '',
    sssNo: '',
    tinNo: '',
    philHealthNo: '',
    gsisNo: '',
    motherName: '',
    mPhoneNo: '',
    mOccupation: '',
    mStatus: '',
    mAddress: '',
    fatherName: '',
    fPhoneNo: '',
    fOccupation: '',
    fStatus: '',
    fAddress: '',
    contactName: '',
    contactNo: '',
    relationship: ''
  });

  // fetch users
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const { data } = await api.get("/users");
        setUsers(data.filter(u => u.role === "employee"));
      } catch (err) {
        console.log("Error loading users:", err);
        setUsers([]);
      }
      setLoadingUsers(false);
    }
    fetchUsers();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.username.trim()) {
          newErrors.username = 'This is a required field';
        }
        break;
      case 2:
        if (!formData.hireDate.trim()) {
          newErrors.hireDate = 'This is a required field';
        }
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'This is a required field';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'This is a required field';
        }
        if (!formData.age.trim()) {
          newErrors.age = 'This is a required field';
        }
        if (!formData.birthDate.trim()) {
          newErrors.birthDate = 'This is a required field';
        }
        if (!formData.civilStatus.trim()) {
          newErrors.civilStatus = 'This is a required field';
        }
        if (!formData.nationality.trim()) {
          newErrors.nationality = 'This is a required field';
        }
        if (!formData.gender.trim()) {
          newErrors.gender = 'This is a required field';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'This is a required field';
        }
        if (!formData.fullAddress.trim()) {
          newErrors.fullAddress = 'This is a required field';
        }
        break;
      case 3:
        if (!formData.motherName.trim()) {
          newErrors.motherName = 'This is a required field';
        }
        if (!formData.mPhoneNo.trim()) {
          newErrors.mPhoneNo = 'This is a required field';
        }
        if (!formData.fatherName.trim()) {
          newErrors.fatherName = 'This is a required field';
        }
        if (!formData.fPhoneNo.trim()) {
          newErrors.fPhoneNo = 'This is a required field';
        }
        break;
      case 4:
        if (!formData.contactName.trim()) {
          newErrors.contactName = 'This is a required field';
        }
        if (!formData.contactNo.trim()) {
          newErrors.contactNo = 'This is a required field';
        }
        if (!formData.relationship.trim()) {
          newErrors.relationship = 'This is a required field';
        }
        break;
      default:
        break;
    }
    
    return newErrors;
  };

  const handleNext = (e) => {
    e && e.preventDefault();
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0 && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e) => {
    e && e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const stepErrors = validateStep(currentStep);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSave = async (e) => {
    e && e.preventDefault();
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length > 0) {
      return;
    }

    const selectedUser = users.find(u => u.username === formData.username);

    if (!selectedUser) {
      alert("Selected username is not valid");
      return;
    }

    // map request body
    const payload = {
      userID: selectedUser._id,
      personalInfo: {
        hireDate: formData.hireDate,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        age: formData.age,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace,
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        nationality: formData.nationality,
        fullAddress: formData.fullAddress,
        sssNo: formData.sssNo,
        tinNo: formData.tinNo,
        philHealthNo: formData.philHealthNo,
        gsisNo: formData.gsisNo
      },
      parentsInfo: {
        motherName: formData.motherName,
        mPhoneNo: formData.mPhoneNo,
        mOccupation: formData.mOccupation,
        mAddress: formData.mAddress,
        mStatus: formData.mStatus,
        fatherName: formData.fatherName,
        fPhoneNo: formData.fPhoneNo,
        fOccupation: formData.fOccupation,
        fAddress: formData.fAddress,
        fStatus: formData.fStatus
      },
      emergencyInfo: {
        contactName: formData.contactName,
        contactNo: formData.contactNo,
        relationship: formData.relationship
      }
    };

    try {
      const { data } = await api.post("/emp-info/create", payload);
      if (onSave) onSave(data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add employee.");
    }
  };

  return (
    <div className="addEmployee-modal-overlay">
      <div className="addEmployee-modal-container">
        <div className="addEmployee-modal-header">
          <h2>Add Employee</h2>
          <button className="addEmployee-close-button" onClick={onClose}>×</button>
        </div>

        <div className="addEmployee-steps-indicator">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`addEmployee-step ${currentStep >= step ? 'active' : ''}`}
            >
              <span className="addEmployee-step-number">{step}</span>
               <span className="addEmployee-step-label">
                {step === 1 && 'Employee Information'}
                {step === 2 && 'Personal Information'}
                {step === 3 && 'Parents Information'}
                {step === 4 && 'Emergency Information'}
              </span>
            </div>
          ))}
        </div>

        <div className="addEmployee-modal-content">
          {currentStep === 1 && (
            <div className="addEmployee-step-content">
              <div className="addEmployee-form-group">
                <label>Username <span className="required">*</span></label>
                <select
                  value={formData.username}
                  onChange={e => handleInputChange("username", e.target.value)}
                  disabled={loadingUsers}
                  className={errors.username ? 'error' : ''}
                >
                  <option value="">-- Select --</option>
                  {users.map(user => (
                    <option key={user._id} value={user.username}>{user.username}</option>
                  ))}
                </select>
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="addEmployee-step-content">
              {/* Row 0: Hire Date */}
              <div className="addEmployee-form-group">
                <label>Hire Date <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={e => handleInputChange('hireDate', e.target.value)}
                  className={errors.hireDate ? 'error' : ''}
                />
                {errors.hireDate && <span className="error-message">{errors.hireDate}</span>}
              </div>

              {/* Row 1: First, Middle, Last Name */}
              <div className="addEmployee-form-row">
                <div className="addEmployee-form-group">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="addEmployee-form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={e => handleInputChange('middleName', e.target.value)}
                  />
                </div>
                <div className="addEmployee-form-group">
                  <label>Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              {/* Row 2: age, birthday, birthplace */}
              <div className="addEmployee-form-row">
                <div className="addEmployee-form-group">
                  <label>Age <span className="required">*</span></label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => handleInputChange('age', e.target.value)}
                    className={errors.age ? 'error' : ''}
                  />
                  {errors.age && <span className="error-message">{errors.age}</span>}
                </div>
                <div className="addEmployee-form-group">
                  <label>Birth Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => handleInputChange('birthDate', e.target.value)}
                    className={errors.birthDate ? 'error' : ''}
                  />
                  {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                </div>
                <div className="addEmployee-form-group">
                  <label>Birth Place</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={e => handleInputChange('birthPlace', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Civil Status, Nationality */}
              <div className="addEmployee-form-row">
                <div className="addEmployee-form-group">
                  <label>Civil Status <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.civilStatus}
                    onChange={e => handleInputChange('civilStatus', e.target.value)}
                    className={errors.civilStatus ? 'error' : ''}
                  />
                  {errors.civilStatus && <span className="error-message">{errors.civilStatus}</span>}
                </div>
                <div className="addEmployee-form-group">
                  <label>Nationality <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={e => handleInputChange('nationality', e.target.value)}
                    className={errors.nationality ? 'error' : ''}
                  />
                  {errors.nationality && <span className="error-message">{errors.nationality}</span>}
                </div>
              </div>

              {/* Row 4: Gender, Phone Number */}
              <div className="addEmployee-form-row">
                <div className="addEmployee-form-group">
                  <label>Gender <span className="required">*</span></label>
                  <div className="gender-radio-group">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={e => handleInputChange('gender', e.target.value)}
                      />
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={e => handleInputChange('gender', e.target.value)}
                      />
                      Female
                    </label>
                  </div>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>
                <div className="addEmployee-form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => handleInputChange('phoneNumber', e.target.value)}
                    className={errors.phoneNumber ? 'error' : ''}
                  />
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                </div>
              </div>

              {/* Row 5: Full Address */}
              <div className="addEmployee-form-group">
                <label>Full Address <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.fullAddress}
                  onChange={e => handleInputChange('fullAddress', e.target.value)}
                  className={errors.fullAddress ? 'error' : ''}
                />
                {errors.fullAddress && <span className="error-message">{errors.fullAddress}</span>}
              </div>

              {/* Row 6: SSS, TIN */}
              <div className="addEmployee-form-row">
                <div className="addEmployee-form-group">
                  <label>SSS No.</label>
                  <input
                    type="text"
                    value={formData.sssNo}
                    onChange={e => handleInputChange('sssNo', e.target.value)}
                  />
                </div>
                <div className="addEmployee-form-group">
                  <label>TIN No.</label>
                  <input
                    type="text"
                    value={formData.tinNo}
                    onChange={e => handleInputChange('tinNo', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 7: Philhealth, GSIS */}
              <div className="addEmployee-form-row">
                <div className="addEmployee-form-group">
                  <label>Philhealth No.</label>
                  <input
                    type="text"
                    value={formData.philHealthNo}
                    onChange={e => handleInputChange('philHealthNo', e.target.value)}
                  />
                </div>
                <div className="addEmployee-form-group">
                  <label>GSIS No.</label>
                  <input
                    type="text"
                    value={formData.gsisNo}
                    onChange={e => handleInputChange('gsisNo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="addEmployee-step-content">
              <h4>Mother's Information</h4>
              <div className="addEmployee-form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={e => handleInputChange('motherName', e.target.value)}
                  className={errors.motherName ? 'error' : ''}
                />
                {errors.motherName && <span className="error-message">{errors.motherName}</span>}
              </div>
              <div className="addEmployee-form-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  value={formData.mPhoneNo}
                  onChange={e => handleInputChange('mPhoneNo', e.target.value)}
                  className={errors.mPhoneNo ? 'error' : ''}
                />
                {errors.mPhoneNo && <span className="error-message">{errors.mPhoneNo}</span>}
              </div>
              <div className="addEmployee-form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.mOccupation}
                  onChange={e => handleInputChange('mOccupation', e.target.value)}
                />
              </div>
              <div className="addEmployee-form-group">
                <label>Status</label>
                <input
                  type="text"
                  value={formData.mStatus}
                  onChange={e => handleInputChange('mStatus', e.target.value)}
                />
              </div>
              <div className="addEmployee-form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.mAddress}
                  onChange={e => handleInputChange('mAddress', e.target.value)}
                />
              </div>

              <h4>Father's Information</h4>
              <div className="addEmployee-form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={e => handleInputChange('fatherName', e.target.value)}
                  className={errors.fatherName ? 'error' : ''}
                />
                {errors.fatherName && <span className="error-message">{errors.fatherName}</span>}
              </div>
              <div className="addEmployee-form-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  value={formData.fPhoneNo}
                  onChange={e => handleInputChange('fPhoneNo', e.target.value)}
                  className={errors.fPhoneNo ? 'error' : ''}
                />
                {errors.fPhoneNo && <span className="error-message">{errors.fPhoneNo}</span>}
              </div>
              <div className="addEmployee-form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.fOccupation}
                  onChange={e => handleInputChange('fOccupation', e.target.value)}
                />
              </div>
              <div className="addEmployee-form-group">
                <label>Status</label>
                <input
                  type="text"
                  value={formData.fStatus}
                  onChange={e => handleInputChange('fStatus', e.target.value)}
                />
              </div>
              <div className="addEmployee-form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.fAddress}
                  onChange={e => handleInputChange('fAddress', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="addEmployee-step-content">
              <div className="addEmployee-form-group">
                <label>Contact Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={e => handleInputChange('contactName', e.target.value)}
                  className={errors.contactName ? 'error' : ''}
                />
                {errors.contactName && <span className="error-message">{errors.contactName}</span>}
              </div>
              <div className="addEmployee-form-group">
                <label>Emergency Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  value={formData.contactNo}
                  onChange={e => handleInputChange('contactNo', e.target.value)}
                  className={errors.contactNo ? 'error' : ''}
                />
                {errors.contactNo && <span className="error-message">{errors.contactNo}</span>}
              </div>
              <div className="addEmployee-form-group">
                <label>Relationship <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={e => handleInputChange('relationship', e.target.value)}
                  className={errors.relationship ? 'error' : ''}
                />
                {errors.relationship && <span className="error-message">{errors.relationship}</span>}
              </div>
            </div>
          )}
        </div>

        <div className="addEmployee-modal-footer">
          <div className="addEmployee-footer-buttons">
            {currentStep > 1 && (
              <button className="addEmployee-btn-secondary" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="addEmployee-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            {currentStep < 4 ? (
              <button
                className="addEmployee-btn-primary"
                onClick={handleNext}
              >
                Next
             </button>
            ) : (
              <button
                className="addEmployee-btn-primary"
                onClick={handleSave}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;