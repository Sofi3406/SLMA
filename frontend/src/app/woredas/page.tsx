'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Users, 
  Home, 
  Building, 
  Calendar, 
  Search, 
  ArrowRight,
  Target,
  TrendingUp,
  Shield,
  Globe,
  Heart,
  Star
} from 'lucide-react';

export default function WoredasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const woredas = [
    {
      name: 'Worabe city administration',
      slug: 'worabe',
      description: 'Administrative capital and major service center of the zone.',
      type: 'urban',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Alem Gebeya city administration',
      slug: 'alem-gebeya-city-administration',
      description: 'Emerging urban center supporting trade and local services.',
      type: 'urban',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Qbet city administration',
      slug: 'qbet-city-administration',
      description: 'Local city administration focused on public services and markets.',
      type: 'urban',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Tora city administration',
      slug: 'tora-city-administration',
      description: 'Growing city administration with expanding municipal services.',
      type: 'urban',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Dalocha city administration',
      slug: 'dalocha',
      description: 'Commercial city administration and local trading hub.',
      type: 'urban',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Silti woreda',
      slug: 'silti',
      description: 'Woreda with strong cultural heritage and rural livelihoods.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Misraq Silti woreda',
      slug: 'misraq-silti-woreda',
      description: 'Eastern Silti woreda with diverse rural communities.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Lanfro woreda',
      slug: 'lanforo',
      description: 'Highland woreda focused on agriculture and livestock.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Mitto woreda',
      slug: 'mitto-woreda',
      description: 'Rural woreda supporting local farming and community services.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Dalocha woreda',
      slug: 'dalocha-woreda',
      description: 'Woreda surrounding Dalocha with agricultural livelihoods.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Sankura woreda',
      slug: 'sankura',
      description: 'Woreda known for cultural heritage and rural settlements.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Wulbarag woreda',
      slug: 'hulbarag',
      description: 'Woreda with agricultural production and local markets.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Mirab Azernet Berbere woreda',
      slug: 'west-azernet-berbere',
      description: 'Western Azernet Berbere woreda with rural communities.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Misraq Azernet Berbere woreda',
      slug: 'east-azernet-berbere',
      description: 'Eastern Azernet Berbere woreda serving border communities.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    },
    {
      name: 'Alicho Woriro woreda',
      slug: 'alicho',
      description: 'Woreda with rural settlements and community development focus.',
      type: 'rural',
      population: '—',
      established: '—',
      communities: '—',
      area: '—'
    }
  ];

  const filteredWoredas = woredas.filter(woreda => {
    const matchesSearch = woreda.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         woreda.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || woreda.type === selectedType;
    return matchesSearch && matchesType;
  });

  const woredaTypes = [
    { id: 'all', label: 'All Woredas' },
    { id: 'urban', label: 'Urban' },
    { id: 'rural', label: 'Rural' },
    { id: 'mixed', label: 'Mixed' }
  ];

  return (
    <div className="woredas-page">
      <div className="woredas-container">
        {/* Header */}
        <div className="woredas-header">
          <h1 className="woredas-title">Silte Woredas & Communities</h1>
          <p className="woredas-subtitle">
            Discover the unique character and cultural richness of each woreda within the Silte Zone. 
            From urban centers to rural heartlands, every community contributes to our shared heritage.
          </p>
          <p className="woredas-tagline">
            United in diversity, rooted in culture.
          </p>
        </div>

        {/* Community Introduction */}
        <div className="community-intro">
          <div className="intro-content">
            <div className="intro-icon">
              <Heart className="intro-icon-svg" />
            </div>
            <h2 className="intro-title">Our Woredas, Our Strength</h2>
            <p className="intro-description">
              Each woreda in Silte Zone represents a unique chapter in our collective story. 
              Through local governance, cultural preservation, and community development, 
              these administrative units form the backbone of our region's progress and identity.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="woredas-search">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search woredas by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Woreda Type Filter */}
        <div className="woredas-filter">
          <div className="filter-buttons">
            {woredaTypes.map(type => (
              <button
                key={type.id}
                className={`filter-button ${selectedType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Woredas Grid */}
        {filteredWoredas.length > 0 ? (
          <div className="woredas-grid">
            {filteredWoredas.map((woreda) => (
              <Link
                key={woreda.slug}
                href={`/woredas/${woreda.slug}`}
                className="woreda-card"
              >
                <div className="woreda-header">
                  <h3 className="woreda-name">{woreda.name}</h3>
                  <span className={`woreda-type type-${woreda.type}`}>
                    {woreda.type.charAt(0).toUpperCase() + woreda.type.slice(1)}
                  </span>
                </div>
                
                <p className="woreda-description">{woreda.description}</p>
                
                <div className="woreda-stats">
                  <div className="woreda-stat">
                    <Users className="stat-icon" />
                    <span>{woreda.population}</span>
                  </div>
                  <div className="woreda-stat">
                    <Home className="stat-icon" />
                    <span>{woreda.communities} communities</span>
                  </div>
                  <div className="woreda-stat">
                    <Building className="stat-icon" />
                    <span>{woreda.area}</span>
                  </div>
                </div>

                <div className="explore-link">
                  <span className="explore-text">Explore community</span>
                  <ArrowRight className="explore-arrow" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <Search className="no-results-icon" />
            <h3 className="no-results-title">No woredas found</h3>
            <p className="no-results-description">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="cta-button secondary"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Zone Information */}
        <div className="zone-info">
          <div className="zone-info-header">
            <Shield className="zone-info-icon" />
            <h2 className="zone-info-title">Zone Overview</h2>
          </div>
          
          <div className="zone-info-content">
            <div className="info-item">
              <Globe className="info-icon" />
              <div className="info-text">
                <h4>Regional Context</h4>
                <p>The Silte Zone is part of Ethiopia's Southern Nations region, characterized by diverse ecosystems and rich agricultural heritage that sustains our communities.</p>
              </div>
            </div>
            
            <div className="info-item">
              <Users className="info-icon" />
              <div className="info-text">
                <h4>Community Structure</h4>
                <p>Our fifteen woredas encompass hundreds of local communities, each maintaining unique traditions while contributing to our collective development.</p>
              </div>
            </div>
            
            <div className="info-item">
              <Target className="info-icon" />
              <div className="info-text">
                <h4>Development Focus</h4>
                <p>Each woreda follows tailored development strategies addressing local needs while aligning with broader regional growth objectives.</p>
              </div>
            </div>
            
            <div className="info-item">
              <Star className="info-icon" />
              <div className="info-text">
                <h4>Cultural Significance</h4>
                <p>Woredas serve as custodians of local traditions, languages, and practices that form the rich tapestry of Silte cultural identity.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="woredas-cta">
          <h2 className="cta-title">Connect with Your Community</h2>
          <p className="cta-description">
            Find your woreda community, connect with local members, and participate in 
            woreda-specific events and projects that strengthen our collective future.
          </p>
          
          <div className="cta-buttons">
            <Link href="/events" className="cta-button secondary">
              View Woreda Events
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .woredas-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .woredas-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        /* Header */
        .woredas-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .woredas-title {
          font-size: 42px;
          font-weight: 700;
          background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .woredas-subtitle {
          font-size: 18px;
          color: #64748b;
          max-width: 800px;
          margin: 0 auto 15px;
          line-height: 1.6;
        }

        .woredas-tagline {
          font-size: 20px;
          color: #0ea5a4;
          font-weight: 600;
          font-style: italic;
          letter-spacing: 0.5px;
        }

        /* Community Introduction */
        .community-intro {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 50px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .intro-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .intro-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
        }

        .intro-icon-svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .intro-title {
          font-size: 28px;
          color: #0f172a;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .intro-description {
          font-size: 16px;
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        /* Search */
        .woredas-search {
          margin-bottom: 30px;
        }

        .search-container {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          width: 20px;
          height: 20px;
        }

        .search-input {
          width: 100%;
          padding: 16px 20px 16px 50px;
          font-size: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #0f172a;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #0ea5a4;
          box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.1);
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        /* Filter */
        .woredas-filter {
          margin-bottom: 40px;
        }

        .filter-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 12px 24px;
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          background: white;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-button:hover {
          border-color: #0ea5a4;
          color: #0ea5a4;
        }

        .filter-button.active {
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          border-color: #0ea5a4;
          color: white;
          box-shadow: 0 4px 15px rgba(14, 165, 164, 0.3);
        }

        /* Woredas Grid */
        .woredas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
          margin-bottom: 60px;
        }

        .woreda-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          text-decoration: none;
          color: inherit;
        }

        .woreda-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          border-color: #0ea5a4;
        }

        .woreda-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .woreda-name {
          font-size: 22px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .woreda-type {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .type-urban {
          background: rgba(14, 165, 164, 0.1);
          color: #0ea5a4;
        }

        .type-rural {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .type-mixed {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .woreda-description {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .woreda-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .woreda-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px;
          background: #f8fafc;
          border-radius: 10px;
        }

        .stat-icon {
          width: 16px;
          height: 16px;
          color: #0ea5a4;
          margin-bottom: 6px;
        }

        .woreda-stat span {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .explore-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }

        .explore-text {
          font-size: 14px;
          font-weight: 600;
          color: #0ea5a4;
        }

        .explore-arrow {
          width: 16px;
          height: 16px;
          color: #0ea5a4;
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 50px 20px;
          background: white;
          border-radius: 16px;
          margin-bottom: 50px;
          border: 2px dashed #e2e8f0;
        }

        .no-results-icon {
          width: 50px;
          height: 50px;
          color: #94a3b8;
          margin: 0 auto 20px;
        }

        .no-results-title {
          font-size: 22px;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .no-results-description {
          color: #64748b;
          max-width: 400px;
          margin: 0 auto 20px;
        }

        /* Zone Info */
        .zone-info {
          background: white;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 60px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .zone-info-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .zone-info-icon {
          width: 35px;
          height: 35px;
          color: #0ea5a4;
          background: rgba(14, 165, 164, 0.1);
          padding: 8px;
          border-radius: 10px;
        }

        .zone-info-title {
          font-size: 28px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .zone-info-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .info-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: #f1f5f9;
          transform: translateY(-3px);
        }

        .info-icon {
          width: 35px;
          height: 35px;
          color: #0ea5a4;
          flex-shrink: 0;
          padding: 7px;
          background: white;
          border-radius: 10px;
        }

        .info-text h4 {
          font-size: 16px;
          color: #0f172a;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .info-text p {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
          font-size: 14px;
        }

        /* CTA */
        .woredas-cta {
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 20px;
        }

        .cta-title {
          font-size: 32px;
          color: white;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .cta-description {
          font-size: 16px;
          color: #cbd5e1;
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .cta-button {
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          color: white;
          border: none;
        }

        .cta-button.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(14, 165, 164, 0.4);
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .woredas-title {
            font-size: 32px;
          }
          
          .woredas-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-button {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
}