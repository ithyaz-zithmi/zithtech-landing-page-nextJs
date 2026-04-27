'use client';
import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import styles from './ContactForm.module.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    phoneNumber: '',
    companyEmail: '',
    industry: '',
    subject: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const autoSaveTimeoutRef = useRef(null);
  const isAutoSavingRef = useRef(false);
  const formDataRef = useRef(formData);

  // Sync formDataRef with current formData state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Generate or retrieve session ID on component mount
  useEffect(() => {
    const existingSessionId = sessionStorage.getItem('contactFormSessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
      // Load any previously saved data
      loadAutoSavedData(existingSessionId);
    } else {
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      sessionStorage.setItem('contactFormSessionId', newSessionId);
    }
  }, []);

  // Load auto-saved data
  const loadAutoSavedData = async (sessionId) => {
    try {
      const response = await fetch(`/api/contact/autosave?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setFormData({
          companyName: data.data.company_name || '',
          phoneNumber: data.data.phone_number || '',
          companyEmail: data.data.company_email || '',
          industry: data.data.industry || '',
          subject: data.data.subject || '',
        });
      }
    } catch (error) {
      console.error('Error loading auto-saved data:', error);
    }
  };

  // Auto-save function
  const autoSave = async () => {
    const timestamp = Date.now();
    console.log(`Auto-save called at ${timestamp}`);
    
    if (!sessionId) return;

    // Get current form data from ref to avoid stale closure issues
    const currentFormData = formDataRef.current;
    
    // Only auto-save if email or phone is provided
    if (!currentFormData.companyEmail && !currentFormData.phoneNumber) return;

    // Prevent multiple concurrent auto-saves
    if (isAutoSavingRef.current) {
      console.log(`Auto-save already in progress, skipping at ${timestamp}`);
      return;
    }

    isAutoSavingRef.current = true;

    console.log(`Auto-saving data (from ref) at ${timestamp}:`, currentFormData);
    console.log('Phone number in auto-save:', currentFormData.phoneNumber, 'length:', currentFormData.phoneNumber?.length);

    try {
      const response = await fetch('/api/contact/autosave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentFormData,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        console.log(`Form data auto-saved successfully at ${timestamp}`);
      } else {
        const errorData = await response.json();
        console.error(`Auto-save error at ${timestamp}:`, errorData);
      }
    } catch (error) {
      console.error(`Auto-save failed at ${timestamp}:`, error);
    } finally {
      isAutoSavingRef.current = false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Debug logging for phone number input
    if (name === 'phoneNumber') {
      console.log('Phone input change - name:', name, 'value:', value, 'length:', value.length);
      console.log('Event target value:', e.target.value);
    }
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Debug logging for phone number state update
      if (name === 'phoneNumber') {
        console.log('New form data after update:', newData);
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear existing timeout and set new one for auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any pending auto-save to prevent duplicate submissions
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitSuccess(true);

      setFormData({
        companyName: '',
        phoneNumber: '',
        companyEmail: '',
        industry: '',
        subject: '',
      });

      // Clear session storage after successful submission
      sessionStorage.removeItem('contactFormSessionId');
      
      // Generate new session ID for next use
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact" className={styles.floatingContainer}>
      <h2 className={styles.badge}>Get in Touch</h2>

      <div className={styles.contactCard}>
        {/* Left Section: Info */}
        <div className={styles.infoSection}>
          <h1 className={styles.mainTitle}>
            Let&apos;s Talk with <span className={styles.blueText}>Zithtech</span>
          </h1>
          <p className={styles.subText}>
            Start a conversation with Zithtech and explore how we can turn your ideas into scalable
            digital solutions.
          </p>

          <div className={styles.contactDetails}>
            <div className={styles.detailLink}>
              <Icon icon="mdi:email-outline" className={styles.icon} />
              <span>hello@zithtech.com</span>
            </div>
            <div className={styles.detailLink}>
              <Icon icon="mdi:phone-outline" className={styles.icon} />
              <span>80722 55742</span>
            </div>
          </div>

          <div className={styles.joinUsSection}>
  <h3 className={styles.joinTitle}>Join Us</h3>

  <div className={styles.socialRow}>
    <a
      href="https://www.linkedin.com/company/zithtech/"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialLink}
    >
      <Icon icon="mdi:linkedin" color="#0077B5" />
      LinkedIn
    </a>

    {/* <a
      href="https://www.instagram.com/your-instagram"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialLink}
    >
      <Icon icon="mdi:instagram" color="#E4405F" />
      Instagram
    </a> */}
    <span>
                <Icon icon="mdi:instagram" color="#E4405F" /> Instagram
              </span>


  </div>
</div>

        </div>

        {/* Right Section: Form */}
        <div className={styles.formSection}>
          {submitSuccess && (
            <div className={styles.successMessage}>
              Thank you! Your message has been sent successfully.
            </div>
          )}
          {errors.submit && (
            <div className={styles.errorMessage}>
              {errors.submit}
            </div>
          )}
          <form className={styles.gridForm} onSubmit={handleSubmit}>
            <div className={styles.inputBox}>
              <label>
                 Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your Name"
                className={errors.companyName ? styles.inputError : ''}
              />
              {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
            </div>
            <div className={styles.inputBox}>
              <label>
                Phone number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your Phone number"
                className={errors.phoneNumber ? styles.inputError : ''}
              />
              {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
            </div>
            <div className={styles.inputBox}>
              <label>
                 Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="Enter your Email"
                className={errors.companyEmail ? styles.inputError : ''}
              />
              {errors.companyEmail && (
                <span className={styles.errorText}>{errors.companyEmail}</span>
              )}
            </div>
            <div className={styles.inputBox}>
              <label>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Enter your Industry"
              />
            </div>
            <div className={`${styles.inputBox} ${styles.fullWidth}`}>
              <label>Subject</label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter Subject"
                rows="3"
              ></textarea>
            </div>
            <div className={styles.btnWrapper}>
              <button type="submit" className={styles.sendBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;