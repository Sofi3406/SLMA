'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, TrendingUp } from 'lucide-react';

export default function AlichoPage() {
  const alichoData = {
    name: 'Alicho',
    type: 'Rural',
    established: '2001',
    population: '78,000',
    area: '290 km²',
    elevation: '2,200m',
    communities: 9,
    description: 'Alicho is a developing woreda in Silte Zone known for its agricultural productivity and growing infrastructure. Located in the central part of the zone, it serves as an important agricultural hub.',
    
    highlights: [
      'Major producer of teff, wheat, and barley',
      'Growing educational facilities',
      'Expanding healthcare services',
      'Traditional pottery and handicrafts',
      'Community irrigation projects'
    ],
    
    economicActivities: [
      'Agriculture (cereals, pulses)',
      'Livestock farming',
      'Small-scale trade',
      'Handicraft production',
      'Beekeeping'
    ],
    
    culturalFeatures: [
      'Traditional Alicho music styles',
      'Annual harvest festival',
      'Unique wedding ceremonies',
      'Traditional housing architecture',
      'Local cuisine specialties'
    ],
    
    developmentProjects: [
      { name: 'Alicho Irrigation Scheme', status: 'Ongoing' },
      { name: 'Community Health Center', status: 'Completed' },
      { name: 'Primary School Expansion', status: 'Planned' },
      { name: 'Market Infrastructure', status: 'Ongoing' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 000 0000',
      chairman: 'Mohammed Hassen',
      email: 'alicho@siltezone.gov.et'
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
          <h1 className="woreda-title">{alichoData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{alichoData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{alichoData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{alichoData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{alichoData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{alichoData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{alichoData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {alichoData.highlights.map((highlight, index) => (
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
              {alichoData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <TrendingUp className="icon" />
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
              {alichoData.culturalFeatures.map((feature, index) => (
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
              {alichoData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {alichoData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {alichoData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {alichoData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View Alicho Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}