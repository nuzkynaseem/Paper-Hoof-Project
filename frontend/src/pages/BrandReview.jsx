import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, CheckCircle2, Calendar as CalendarIcon, Clock, Mail, Check, Loader2 } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import ReadyToMove from '../components/ReadyToMove';
import { DraggableCardContainer, DraggableCardBody } from '../components/ui/draggable-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { API_BASE } from '../utils/api';
import './BrandReview.css';

const defaultBrandCards = [
  {
    title: "Nordic Light",
    minutes: "120 minutes",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
    className: "top-4 left-[1%] md:top-8 md:left-[8%] rotate-[-8deg]"
  },
  {
    title: "Aesop Organics",
    minutes: "120 minutes",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop",
    className: "top-36 left-[1%] md:top-48 md:left-[5%] rotate-[7deg]"
  },
  {
    title: "Lumen Living",
    minutes: "120 minutes",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&auto=format&fit=crop",
    className: "top-4 right-[1%] md:top-8 md:right-[8%] rotate-[10deg]"
  },
  {
    title: "Maison Kith",
    minutes: "120 minutes",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
    className: "top-40 right-[1%] md:top-52 md:right-[5%] rotate-[-6deg]"
  },
  {
    title: "Aura Creative",
    minutes: "120 minutes",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop",
    className: "bottom-4 left-[6%] md:bottom-6 md:left-[20%] rotate-[-5deg]"
  },
  {
    title: "Bare Essence",
    minutes: "120 minutes",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop",
    className: "bottom-4 right-[6%] md:bottom-6 md:right-[20%] rotate-[8deg]"
  }
];

const BrandTiltCardItem = ({ item }) => {
  const cardRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const MAX_TILT = 9;
    el.style.transform = `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) scale(1.04)`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (el) {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  return (
    <DraggableCardBody key={item.title} className={item.className}>
      <div
        ref={cardRef}
        className="brand-tilt-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="brand-card-img-wrapper">
          <img
            src={item.image}
            alt={item.title}
            className="brand-card-img"
          />
        </div>
        <div className="brand-card-footer">
          <h3 className="brand-card-title">{item.title}</h3>
          <span className="brand-card-minutes">{item.minutes}</span>
        </div>
      </div>
    </DraggableCardBody>
  );
};

const BrandReview = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [stepError, setStepError] = useState('');
  const [cardsList, setCardsList] = useState(defaultBrandCards);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_BASE}/brand-review-cards`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const merged = defaultBrandCards.map((def, idx) => {
            const apiCard = data.find((c) => c.cardIndex === idx + 1);
            if (!apiCard) return def;
            return {
              ...def,
              title: apiCard.title || def.title,
              minutes: apiCard.minutes ? `${apiCard.minutes} minutes` : def.minutes,
              image: apiCard.imageUrl || def.image,
            };
          });
          setCardsList(merged);
        }
      }
    } catch (e) {
      console.warn("Using default brand review cards");
    }
  };

  const formSectionRef = useRef(null);

  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);

  // Parallax float for background text
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleHeroMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Fetch booked slots whenever selected date changes
  useEffect(() => {
    if (!formData.date) {
      setBookedSlots([]);
      return;
    }
    const year = formData.date.getFullYear();
    const month = String(formData.date.getMonth() + 1).padStart(2, '0');
    const day = String(formData.date.getDate()).padStart(2, '0');
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
  }, [formData.date]);

  // Calendar Boundaries: Current Date up to 6 Months in the Future
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxSelectableDate = new Date();
  maxSelectableDate.setMonth(maxSelectableDate.getMonth() + 6);
  maxSelectableDate.setHours(23, 59, 59, 999);

  const isDateDisabled = (date) => {
    return date < today || date > maxSelectableDate;
  };

  const isPrevMonthDisabled = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return prev < startOfCurrentMonth;
  };

  const isNextMonthDisabled = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const startOfMaxMonth = new Date(maxSelectableDate.getFullYear(), maxSelectableDate.getMonth(), 1);
    return next > startOfMaxMonth;
  };

  const handlePrevMonth = () => {
    if (!isPrevMonthDisabled()) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (!isNextMonthDisabled()) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

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
    '7:00 PM - 9:00 PM',
    '9:00 PM - 11:00 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (stepError) setStepError('');
  };

  const scrollToFormTop = () => {
    if (formSectionRef.current) {
      const yOffset = -90; // Header navbar offset
      const element = formSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const validateStep1 = () => {
    if (!formData.service || !formData.budget || !formData.hearAbout || !formData.referrer) {
      setStepError('Please select all required options before proceeding.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.company.trim()
    ) {
      setStepError('Please fill in all required fields (First Name, Last Name, Email, Phone, and Company).');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStepError('Please enter a valid email address (e.g. name@company.com).');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setStepError('');

    if (currentStep === 1) {
      if (!validateStep1()) return;
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      scrollToFormTop();
    }
  };

  const handleBack = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToFormTop();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setStepError('');

    if (!validateStep1()) {
      setCurrentStep(1);
      scrollToFormTop();
      return;
    }

    if (!validateStep2()) {
      setCurrentStep(2);
      scrollToFormTop();
      return;
    }

    if (!formData.date || !formData.timeSlot) {
      setSubmitError('Please select both a date and an available time slot.');
      return;
    }

    setIsSubmitting(true);

    const year = formData.date.getFullYear();
    const month = String(formData.date.getMonth() + 1).padStart(2, '0');
    const day = String(formData.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const payload = {
      service: formData.service,
      budget: formData.budget,
      hearAbout: formData.hearAbout,
      referrer: formData.referrer,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      instagram: formData.instagram ? formData.instagram.trim() : '',
      dateStr: dateStr,
      timeSlot: formData.timeSlot,
      notes: formData.notes ? formData.notes.trim() : ''
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

      setIsSubmitted(true);
      setTimeout(() => {
        scrollToFormTop();
      }, 50);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setSubmitError('Unable to connect to the booking server. Please ensure your backend server (port 8000) is running.');
      } else {
        setSubmitError(err.message || 'Error submitting booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleResetFlow = () => {
    setFormData(initialFormData);
    setIsSubmitted(false);
    setSubmitError('');
    setStepError('');
    setCurrentStep(1);
    setTimeout(() => {
      scrollToFormTop();
    }, 50);
  };

  return (
    <div className="brand-review-page">
      {/* Redesigned Hero Section */}
      <section
        className="brand-review-hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <DraggableCardContainer className="hero-draggable-container">
          <div className="hero-center-content">
            <h1 className="brand-review-hero-title">120 minutes</h1>
            <p className="brand-review-hero-description">
              Our Brand Review is a <strong>120-minute</strong> strategic session where we assess, analyze, and align your brand's core story, identity, and long-term potential.
            </p>
          </div>

          {cardsList.map((item) => (
            <BrandTiltCardItem key={item.title} item={item} />
          ))}
        </DraggableCardContainer>
      </section>

      {/* Main Form & Booking Section */}
      <section className="brand-review-form-section" ref={formSectionRef}>
        <div className="form-container">
          {!isSubmitted ? (
            <>
              {/* Stepper Header */}
              <div className="stepper-header">
                <div className="stepper-info">
                  <span className="stepper-badge">SESSION BOOKING</span>
                  <h2 className="stepper-title">Reserve Your Brand Review</h2>
                </div>
                
                <div className="stepper-progress-bar">
                  <div
                    className={`step-pill ${currentStep >= 1 ? 'active' : ''}`}
                    onClick={() => { setStepError(''); setCurrentStep(1); }}
                  >
                    <span className="step-num">01</span>
                    <span className="step-label">Service</span>
                  </div>
                  <div className="step-divider" />
                  <div
                    className={`step-pill ${currentStep >= 2 ? 'active' : ''}`}
                    onClick={() => {
                      if (currentStep > 2) {
                        setStepError('');
                        setCurrentStep(2);
                      } else if (currentStep === 1) {
                        handleNext();
                      }
                    }}
                  >
                    <span className="step-num">02</span>
                    <span className="step-label">Details</span>
                  </div>
                  <div className="step-divider" />
                  <div className={`step-pill ${currentStep >= 3 ? 'active' : ''}`}>
                    <span className="step-num">03</span>
                    <span className="step-label">Schedule</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="brand-review-form" noValidate>
                {/* Step 1: Service Context */}
                {currentStep === 1 && (
                  <div className="form-step">
                    <div className="form-field">
                      <label className="field-label">
                        Select Service *
                        <span className="label-arrow">▸</span>
                      </label>
                      <Select
                        value={formData.service}
                        onValueChange={(val) => {
                          setFormData(prev => ({ ...prev, service: val }));
                          if (stepError) setStepError('');
                        }}
                      >
                        <SelectTrigger className="custom-select-trigger">
                          <SelectValue placeholder="Choose service from dropdown" />
                        </SelectTrigger>
                        <SelectContent className="custom-select-content">
                          {serviceOptions.map((option, index) => (
                            <SelectItem key={index} value={option} className="custom-select-item">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        What's Your Budget *
                        <span className="label-arrow">▸</span>
                      </label>
                      <Select
                        value={formData.budget}
                        onValueChange={(val) => {
                          setFormData(prev => ({ ...prev, budget: val }));
                          if (stepError) setStepError('');
                        }}
                      >
                        <SelectTrigger className="custom-select-trigger">
                          <SelectValue placeholder="Choose budget from dropdown" />
                        </SelectTrigger>
                        <SelectContent className="custom-select-content">
                          {budgetOptions.map((option, index) => (
                            <SelectItem key={index} value={option} className="custom-select-item">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        How Did You Hear Us *
                        <span className="label-arrow">▸</span>
                      </label>
                      <Select
                        value={formData.hearAbout}
                        onValueChange={(val) => {
                          setFormData(prev => ({ ...prev, hearAbout: val }));
                          if (stepError) setStepError('');
                        }}
                      >
                        <SelectTrigger className="custom-select-trigger">
                          <SelectValue placeholder="Choose source from dropdown" />
                        </SelectTrigger>
                        <SelectContent className="custom-select-content">
                          {hearAboutOptions.map((option, index) => (
                            <SelectItem key={index} value={option} className="custom-select-item">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Who Referred Us *
                        <span className="label-arrow">▸</span>
                      </label>
                      <Select
                        value={formData.referrer}
                        onValueChange={(val) => {
                          setFormData(prev => ({ ...prev, referrer: val }));
                          if (stepError) setStepError('');
                        }}
                      >
                        <SelectTrigger className="custom-select-trigger">
                          <SelectValue placeholder="Choose referrer from dropdown" />
                        </SelectTrigger>
                        <SelectContent className="custom-select-content">
                          {referrerOptions.map((option, index) => (
                            <SelectItem key={index} value={option} className="custom-select-item">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {stepError && (
                      <div className="submit-error-banner">
                        {stepError}
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="button" onClick={handleNext} className="btn-next">
                        <span>Next Step</span>
                        <ArrowRight size={18} />
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
                          First Name *
                          <span className="label-arrow">▸</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="field-input"
                          placeholder="Type your first name"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label">
                          Last Name *
                          <span className="label-arrow">▸</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="field-input"
                          placeholder="Type your last name"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label">
                          Email *
                          <span className="label-arrow">▸</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="field-input"
                          placeholder="name@company.com"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label">
                          Phone *
                          <span className="label-arrow">▸</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="field-input"
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label">
                          Company Name *
                          <span className="label-arrow">▸</span>
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="field-input"
                          placeholder="Your brand / business name"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label">
                          Instagram ID <span className="optional-tag">(Optional)</span>
                          <span className="label-arrow">▸</span>
                        </label>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          className="field-input"
                          placeholder="@yourhandle"
                        />
                      </div>
                    </div>

                    {stepError && (
                      <div className="submit-error-banner">
                        {stepError}
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="button" onClick={handleBack} className="btn-back">
                        <ArrowLeft size={18} />
                        <span>Back</span>
                      </button>
                      <button type="button" onClick={handleNext} className="btn-next">
                        <span>Next Step</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Slot Booking */}
                {currentStep === 3 && (
                  <div className="form-step">
                    <div className="booking-section">
                      <div className="form-field calendar-field-wrapper">
                        <label className="field-label-dropdown">
                          Reserve a Date *
                          <span className="label-arrow">▸</span>
                        </label>
                        <div className="calendar-container">
                          {/* Calendar Header */}
                          <div className="calendar-custom-header">
                            <div className="calendar-month-nav">
                              <button
                                type="button"
                                className="calendar-nav-btn"
                                onClick={handlePrevMonth}
                                disabled={isPrevMonthDisabled()}
                                aria-label="Previous month"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <span className="calendar-month-name">
                                {currentMonth.toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <button
                                type="button"
                                className="calendar-nav-btn"
                                onClick={handleNextMonth}
                                disabled={isNextMonthDisabled()}
                                aria-label="Next month"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>

                            <div className="calendar-year-heading">
                              <span className="year-label">YEAR</span>
                              <span className="year-number">{currentMonth.getFullYear()}</span>
                            </div>
                          </div>

                          <Calendar
                            mode="single"
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            selected={formData.date}
                            onSelect={(date) => {
                              setFormData(prev => ({ ...prev, date }));
                              if (submitError) setSubmitError('');
                            }}
                            disabled={isDateDisabled}
                            className="brand-calendar"
                            classNames={{
                              caption_label: "hidden",
                              nav: "hidden",
                              caption: "flex justify-center relative items-center h-0 overflow-hidden"
                            }}
                          />
                          <div className="calendar-timezone">
                            Time zone: IST (GMT +5:30)
                          </div>
                        </div>
                      </div>

                      {formData.date && (
                        <>
                          <div className="selected-date-display">
                            Selected: {formData.date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>

                          <div className="time-slots">
                            {timeSlots.map((slot, index) => {
                              const isBooked = bookedSlots.includes(slot);
                              const isSelected = formData.timeSlot === slot;
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  disabled={isBooked}
                                  className={`time-slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                  onClick={() => {
                                    if (!isBooked) {
                                      setFormData(prev => ({ ...prev, timeSlot: slot }));
                                      if (submitError) setSubmitError('');
                                    }
                                  }}
                                >
                                  <span>{slot}</span>
                                  {isBooked && <span className="booked-badge">Booked</span>}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label-dropdown">
                        Anything you like us to know <span className="optional-tag">(Optional)</span>
                        <span className="label-arrow">▸</span>
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="field-textarea"
                        placeholder="Type additional details or notes here..."
                        rows="4"
                      />
                    </div>

                    {submitError && (
                      <div className="submit-error-banner">
                        {submitError}
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="button" onClick={handleBack} className="btn-back" disabled={isSubmitting}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="btn-submit" disabled={isSubmitting || !formData.date || !formData.timeSlot}>
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Scheduling...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Booking</span>
                            <Check size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

            </>
          ) : (
            /* Booking Confirmation / Success Screen */
            <div className="brand-review-form booking-success-screen">
              <div className="success-icon-ring">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="success-title">Booking Submitted!</h2>
              <p className="success-message">
                Thank you for requesting a Brand Review session. We have received your booking details and our team will get back to you through email within <strong>48 hours</strong>.
              </p>

              <div className="booking-summary-card">
                <div className="summary-row">
                  <span className="summary-label">Service:</span>
                  <span className="summary-value">{formData.service || "Brand Review"}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Date & Time:</span>
                  <span className="summary-value">
                    {formData.date
                      ? `${formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${formData.timeSlot || 'Slot Pending'})`
                      : 'Slot Pending'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email || "Confidential"}</span>
                </div>
                {formData.company && (
                  <div className="summary-row">
                    <span className="summary-label">Company:</span>
                    <span className="summary-value">{formData.company}</span>
                  </div>
                )}
              </div>

              <button type="button" onClick={handleResetFlow} className="btn-done">
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BrandReview;