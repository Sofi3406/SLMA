'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, Music } from 'lucide-react';

export default function SiltiPage() {
  const siltiData = {
    name: 'Silti',
    type: 'Rural',
    established: '1993',
    population: '110,000',
    area: '420 km²',
    elevation: '2,600m',
    communities: 11,
    description: 'Silti is considered the cultural heartland of the Silte people, preserving traditional practices, language, and customs in their most authentic forms.',
    
    highlights: [
      'Cultural preservation center',
      'Traditional language stronghold',
      'Authentic cultural practices',
      'Traditional governance systems',
      'Cultural education programs'
    ],
    
    economicActivities: [
      'Subsistence agriculture',
      'Traditional crafts',
      'Cultural tourism',
      'Language education',
      'Traditional medicine'
    ],
    
    culturalFeatures: [
      'Pure Silte language preservation',
      'Traditional music and dance',
      'Ancient cultural ceremonies',
      'Traditional dispute resolution',
      'Cultural apprenticeship systems'
    ],
    
    developmentProjects: [
      { name: 'Cultural Heritage Center', status: 'Completed' },
      { name: 'Language Documentation Project', status: 'Ongoing' },
      { name: 'Traditional Arts School', status: 'Ongoing' },
      { name: 'Cultural Tourism Development', status: 'Planned' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 666 6666',
      chairman: 'Abdi Mohammed',
      email: 'silti@siltezone.gov.et'
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
          <h1 className="woreda-title">{siltiData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{siltiData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{siltiData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{siltiData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{siltiData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{siltiData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{siltiData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {siltiData.highlights.map((highlight, index) => (
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
              {siltiData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <Music className="icon" />
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
              {siltiData.culturalFeatures.map((feature, index) => (
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
              {siltiData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {siltiData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {siltiData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {siltiData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View Silti Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}