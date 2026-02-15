'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Filter, 
  Camera, 
  Video, 
  Image, 
  Users, 
  MapPin, 
  Calendar,
  Heart,
  MessageCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye,
  Download,
  Share2,
  Building,
  School,
  Utensils,
  Landmark,
  Church,
  Mountain,
  Coffee,
  GraduationCap,
  Stethoscope,
  BookOpen,
  Home
} from 'lucide-react';
import { fetchGalleries } from '@/lib/galleriesApi';

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  location?: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const galleryCategories = [
    { id: 'all', label: 'All Media' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'community', label: 'Community' },
  ];

  const mediaTypes = [
    {
      name: 'Healthcare',
      count: '48',
      icon: <Stethoscope className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: 'Education',
      count: '38',
      icon: <School className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: 'Cultural',
      count: '32',
      icon: <Landmark className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      name: 'Infrastructure',
      count: '41',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-amber-100 text-amber-600'
    }
  ];

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        setLoading(true);
        const params = activeFilter === 'all' ? {} : { category: activeFilter };
        const data = await fetchGalleries(params as Record<string, string>);
        setItems(data.data || []);
      } catch (error) {
        console.error('Error loading galleries:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadGalleries();
  }, [activeFilter]);

  const videos = [
    {
      id: 1,
      title: 'Worabe Hospital Tour',
      duration: '8:45',
      views: '15.2K',
      date: '3 months ago',
      thumbnail: '/images/hospital.jpg',
      category: 'healthcare'
    },
    {
      id: 2,
      title: 'Hayrenzi School Documentary',
      duration: '10:20',
      views: '12.8K',
      date: '2 months ago',
      thumbnail: '/images/hayrenzi.jpg',
      category: 'education'
    },
    {
      id: 3,
      title: 'Worabe University Campus Tour',
      duration: '7:15',
      views: '9.3K',
      date: '1 month ago',
      thumbnail: '/images/worabeUni.jpg',
      category: 'education'
    },
    {
      id: 4,
      title: 'Silte Cultural Heritage',
      duration: '12:30',
      views: '23.5K',
      date: '4 months ago',
      thumbnail: '/images/worabeMusseum.jpg',
      category: 'cultural'
    },
    {
      id: 5,
      title: 'Coffee Farming in Silte',
      duration: '6:15',
      views: '9.7K',
      date: '1 month ago',
      thumbnail: '/images/plant.jpg',
      category: 'community'
    }
  ];

  const galleryStats = [
    { number: '52', label: 'Healthcare Photos' },
    { number: '38', label: 'Education Images' },
    { number: '15', label: 'Video Documentaries' },
    { number: '10,420', label: 'Total Views' }
  ];

  const filteredItems = useMemo(() => items, [items]);

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="gallery-page">
      <style jsx>{`
        .gallery-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .gallery-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        /* Header */
        .gallery-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .gallery-title {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .gallery-subtitle {
          font-size: 18px;
          color: #64748b;
          max-width: 800px;
          margin: 0 auto 15px;
          line-height: 1.6;
        }

        .gallery-tagline {
          font-size: 20px;
          color: #0ea5a4;
          font-weight: 600;
          font-style: italic;
          letter-spacing: 0.5px;
        }

        /* Gallery Stats */
        .gallery-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 60px;
        }

        .gallery-stat {
          background: white;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .gallery-stat:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: #0ea5a4;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        /* Media Categories */
        .gallery-categories {
          margin-bottom: 60px;
        }

        .categories-title {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 40px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .category-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0ea5a4 0%, #0d9488 100%);
        }

        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
        }

        .category-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          color: white;
        }

        .category-name {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .category-count {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        /* Gallery Filters */
        .gallery-filters {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .filter-button {
          padding: 10px 20px;
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

        /* Gallery Grid */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 60px;
        }

        .gallery-item {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
        }

        .gallery-item:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .media-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 2;
        }

        .badge-photo {
          background: rgba(14, 165, 164, 0.9);
          color: white;
        }

        .badge-video {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }

        .badge-album {
          background: rgba(139, 92, 246, 0.9);
          color: white;
        }

        .gallery-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-item:hover .gallery-image {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          padding: 20px;
          color: white;
        }

        .overlay-content {
          transform: translateY(0);
          transition: transform 0.3s ease;
        }

        .overlay-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .overlay-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 15px;
        }

        /* No Media */
        .no-media {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 20px;
          margin-bottom: 60px;
          border: 2px dashed #e2e8f0;
        }

        .no-media-icon {
          width: 64px;
          height: 64px;
          color: #94a3b8;
          margin: 0 auto 20px;
        }

        .no-media-title {
          font-size: 24px;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .no-media-description {
          color: #64748b;
          max-width: 400px;
          margin: 0 auto 24px;
        }

        /* Video Gallery */
        .video-gallery {
          margin-bottom: 60px;
        }

        .video-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .video-title {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .video-subtitle {
          font-size: 16px;
          color: #64748b;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }

        .video-item {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .video-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .video-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .video-thumbnail {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }

        .video-item:hover .video-thumbnail {
          transform: scale(1.05);
        }

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(14, 165, 164, 0.9);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-button:hover {
          background: #0d9488;
          transform: translate(-50%, -50%) scale(1.1);
        }

        .play-icon {
          width: 24px;
          height: 24px;
        }

        .video-content {
          padding: 20px;
        }

        .video-title-small {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .video-meta {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #64748b;
        }

        /* Upload Section */
        .upload-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 24px;
          padding: 50px;
          text-align: center;
          margin-bottom: 60px;
          color: white;
        }

        .upload-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .upload-description {
          font-size: 16px;
          color: #cbd5e1;
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }

        .upload-button {
          padding: 15px 40px;
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .upload-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(14, 165, 164, 0.4);
        }

        /* CTA Section */
        .gallery-cta {
          text-align: center;
          padding: 50px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .cta-title {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .cta-description {
          font-size: 16px;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .cta-button {
          padding: 15px 40px;
          border-radius: 12px;
          font-size: 16px;
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
          box-shadow: 0 10px 25px rgba(14, 165, 164, 0.4);
        }

        .cta-button.secondary {
          background: white;
          color: #0ea5a4;
          border: 2px solid #0ea5a4;
        }

        .cta-button.secondary:hover {
          background: #f0fdfa;
          transform: translateY(-3px);
        }

        /* Buttons */
        .cta-button {
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #0ea5a4 0%, #0d9488 100%);
          color: white;
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-button {
            width: 100%;
            max-width: 300px;
          }
          
          .video-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .gallery-title {
            font-size: 36px;
          }
          
          .gallery-grid {
            grid-template-columns: 1fr;
          }
          
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-button {
            width: 100%;
            max-width: 300px;
          }
          
          .video-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .gallery-container {
            padding: 20px;
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
          }
          
          .gallery-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .gallery-filters {
            justify-content: center;
          }
          
          .upload-section,
          .gallery-cta {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="gallery-container">
        {/* Header */}
        <div className="gallery-header">
          <h1 className="gallery-title">SLMA Visual Archive</h1>
          <p className="gallery-subtitle">
            Explore our collection documenting Silte's development projects, 
            educational institutions, healthcare facilities, and cultural heritage.
          </p>
          <p className="gallery-tagline">
            Documenting progress, celebrating achievements.
          </p>
        </div>

        {/* Gallery Stats */}
        <div className="gallery-stats">
          {galleryStats.map((stat, index) => (
            <div key={index} className="gallery-stat">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Media Categories */}
        <div className="gallery-categories">
          <h2 className="categories-title">Browse by Category</h2>
          <div className="categories-grid">
            {mediaTypes.map((type, index) => (
              <Link 
                key={index}
                href={`/gallery/${type.name.toLowerCase()}`}
                className="category-card"
              >
                <div className="category-icon">
                  {type.icon}
                </div>
                <h3 className="category-name">{type.name}</h3>
                <div className="category-count">{type.count} items</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Gallery Filters */}
        <div className="gallery-filters">
          <Filter className="w-5 h-5" />
          {galleryCategories.map(category => (
            <button
              key={category.id}
              className={`filter-button ${activeFilter === category.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="no-media">
            <Camera className="no-media-icon" />
            <h3 className="no-media-title">Loading Media...</h3>
            <p className="no-media-description">Please wait while we fetch the latest gallery items.</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="gallery-grid">
            {filteredItems.map((item) => (
              <div 
                key={item._id} 
                className="gallery-item"
                onClick={() => openLightbox(item)}
              >
                <div className={`media-badge badge-photo`}>
                  Photo
                </div>
                
                <div className="gallery-image-container">
                  <div 
                    className="gallery-image"
                    style={{
                      backgroundImage: `url(${item.image || '/images/placeholder.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                </div>

                <div className="image-overlay">
                  <div className="overlay-content">
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h4 className="overlay-title">{item.title}</h4>
                      <p className="overlay-description">{item.description || ''}</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye className="w-3 h-3" />
                          <span>{item.category}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {item.location || 'Silte Zone'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-media">
            <Camera className="no-media-icon" />
            <h3 className="no-media-title">No Media Found</h3>
            <p className="no-media-description">
              Try selecting a different category or check back soon for new uploads.
            </p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="cta-button primary"
            >
              View All Media
            </button>
          </div>
        )}

        {/* Video Gallery */}
        <div className="video-gallery">
          <div className="video-header">
            <h2 className="video-title">Documentary Videos</h2>
            <p className="video-subtitle">Watch our video documentaries showcasing SLMA projects and achievements</p>
          </div>

          <div className="video-grid">
            {videos.map((video) => (
              <div key={video.id} className="video-item">
                <div className="video-container">
                  <div 
                    className="video-thumbnail"
                    style={{
                      backgroundImage: `url(${video.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  <button className="play-button">
                    <Play className="play-icon" />
                  </button>
                </div>
                <div className="video-content">
                  <h4 className="video-title-small">{video.title}</h4>
                  <div className="video-meta">
                    <span>{video.duration}</span>
                    <span>{video.views} views</span>
                    <span>{video.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="upload-title">Contribute to Our Archive</h2>
          <p className="upload-description">
            Share your photos and videos of SLMA projects, educational institutions, 
            healthcare facilities, and community events. Help us build the most comprehensive 
            visual archive of Silte development and heritage.
          </p>
          
          <button className="upload-button">
            <Upload className="w-5 h-5" />
            Share Your Media
          </button>
        </div>

        {/* CTA Section */}
        <div className="gallery-cta">
          <h2 className="cta-title">Explore More Collections</h2>
          <p className="cta-description">
            Browse our categorized collections to discover the full scope of SLMA's 
            development projects across Silte Zone.
          </p>
          
          <div className="cta-buttons">
            <Link href="/gallery/education" className="cta-button primary">
              Educational Institutions
            </Link>
            <Link href="/gallery/healthcare" className="cta-button secondary">
              Healthcare Facilities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}