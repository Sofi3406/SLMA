'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, Coffee } from 'lucide-react';

export default function HulbaragPage() {
  const hulbaragData = {
    name: 'Hulbarag',
    type: 'Rural',
    established: '1995',
    population: '120,000',
    area: '480 km²',
    elevation: '2,300m',
    communities: 12,
    description: 'Hulbarag is a prominent agricultural woreda in Silte Zone, famous for its high-quality coffee production and fertile farmlands in the highland areas.',
    
    highlights: [
      'Major coffee production area',
      'Fertile agricultural lands',
      'Traditional farming methods',
      'Agricultural research station',
      'Coffee processing facilities'
    ],
    
    economicActivities: [
      'Coffee cultivation and processing',
      'Cereal crop production',
      'Horticulture',
      'Livestock rearing',
      'Forestry and beekeeping'
    ],
    
    culturalFeatures: [
      'Coffee ceremony traditions',
      'Harvest celebrations',
      'Traditional farming songs',
      'Agricultural festivals',
      'Land blessing ceremonies'
    ],
    
    developmentProjects: [
      { name: 'Coffee Processing Plant', status: 'Completed' },
      { name: 'Agricultural Training Center', status: 'Ongoing' },
      { name: 'Soil Conservation Program', status: 'Ongoing' },
      { name: 'Rural Road Construction', status: 'Planned' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 333 3333',
      chairman: 'Kassim Ali',
      email: 'hulbarag@siltezone.gov.et'
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
          <h1 className="woreda-title">{hulbaragData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{hulbaragData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{hulbaragData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{hulbaragData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{hulbaragData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{hulbaragData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{hulbaragData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {hulbaragData.highlights.map((highlight, index) => (
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
              {hulbaragData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <Coffee className="icon" />
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
              {hulbaragData.culturalFeatures.map((feature, index) => (
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
              {hulbaragData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {hulbaragData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {hulbaragData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {hulbaragData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View Hulbarag Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}