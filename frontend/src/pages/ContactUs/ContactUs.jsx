import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './ContactUs.css';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry_type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '', visible: false });

  React.useEffect(() => {
    emailjs.init('Rs5OPAnW4XL2c7HTJ');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setStatusMessage({ text: '', type: '', visible: false });
    
    const templateParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'Not provided',
      inquiry_type: formData.inquiry_type,
      message: `Type of Inquiry: ${formData.inquiry_type}
      
Phone: ${formData.phone || 'Not provided'}

Message: ${formData.message}`,
      time: new Date().toLocaleString()
    };
    
    try {
      const response = await emailjs.send('service_8h3q289', 'template_s5bcw38', templateParams);
      
      if (response.status === 200) {
        setStatusMessage({
          text: "Thank you! Your message has been sent successfully. We'll get back to you within 24 business hours.",
          type: 'success',
          visible: true
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiry_type: '',
          message: ''
        });
        
      
        setTimeout(() => {
          setStatusMessage(prev => ({ ...prev, visible: false }));
        }, 5000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatusMessage({
        text: 'Sorry, there was an error sending your message. Please try again or contact us directly.',
        type: 'error',
        visible: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Back Link */}
      <a href="/" className="back-link">
        Back
      </a>

      <div className="bg-animations">
        <div className="moving-particle-1"></div>
        <div className="moving-particle-2"></div>
        <div className="moving-particle-3"></div>
        
        <div className="central-ring-1"></div>
        <div className="central-ring-2"></div>
        
        <div className="floating-shapes shape-1"></div>
        <div className="floating-shapes shape-2"></div>
        <div className="floating-shapes shape-3"></div>
        
        <div className="data-stream stream-1"></div>
        <div className="data-stream stream-2"></div>
        <div className="data-stream stream-3"></div>
      </div>

      <div className="container">
        <div className="header">
          <h1></h1>
        </div>
        <div className="content-grid">
       
          {/*Form Section */}
          <div className="form-section">
            <div className="response-badge">Building connections</div>
            
            <h2>Contact Us</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="required">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="inquiry_type">Type of Inquiry <span className="required">*</span></label>
                <select 
                  id="inquiry_type" 
                  name="inquiry_type" 
                  value={formData.inquiry_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Please select...</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Describe Your Issue or Question <span className="required">*</span></label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please provide as much detail as possible to help us assist you better..." 
                  required
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="loading"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message →'
                )}
              </button>
              
              {statusMessage.visible && (
                <div className={`status-message ${statusMessage.type}`}>
                  {statusMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;