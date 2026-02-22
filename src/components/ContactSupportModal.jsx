import { useState, useEffect } from 'react';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Textarea } from './common/Textarea';
import { contactAPI } from '../services/api';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactSupportModal({ isOpen, onClose, user = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [submissionState, setSubmissionState] = useState({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });

  // Pre-fill form for authenticated users
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Handle escape key press and body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !submissionState.isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, submissionState.isSubmitting, onClose]);

  const handleClose = () => {
    if (!submissionState.isSubmitting) {
      onClose();
      // Reset form after closing
      setTimeout(() => {
        setFormData({
          name: user?.username || '',
          email: user?.email || '',
          message: ''
        });
        setErrors({ name: '', email: '', message: '' });
        setSubmissionState({ isSubmitting: false, isSuccess: false, error: null });
      }, 300);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for email field
    if (field === 'email') {
      if (value && !emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } else {
      // Clear error when user starts typing in other fields
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate message
    if (!formData.message || !formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Set loading state and disable submit button
    setSubmissionState({
      isSubmitting: true,
      isSuccess: false,
      error: null
    });

    try {
      // Call API service to send contact message
      await contactAPI.sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      });

      // Display success message
      setSubmissionState({
        isSubmitting: false,
        isSuccess: true,
        error: null
      });

      // Auto-close modal after 2 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      // Display error message on failure with retry capability
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Failed to send message. Please try again.';
      
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: errorMessage
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
          <button
            onClick={handleClose}
            disabled={submissionState.isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submissionState.isSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-sm text-gray-600">
                Thank you for contacting us. We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Your name"
                required
                error={errors.name}
                disabled={submissionState.isSubmitting}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="your.email@example.com"
                required
                error={errors.email}
                disabled={submissionState.isSubmitting}
              />

              <Textarea
                label="Message"
                value={formData.message}
                onChange={(value) => handleInputChange('message', value)}
                placeholder="Describe your issue or question..."
                required
                rows={6}
                maxLength={2000}
                showCharCount={true}
                error={errors.message}
                disabled={submissionState.isSubmitting}
              />

              {submissionState.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submissionState.error}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!submissionState.isSuccess && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={submissionState.isSubmitting}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={handleSubmit}
              disabled={submissionState.isSubmitting}
              fullWidth
            >
              {submissionState.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
