import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { timeSlots } from '../mock';
import './BrandReviewForm.css';

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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // This will be replaced with actual API call
    console.log('Form submitted:', formData);
    alert('Thank you! Your brand review request has been submitted. We will contact you soon.');
    onClose();
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
    <div className="brand-review-overlay">
      <div className="brand-review-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title">Brand Review</h2>
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
                {timeSlots.map((slot, index) => (
                  <option key={index} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandReviewForm;