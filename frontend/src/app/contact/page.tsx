'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    woreda: '',
  });

  // Random contact information
  const contactInfo = {
    organization: "Silte Lmat Mehber Association",
    mainOffice: {
      name: "SLMA Headquarters",
      address: "Worabe, Silte Zone, SNNPR, Ethiopia",
      coordinates: "7.8500° N, 38.3333° E"
    },
    contactMethods: [
      {
        title: "General Inquiries",
        contact: "Dr. Shikur Yasin",
        details: "Executive Director",
        icon: <Phone className="method-icon" />,
        link: "tel:+251930670088",
        linkText: "+251 93 067 0088"
      },
      {
        title: "Membership & Registration",
        contact: "Amina Mohammed",
        details: "Membership Coordinator",
        icon: <Mail className="method-icon" />,
        link: "mailto:membership@slma.org",
        linkText: "membership@slma.org"
      },
      {
        title: "Cultural Programs",
        contact: "Sofiya Yasin",
        details: "Cultural Director",
        icon: <Phone className="method-icon" />,
        link: "tel:+251930670088",
        linkText: "+251 93 067 0088"
      },
      {
        title: "Technical Support",
        contact: "Sofiya Yasin",
        details: "IT Manager",
        icon: <Mail className="method-icon" />,
        link: "mailto:support@slma.org",
        linkText: "support@slma.org"
      },
      {
        title: "Media & Press",
        contact: "Sofiya Yasin",
        details: "Communications Officer",
        icon: <Mail className="method-icon" />,
        link: "mailto:press@slma.org",
        linkText: "press@slma.org"
      }
    ],
    officeHours: [
      { day: "Monday - Thursday", time: "8:30 AM - 5:30 PM" },
      { day: "Friday", time: "8:30 AM - 12:30 PM, 2:00 PM - 5:30 PM" },
      { day: "Saturday", time: "9:00 AM - 1:00 PM" },
      { day: "Sunday", time: "Closed" }
    ],
    emergencyContact: {
      text: "For urgent matters outside office hours",
      contact: "+251 93 987 6543",
      available: "24/7 for SLMA members"
    }
  };

  const subjectOptions = [
    "General Inquiry",
    "Membership Registration",
    "Cultural Event Information",
    "Volunteer Opportunity",
    "Partnership Proposal",
    "Technical Support",
    "Media Request",
    "Other"
  ];

  const woredaOptions = [
    "Select Woreda",
    "Worabe",
    "Hulbarag",
    "Sankura",
    "Alicho",
    "Silti",
    "Dalocha",
    "Lanforo",
    "East Azernet Berbere",
    "West Azernet Berbere"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResponse({ 
        type: 'success', 
        message: 'Thank you! Your message has been sent successfully. We will respond within 24-48 hours.' 
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        woreda: '',
      });
      
    } catch (error) {
      setResponse({ 
        type: 'error', 
        message: 'Failed to send message. Please try again or contact us directly.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Get in touch with the Silte Lmat Mehber Association. We're here to help with membership, 
            cultural programs, partnerships, and any questions you may have about our community initiatives.
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info-card">
            <div className="info-header">
              <h2 className="info-title">Get in Touch</h2>
              <p className="info-description">
                Reach out to our dedicated team members for assistance with specific inquiries. 
                We're committed to responding promptly to all community needs.
              </p>
            </div>

            <div className="contact-methods">
              <h3 className="method-title">Contact Our Team</h3>
              <ul className="method-list">
                {contactInfo.contactMethods.map((method, index) => (
                  <li key={index} className="method-item">
                    {method.icon}
                    <div className="method-content">
                      <h4>{method.title}</h4>
                      <p>{method.contact} - {method.details}</p>
                      <a href={method.link} className="method-link">
                        {method.linkText}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="office-hours">
              <h3 className="hours-title">
                <Clock className="method-icon" />
                Office Hours
              </h3>
              <ul className="hours-list">
                {contactInfo.officeHours.map((hours, index) => (
                  <li key={index} className="hours-item">
                    <span className="hours-day">{hours.day}</span>
                    <span className="hours-time">{hours.time}</span>
                  </li>
                ))}
              </ul>
              <p className="address-text" style={{ marginTop: '1rem', color: '#0c4a6e' }}>
                <strong>Emergency Contact:</strong> {contactInfo.emergencyContact.contact}
                <br />
                <small>{contactInfo.emergencyContact.text}</small>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <div className="form-header">
              <h2 className="form-title">Send Us a Message</h2>
              <p className="form-description">
                Fill out the form below and our team will get back to you as soon as possible. 
                All fields marked with * are required.
              </p>
            </div>

            {response && (
              <div className={`response-message response-${response.type}`}>
                {response.type === 'success' ? (
                  <CheckCircle className="method-icon" />
                ) : (
                  <AlertCircle className="method-icon" />
                )}
                <span>{response.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+251 ___ ___ ___"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjectOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Woreda</label>
                  <select
                    name="woreda"
                    value={formData.woreda}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {woredaOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Please provide details about your inquiry..."
                  required
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button-contact"
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="button-icon" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h2 className="map-title">Visit Our Headquarters</h2>
          <div className="map-container">
            <div className="map-placeholder">
              <div style={{ textAlign: 'center' }}>
                <MapPin size={48} style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  SLMA Headquarters
                </h3>
                <p>{contactInfo.mainOffice.address}</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                  {contactInfo.mainOffice.coordinates}
                </p>
              </div>
            </div>
            <div className="map-overlay">
              <div className="map-address">
                <h4 className="address-title">Main Office Location</h4>
                <p className="address-text">
                  {contactInfo.mainOffice.address}
                  <br />
                  <br />
                  <strong>Parking:</strong> Available on-site
                  <br />
                  <strong>Accessibility:</strong> Wheelchair accessible
                </p>
              </div>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.mainOffice.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-button"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}