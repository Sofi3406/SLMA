'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, Award } from 'lucide-react';

export default function WestAzernetBerberePage() {
  const woredaData = {
    name: 'West Azernet Berbere',
    type: 'Rural',
    established: '1997',
    population: '92,000',
    area: '410 km²',
    elevation: '2,000m',
    communities: 10,
    description: 'West Azernet Berbere is a woreda with significant historical landmarks and a rich tradition of community organization and cultural preservation.',
    
    highlights: [
      'Historical landmarks and sites',
      'Traditional community organization',
      'Cultural preservation efforts',
      'Historical documentation',
      'Community development initiatives'
    ],
    
    economicActivities: [
      'Mixed agriculture',
      'Historical site tourism',
      'Community-based enterprises',
      'Traditional crafts',
      'Agricultural processing'
    ],
    
    culturalFeatures: [
      'Historical landmark preservation',
      'Traditional community meetings',
      'Historical storytelling',
      'Cultural landmark festivals',
      'Community heritage programs'
    ],
    
    developmentProjects: [
      { name: 'Historical Site Documentation', status: 'Ongoing' },
      { name: 'Community Center Construction', status: 'Completed' },
      { name: 'Tourist Trail Development', status: 'Planned' },
      { name: 'Traditional Craft Revival', status: 'Ongoing' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 777 7777',
      chairman: 'Yusuf Hassen',
      email: 'westazernet@siltezone.gov.et'
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
          <h1 className="woreda-title">{woredaData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{woredaData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{woredaData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{woredaData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{woredaData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{woredaData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{woredaData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {woredaData.highlights.map((highlight, index) => (
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
              {woredaData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <Award className="icon" />
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
              {woredaData.culturalFeatures.map((feature, index) => (
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
              {woredaData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {woredaData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {woredaData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {woredaData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View {woredaData.name} Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}