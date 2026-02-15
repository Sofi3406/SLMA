'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, Mountain } from 'lucide-react';

export default function LanforoPage() {
  const lanforoData = {
    name: 'Lanforo',
    type: 'Rural',
    established: '1994',
    population: '82,000',
    area: '350 km²',
    elevation: '2,800m',
    communities: 8,
    description: 'Lanforo is a highland woreda in Silte Zone known for its rugged mountainous terrain, livestock farming, and scenic landscapes.',
    
    highlights: [
      'Highland livestock farming',
      'Scenic mountainous landscapes',
      'Traditional pastoral lifestyle',
      'Sheep and cattle breeding',
      'Cold climate agriculture'
    ],
    
    economicActivities: [
      'Livestock production (sheep, cattle)',
      'Potato and barley farming',
      'Wool and leather products',
      'Highland beekeeping',
      'Eco-tourism potential'
    ],
    
    culturalFeatures: [
      'Highland pastoral traditions',
      'Mountain festival celebrations',
      'Traditional wool weaving',
      'Livestock blessing ceremonies',
      'Highland music and dance'
    ],
    
    developmentProjects: [
      { name: 'Livestock Health Program', status: 'Ongoing' },
      { name: 'Mountain Road Construction', status: 'Completed' },
      { name: 'Wool Processing Facility', status: 'Planned' },
      { name: 'Highland Agriculture Research', status: 'Ongoing' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 444 4444',
      chairman: 'Hassen Mohammed',
      email: 'lanforo@siltezone.gov.et'
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
          <h1 className="woreda-title">{lanforoData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{lanforoData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{lanforoData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{lanforoData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{lanforoData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{lanforoData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{lanforoData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {lanforoData.highlights.map((highlight, index) => (
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
              {lanforoData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <Mountain className="icon" />
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
              {lanforoData.culturalFeatures.map((feature, index) => (
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
              {lanforoData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {lanforoData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {lanforoData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {lanforoData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View Lanforo Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}