'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Home, ShoppingBag } from 'lucide-react';

export default function DalochaPage() {
  const dalochaData = {
    name: 'Dalocha',
    type: 'Urban',
    established: '1998',
    population: '65,000',
    area: '180 km²',
    elevation: '1,950m',
    communities: 7,
    description: 'Dalocha is a vibrant market town and commercial hub in Silte Zone, known for its bustling weekly markets and strategic location along trade routes.',
    
    highlights: [
      'Major commercial center for the zone',
      'Famous weekly market (Dalocha Market)',
      'Strategic trade location',
      'Growing small industries',
      'Transportation hub'
    ],
    
    economicActivities: [
      'Commerce and trade',
      'Grain trading',
      'Livestock market',
      'Service sector',
      'Small-scale manufacturing'
    ],
    
    culturalFeatures: [
      'Weekly market cultural exchange',
      'Traditional merchant heritage',
      'Market day celebrations',
      'Multi-ethnic interactions',
      'Trade festival'
    ],
    
    developmentProjects: [
      { name: 'Market Infrastructure Upgrade', status: 'Ongoing' },
      { name: 'Road Access Improvement', status: 'Completed' },
      { name: 'Commercial Bank Branch', status: 'Ongoing' },
      { name: 'Warehouse Facilities', status: 'Planned' }
    ],
    
    contactInfo: {
      woredaOffice: '+251 46 111 1111',
      chairman: 'Ahmed Mohammed',
      email: 'dalocha@siltezone.gov.et'
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
          <h1 className="woreda-title">{dalochaData.name} Woreda</h1>
          <p className="woreda-subtitle">Silte Zone, SNNPR, Ethiopia</p>
          <div className="woreda-badge">{dalochaData.type} Woreda</div>
        </div>

        {/* Main Content */}
        <div className="woreda-content">
          {/* Overview */}
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{dalochaData.description}</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{dalochaData.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{dalochaData.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{dalochaData.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{dalochaData.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {dalochaData.highlights.map((highlight, index) => (
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
              {dalochaData.economicActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">
                    <ShoppingBag className="icon" />
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
              {dalochaData.culturalFeatures.map((feature, index) => (
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
              {dalochaData.developmentProjects.map((project, index) => (
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
              <p><strong>Woreda Office:</strong> {dalochaData.contactInfo.woredaOffice}</p>
              <p><strong>Chairman:</strong> {dalochaData.contactInfo.chairman}</p>
              <p><strong>Email:</strong> {dalochaData.contactInfo.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/woredas" className="nav-button secondary">
              ← Back to All Woredas
            </Link>
            <Link href="/events" className="nav-button primary">
              View Dalocha Events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}