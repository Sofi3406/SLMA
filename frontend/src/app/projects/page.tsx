"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Heart, 
  ChevronRight,
  Filter,
  Eye,
  Download
} from 'lucide-react';
import { fetchProjects } from '@/lib/projectsApi';

interface ProjectItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location?: string;
  timeline?: string;
  participants?: number;
  progress?: number;
  impact?: string;
  image?: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const projectCategories = [
    { id: 'all', label: 'All Projects' },
    { id: 'culture', label: 'Cultural Preservation' },
    { id: 'education', label: 'Education' },
    { id: 'community', label: 'Community Development' },
    { id: 'youth', label: 'Youth Empowerment' },
    { id: 'heritage', label: 'Heritage Conservation' },
    { id: 'health', label: 'Health & Wellness' }, // Added Health category
  ];

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const params = activeFilter === 'all' ? {} : { category: activeFilter };
        const data = await fetchProjects(params as Record<string, string | number>);
        setProjects(data.data || []);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [activeFilter]);

  const filteredProjects = useMemo(() => projects, [projects]);
  const featuredProject = filteredProjects[0];

  const participationSteps = [
    {
      title: "Browse Projects",
      description: "Explore our current initiatives and find projects that match your interests and skills."
    },
    {
      title: "Register Interest",
      description: "Fill out our volunteer interest form or contact the project coordinator directly."
    },
    {
      title: "Get Trained",
      description: "Participate in orientation and training sessions specific to your chosen project."
    },
    {
      title: "Make Impact",
      description: "Contribute to meaningful community work and see your impact grow."
    }
  ];

  return (
    <div className="projects-page">
      <div className="projects-container">
        {/* Header */}
        <div className="projects-header">
          <h1 className="projects-title">Community Projects & Initiatives</h1>
          <p className="projects-subtitle">
            Discover how SLMA is making a difference through cultural preservation, 
            education, health, and community development projects. Each initiative brings 
            us closer to our vision of a thriving Silte community.
          </p>
          <p className="projects-tagline">
            Building our future, one project at a time.
          </p>
        </div>

        {/* Project Filters */}
        <div className="project-filters">
          <Filter className="w-5 h-5" />
          {projectCategories.map(category => (
            <button
              key={category.id}
              className={`filter-button ${activeFilter === category.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {loading ? (
            <div className="project-card">
              <div className="project-content">
                <p className="project-description">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="project-card">
              <div className="project-content">
                <p className="project-description">No projects available yet.</p>
              </div>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project._id} className="project-card">
                <div className="project-status-container">
                  <span className={`project-status status-${project.status}`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="project-image-container" style={project.image ? { backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                  {!project.image && (
                    <div className="flex items-center justify-center h-full">
                      <div className="project-category">
                        {projectCategories.find(c => c.id === project.category)?.label}
                      </div>
                    </div>
                  )}
                  {project.image && (
                    <div className="project-category">
                      {projectCategories.find(c => c.id === project.category)?.label}
                    </div>
                  )}
                </div>

                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-stats">
                    <div className="stat-item">
                      <MapPin className="stat-icon" />
                      <span>{project.location || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <Users className="stat-icon" />
                      <span>{project.participants || 0} participants</span>
                    </div>
                    <div className="stat-item">
                      <Calendar className="stat-icon" />
                      <span>{project.timeline || 'Ongoing'}</span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{project.progress || 0}% complete</div>
                  </div>

                  <div className="project-actions">
                    <Link href={`/projects/${project._id}`} className="project-button primary">
                      <Eye className="inline w-4 h-4 mr-1" />
                      View Details
                    </Link>
                    <button className="project-button secondary">
                      <Heart className="inline w-4 h-4 mr-1" />
                      Support
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Featured Project */}
        {featuredProject && (
          <div className="featured-projects">
            <div className="featured-header">
              <h2 className="featured-title">Featured Project</h2>
              <p className="featured-subtitle">Our flagship initiative making significant impact</p>
            </div>

            <div className="featured-card">
              <div className="featured-content">
                <span className="featured-badge">Flagship Initiative</span>
                <h3 className="featured-project-title">{featuredProject.title}</h3>
                
                <div className="project-actions">
                  <Link href={`/projects/${featuredProject._id}`} className="project-button primary">
                    Learn More <ChevronRight className="inline w-4 h-4 ml-1" />
                  </Link>
                  <button className="project-button secondary">
                    <Download className="inline w-4 h-4 mr-1" />
                    Download Prospectus
                  </button>
                </div>
              </div>
              
              <div 
                className="featured-image" 
                style={{ backgroundImage: `url(${featuredProject.image || '/images/hayrenzi.jpg'})` }}
              >
                <div className="featured-overlay">
                  <div className="text-white">
                    <div className="text-sm opacity-80">{featuredProject.location || 'Silte Zone'}</div>
                    <div className="text-lg font-semibold">{featuredProject.timeline || 'Ongoing'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How to Participate */}
        <div className="participation-section">
          <div className="participation-header">
            <h2 className="participation-title">Get Involved</h2>
            <p className="participation-description">
              Join us in making a difference. Here's how you can contribute to our community projects
            </p>
          </div>

          <div className="participation-steps">
            {participationSteps.map((step, index) => (
              <div key={index} className="participation-step">
                <div className="step-number"></div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="projects-cta">
          <h2 className="cta-title">Ready to Make an Impact?</h2>
          <p className="cta-description">
            Whether you want to volunteer, donate, or propose a new project, 
            your contribution helps build a stronger Silte community.
          </p>
          
          <div className="cta-buttons">
            <Link href="/volunteer" className="cta-button primary">
              Become a Volunteer
            </Link>
            <Link href="/donate" className="cta-button secondary">
              Support Our Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}