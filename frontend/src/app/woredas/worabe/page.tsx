'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, Building, GraduationCap, Activity } from 'lucide-react';

export default function WorabePage() {
  const worabeData = {
    name: 'Worabe',
    type: 'Urban',
    established: '2000',
    population: '85,000',
    area: '250 km²',
    elevation: '1,850m',
    communities: 8,
    description: 'Worabe serves as the capital city and administrative center of Silte Zone, functioning as the economic, cultural, and educational hub for the entire zone.',
    
    highlights: [
      'Capital city of Silte Zone',
      'Administrative headquarters',
      'Educational center',
      'Healthcare facilities',
      'Commercial and business hub'
    ],
    
    economicActivities: [
      'Government administration',
      'Education services',
      'Healthcare services',
      'Commerce and trade',
      'Transportation services'
    ],
    
    culturalFeatures: [
      'Cultural festival host city',
      'Modern urban culture',
      'Educational institutions',
      'Sports facilities',
      'Cultural performance venues'
    ],
    
    institutions: [
      'Silte Zone Administrative Offices',
      'Worabe University',
      'Silte Zone Hospital',
      'Sports Stadium',
      'Cultural Center'
    ],
    
    developmentProjects: [
      { name: 'University Expansion', status: 'Ongoing' },
      { name: 'Hospital Modernization', status: 'Completed' },
      { name: 'City Infrastructure Upgrade', status: 'Ongoing' },
      { name: 'Cultural Center Construction', status: 'Planned' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 888 8888',
      mayor: 'Dr. Ahmed Mohammed',
      email: 'worabe@siltezone.gov.et',
      website: 'www.worabe.gov.et'
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
          <h1 className="woreda-title">{worabeData.name} Woreda</h1>
          <p className="woreda-subtitle">Capital City of Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge capital">{worabeData.type} Woreda & Zone Capital</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{worabeData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{worabeData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{worabeData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{worabeData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{worabeData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {worabeData.highlights.map((highlight, index) => (
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
              {worabeData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <Activity className="icon" />
                  </div>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Institutions */}
          <div className="section">
            <h2>Key Institutions</h2>
            <div className="institutions-grid">
              {worabeData.institutions.map((institution, index) => (
                <div key={index} className="institution-card">
                  <div className="institution-icon">
                    <Building className="icon" />
                  </div>
                  <span>{institution}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Features */}
          <div className="section">
            <h2>Cultural Features</h2>
            <ul className="feature-list">
              {worabeData.culturalFeatures.map((feature, index) => (
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
              {worabeData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {worabeData.contactInfo.woredaOffice}</p>
              <p><strong>Mayor:</strong> {worabeData.contactInfo.mayor}</p>
              <p><strong>Email:</strong> {worabeData.contactInfo.email}</p>
              <p><strong>Website:</strong> {worabeData.contactInfo.website}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/events" className="nav-button primary">
                View Worabe Events →
              </Link>
              <Link href="/contact" className="nav-button primary">
                Visit City Website →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}