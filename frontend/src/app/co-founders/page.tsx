'use client';

import React, { useEffect, useState } from 'react';

interface CoFounderItem {
  _id: string;
  name: string;
  role: string;
  expertise?: string;
  currentActivity?: string;
  background?: string;
  slmaContribution?: string;
  funFact?: string;
  availability?: 'available' | 'busy' | 'in-meeting' | 'traveling';
  image?: string;
}

// Helper functions
const getAvailabilityText = (status?: 'available' | 'busy' | 'in-meeting' | 'traveling') => {
  switch(status) {
    case 'available': return 'Available for Consult';
    case 'busy': return 'In Clinical Review';
    case 'in-meeting': return 'In Strategy Session';
    case 'traveling': return 'Visiting Partners';
    default: return 'Unavailable';
  }
};

const getAvailabilityClass = (status?: 'available' | 'busy' | 'in-meeting' | 'traveling') => {
  switch(status) {
    case 'available': return 'slma-availability slma-availability-available';
    case 'busy': return 'slma-availability slma-availability-busy';
    case 'in-meeting': return 'slma-availability slma-availability-in-meeting';
    case 'traveling': return 'slma-availability slma-availability-traveling';
    default: return 'slma-availability';
  }
};

export default function SLMACoFoundersPage() {
  const [team, setTeam] = useState<CoFounderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/co-founders`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load co-founders');
        setTeam(data.data || []);
      } catch (error) {
        console.error('Error loading co-founders:', error);
        setTeam([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, []);

  return (
    <div className="slma-cofounders-page">
      <div className="slma-container">
        {/* Header */}
        <div className="slma-header">
          <div className="slma-logo-container">
            <div className="slma-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="slma-title">SLMA <span>Team</span></h1>
          </div>
          
          <p className="slma-subtitle">
            The dedicated team behind <span>Smart Learning Medical Assistant</span>, 
            building AI-powered emergency triage for Ethiopian healthcare.
          </p>
          
          {/* Stats Grid */}
          <div className="slma-stats-grid">
            <div className="slma-stat-card">
              <div className="slma-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="slma-stat-value">10K+</div>
              <div className="slma-stat-label">Patients Served</div>
            </div>
            
            <div className="slma-stat-card">
              <div className="slma-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div className="slma-stat-value">95.2%</div>
              <div className="slma-stat-label">Accuracy Rate</div>
            </div>
            
            <div className="slma-stat-card">
              <div className="slma-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="slma-stat-value">&lt; 45s</div>
              <div className="slma-stat-label">Response Time</div>
            </div>
            
            <div className="slma-stat-card">
              <div className="slma-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="slma-stat-value">5+</div>
              <div className="slma-stat-label">Healthcare Partners</div>
            </div>
            
            <div className="slma-stat-card">
              <div className="slma-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
              <div className="slma-stat-value">1</div>
              <div className="slma-stat-label">Country Served</div>
            </div>
            
            <div className="slma-stat-card">
              <div className="slma-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="slma-stat-value">500+</div>
              <div className="slma-stat-label">Medical Protocols</div>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="slma-cofounders-grid">
          {loading ? (
            <div className="slma-founder-card">
              <div className="slma-card-content">Loading team...</div>
            </div>
          ) : team.length === 0 ? (
            <div className="slma-founder-card">
              <div className="slma-card-content">No co-founders available.</div>
            </div>
          ) : (
            team.map((member) => (
              <div key={member._id} className="slma-founder-card">
              <div className="slma-medical-banner">
                <div className="slma-founder-header">
                  <div className="slma-founder-avatar">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="slma-founder-image" />
                    ) : (
                      <div className="slma-founder-placeholder">👤</div>
                    )}
                  </div>
                  <div>
                    <h2 className="slma-founder-name">{member.name}</h2>
                    <p className="slma-founder-role">{member.role}</p>
                  </div>
                  <div className={getAvailabilityClass(member.availability)}>
                    {getAvailabilityText(member.availability)}
                  </div>
                </div>
              </div>
              
              <div className="slma-card-content">
                <div className="slma-expertise-badge">{member.expertise}</div>
                
                <div className="slma-activity">
                  <h3 className="slma-activity-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Current SLMA Focus
                  </h3>
                  <p className="slma-activity-text">{member.currentActivity}</p>
                </div>
                
                <div className="slma-background-section">
                  <h3 className="slma-section-title">Professional Background</h3>
                  <p className="slma-background-text">{member.background}</p>
                </div>
                
                <div className="slma-contribution">
                  <h3 className="slma-contribution-title">Key SLMA Contribution</h3>
                  <p className="slma-contribution-text">{member.slmaContribution}</p>
                </div>
                
                <div className="slma-fun-fact">
                  <div className="slma-fun-fact-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="slma-fun-fact-content">
                    <h3>Beyond Medicine</h3>
                    <p className="slma-fun-fact-text">{member.funFact}</p>
                  </div>
                </div>
                
                <div className="slma-action-buttons">
                  <button className="slma-primary-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Contact Team Member
                  </button>
                  <button className="slma-secondary-button">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </button>
                </div>
              </div>
              </div>
            ))
          )}
        </div>

        {/* Mission Statement */}
        <div className="slma-mission">
          <div className="slma-mission-content">
            <div className="slma-mission-inner">
              <div className="slma-mission-header">
                <div className="slma-mission-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="slma-mission-title">The SLMA Mission</h2>
              </div>
              
              <div className="slma-mission-grid">
                <div>
                  <p className="slma-mission-text">
                    We built SLMA to bring AI-powered emergency medical support to 
                    Ethiopian healthcare facilities, reducing critical decision time 
                    and improving patient outcomes in resource-limited settings.
                  </p>
                  <div className="slma-principles">
                    <h3 className="slma-principles-title">Core Principles</h3>
                    <ul className="slma-principles-list">
                      <li>
                        <div className="slma-principles-bullet"></div>
                        Evidence-based medical protocols
                      </li>
                      <li>
                        <div className="slma-principles-bullet"></div>
                        Data privacy and security
                      </li>
                      <li>
                        <div className="slma-principles-bullet"></div>
                        Local healthcare integration
                      </li>
                      <li>
                        <div className="slma-principles-bullet"></div>
                        Accessible in rural clinics
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <div className="slma-join-mission">
                    <h3 className="slma-join-title">Join Our Mission</h3>
                    <p className="slma-join-text">
                      We're expanding our team and partnering with 
                      local healthcare providers across Ethiopia.
                    </p>
                    <div className="slma-join-buttons">
                      <button className="slma-join-primary">Partner with SLMA</button>
                      <button className="slma-join-secondary">Healthcare Professional</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
