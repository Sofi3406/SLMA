'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, BookOpen } from 'lucide-react';

export default function SankuraPage() {
  const sankuraData = {
    name: 'Sankura',
    type: 'Rural',
    established: '1992',
    population: '95,000',
    area: '320 km²',
    elevation: '2,400m',
    communities: 10,
    description: 'Sankura is a historic woreda in Silte Zone with rich cultural heritage sites and a long history of traditional leadership and community organization.',
    
    highlights: [
      'Historic cultural heritage sites',
      'Traditional leadership systems',
      'Ancient rock churches',
      'Cultural preservation efforts',
      'Historical documentation center'
    ],
    
    economicActivities: [
      'Mixed agriculture',
      'Cultural tourism',
      'Handicraft production',
      'Historical site maintenance',
      'Traditional medicine'
    ],
    
    culturalFeatures: [
      'Ancient rock-hewn churches',
      'Traditional leadership ceremonies',
      'Historical storytelling traditions',
      'Cultural preservation festivals',
      'Heritage site pilgrimages'
    ],
    
    developmentProjects: [
      { name: 'Heritage Site Restoration', status: 'Ongoing' },
      { name: 'Cultural Museum Construction', status: 'Completed' },
      { name: 'Tourist Information Center', status: 'Planned' },
      { name: 'Traditional Arts School', status: 'Ongoing' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 555 5555',
      chairman: 'Mohammed Ahmed',
      email: 'sankura@siltezone.gov.et'
    }
  };

  return (
    <div className="woreda-page">
      <div className="woreda-container">
        {/* Header */}
        <div className="woreda-header">
          <Link href="/woredas" className="back-link">
            ← Back to All Woredas
          </Link>
          <h1 className="woreda-title">{sankuraData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{sankuraData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{sankuraData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{sankuraData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{sankuraData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{sankuraData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{sankuraData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {sankuraData.highlights.map((highlight, index) => (
                <li key={index} className="feature-item">
                  <div className="feature-bullet"></div>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Economic Activities */}
          <div className="section">
            <h2>Economic Activities</h2>
            <div className="activity-grid">
              {sankuraData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <BookOpen className="icon" />
                  </div>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Features */}
          <div className="section">
            <h2>Cultural Features</h2>
            <ul className="feature-list">
              {sankuraData.culturalFeatures.map((feature, index) => (
                <li key={index} className="feature-item">
                  <div className="feature-bullet"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Development Projects */}
          <div className="section">
            <h2>Development Projects</h2>
            <div className="projects-list">
              {sankuraData.developmentProjects.map((project, index) => (
                <div key={index} className="project-item">
                  <span className="project-name">{project.name}</span>
                  <span className={`project-status status-${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-section">
            <h2>Contact Information</h2>
            <div className="contact-info">
              <p><strong>Woreda Office:</strong> {sankuraData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {sankuraData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {sankuraData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View Sankura Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}