import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import ReadyToMove from '../components/ReadyToMove';
import './BrandReview.css';

const BrandReview = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    budget: '',
    hearAbout: '',
    referrer: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    instagram: '',
    date: null,
    timeSlot: '',
    notes: ''
  });

  const serviceOptions = [
    'Brand Strategy',
    'Visual Identity',
    'Digital Presence',
    'Full Rebrand',
    'Brand Audit',
    'Other'
  ];

  const budgetOptions = [
    'Under $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000+'
  ];

  const hearAboutOptions = [
    'Google Search',
    'Social Media',
    'Referral',
    'Previous Client',
    'Industry Event',
    'Other'
  ];

  const referrerOptions = [
    'Direct Search',
    'Friend/Colleague',
    'Client',
    'Partner Agency',
    'Other'
  ];

  const timeSlots = [
    '7:30 PM - 8:30 PM',
    '8:30 PM - 9:30 PM',
    '9:30 PM - 10:30 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle submission
    alert('Thank you for booking a Brand Review session. We will contact you shortly.');
  };

  return (
    <div className="brand-review-page">
      {/* Hero Section */}
      <section className="brand-review-hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">Brand Review</h1>
            <p className="hero-description">
              Our Brand Review is a <strong>120-minute</strong> strategic session where we step back, assess, and understand your brand as a whole, its story, structure, presence, and potential. Rather than surface-level feedback, we offer considered direction rooted in design thinking, systems, and long-term brand health.
            </p>
          </div>
          <div className="hero-right">
            <div className="hero-time-display">
              <span className="time-number">120</span>
              <span className="time-unit">MINUTES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="brand-review-form-section">
        <div className="form-container">
          {/* Progress Indicator */}
          <div className="progress-indicator">
            <span className="progress-text">Step {currentStep} of 3</span>
          </div>

          <form onSubmit={handleSubmit} className="brand-review-form">
            {/* Step 1: Service Context */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-field">
                  <label className="field-label">
                    Select Service
                    <span className="label-arrow">▸</span>
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="field-select"
                    required
                  >
                    <option value="">Choose the service from dropdown</option>
                    {serviceOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    What's Your Budget
                    <span className="label-arrow">▸</span>
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="field-select"
                    required
                  >
                    <option value="">Choose your budget from dropdown</option>
                    {budgetOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    How Did You Hear Us
                    <span className="label-arrow">▸</span>
                  </label>
                  <select
                    name="hearAbout"
                    value={formData.hearAbout}
                    onChange={handleInputChange}
                    className="field-select"
                    required
                  >
                    <option value="">Choose from dropdown</option>
                    {hearAboutOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Who Referred Us
                    <span className="label-arrow">▸</span>
                  </label>
                  <select
                    name="referrer"
                    value={formData.referrer}
                    onChange={handleInputChange}
                    className="field-select"
                    required
                  >
                    <option value="">Choose the person from dropdown</option>
                    {referrerOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleNext} className="btn-next">
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      First Name
                      <span className="label-arrow">▸</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Type your first name here"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      Last Name
                      <span className="label-arrow">▸</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Type your last name here"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      Email
                      <span className="label-arrow">▸</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Type your email here"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      Phone
                      <span className="label-arrow">▸</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Type your phone number here"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      Company Name
                      <span className="label-arrow">▸</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Type your company name here"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      Instagram ID
                      <span className="label-arrow">▸</span>
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Type your Instagram username"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleBack} className="btn-back">
                    Back
                  </button>
                  <button type="button" onClick={handleNext} className="btn-next">
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Slot Booking */}
            {currentStep === 3 && (
              <div className="form-step">
                <div className="booking-section">
                  <div className="form-field">
                    <label className="field-label-dropdown">
                      Reserve a Date
                      <ChevronRight size={16} className="dropdown-arrow" />
                    </label>
                    <div className="calendar-container">
                      <div className="calendar-header">
                        <button type="button" className="calendar-nav-btn">
                          <ChevronLeft size={20} />
                        </button>
                        <span className="calendar-month">2026 December</span>
                        <button type="button" className="calendar-nav-btn">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                        disabled={(date) => date < new Date()}
                        className="brand-calendar"
                      />
                      <div className="calendar-timezone">
                        Time zone: IST (GMT +5:30)
                      </div>
                    </div>
                  </div>

                  {formData.date && (
                    <>
                      <div className="selected-date-display">
                        {formData.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>

                      <div className="time-slots">
                        {timeSlots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`time-slot-btn ${formData.timeSlot === slot ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label-dropdown">
                    Anything you like us to know
                    <ChevronRight size={16} className="dropdown-arrow" />
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="field-textarea"
                    placeholder="Type here"
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleBack} className="btn-back">
                    Back
                  </button>
                  <button type="submit" className="btn-submit">
                    Submit
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Ready to Move CTA band */}
      <ReadyToMove />
    </div>
  );
};

export default BrandReview;