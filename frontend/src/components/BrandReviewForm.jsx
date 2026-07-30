import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import './BrandReviewForm.css';

const modalTimeSlots = [
  '7:00 PM - 9:00 PM',
  '9:00 PM - 11:00 PM'
];

const BrandReviewForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    date: null,
    timeSlot: ''
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const fetchBookedSlots = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${backendUrl}/api/bookings/booked-slots?date=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data.bookedSlots || []);
        }
      } catch (err) {
        console.warn("Could not fetch booked slots:", err);
      }
    };
    fetchBookedSlots();
  }, [selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedDate || !formData.timeSlot) {
      setSubmitError('Please select both a meeting date and time slot.');
      return;
    }

    setIsSubmitting(true);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const nameParts = (formData.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
      service: 'Brand Review',
      budget: 'N/A',
      hearAbout: 'Website Modal',
      referrer: 'Direct',
      firstName: firstName,
      lastName: lastName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      instagram: '',
      dateStr: dateStr,
      timeSlot: formData.timeSlot,
      notes: formData.message
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to submit booking');
      }

      alert('Thank you! Your brand review meeting has been scheduled and sync\'d with Google Calendar.');
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Error scheduling meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: date
    });
  };

  return (
    <div className="brand-review-overlay" role="dialog" aria-modal="true" aria-labelledby="brand-review-title">
      <div className="brand-review-modal">
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close brand review modal"
        >
          <X size={24} aria-hidden="true" />
        </button>

        <div className="modal-header">
          <h2 id="brand-review-title" className="modal-title">Brand Review</h2>
          <p className="modal-subtitle">Let's discuss your brand. Schedule a meeting with us.</p>
        </div>

        <form className="brand-review-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company" className="form-label">Company Name *</label>
              <input
                type="text"
                id="company"
                name="company"
                className="form-input"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">Tell us about your project *</label>
            <textarea
              id="message"
              name="message"
              className="form-textarea"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Meeting Date *</label>
              <div className="calendar-wrapper">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className="brand-review-calendar"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timeSlot" className="form-label">Select Time Slot *</label>
              <select
                id="timeSlot"
                name="timeSlot"
                className="form-select"
                value={formData.timeSlot}
                onChange={handleChange}
                required
              >
                <option value="">Choose a time</option>
                {modalTimeSlots.map((slot, index) => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <option key={index} value={slot} disabled={isBooked}>
                      {slot} {isBooked ? '(Booked)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {submitError && (
            <div className="submit-error-banner" style={{ marginTop: '12px', color: '#DC2626', fontSize: '0.85rem' }}>
              {submitError}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting || !selectedDate || !formData.timeSlot}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                'Schedule Meeting'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandReviewForm;