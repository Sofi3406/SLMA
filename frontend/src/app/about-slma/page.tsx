export default function AboutSLMAPage() {
  return (
    <div className="about-slma-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Silte Lmat Mehber (SLMA)</h1>
          <p className="hero-subtitle">Building Our Community, Shaping Our Future</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h2 className="mission-title">Our Mission</h2>
              <p className="mission-description">
                To unite the Silte diaspora and local community in sustainable development initiatives 
                that preserve our cultural heritage while advancing education, healthcare, and 
                economic opportunities for all Silte people.
              </p>
            </div>
            
            <div className="vision-card">
              <div className="vision-icon">🌟</div>
              <h2 className="vision-title">Our Vision</h2>
              <p className="vision-description">
                A prosperous, educated, and culturally vibrant Silte community where every member 
                has access to quality healthcare, education, and economic opportunities while 
                maintaining strong connections to our rich heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        <div className="content-wrapper">
          {/* Organization History */}
          <section className="content-section">
            <h2 className="section-title">Our Story</h2>
            
            <div className="history-content">
              <p className="paragraph">
                Silte Lmat Mehber (SLMA) was founded in 1998 by visionary Silte community leaders 
                who recognized the need for organized development efforts to address the challenges 
                facing our people. What began as a small initiative has grown into one of the most 
                impactful community organizations in the region.
              </p>
              
              <div className="milestone-timeline">
                <div className="milestone">
                  <div className="milestone-year">1998</div>
                  <div className="milestone-content">
                    <h3 className="milestone-title">Foundation</h3>
                    <p>
                      SLMA was established by Silte intellectuals and business leaders with 
                      the goal of channeling diaspora resources into community development projects.
                    </p>
                  </div>
                </div>
                
                <div className="milestone">
                  <div className="milestone-year">2005</div>
                  <div className="milestone-content">
                    <h3 className="milestone-title">First Major Project</h3>
                    <p>
                      Construction of Worabe Comprehensive Secondary School, providing quality 
                      education to over 1,500 students annually.
                    </p>
                  </div>
                </div>
                
                <div className="milestone">
                  <div className="milestone-year">2012</div>
                  <div className="milestone-content">
                    <h3 className="milestone-title">Healthcare Initiative</h3>
                    <p>
                      Launch of the healthcare development program, culminating in the 
                      Worabe Comprehensive Hospital project.
                    </p>
                  </div>
                </div>
                
                <div className="milestone">
                  <div className="milestone-year">2020</div>
                  <div className="milestone-content">
                    <h3 className="milestone-title">Digital Transformation</h3>
                    <p>
                      Expansion into digital platforms and establishment of scholarship 
                      programs for STEM education.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Major Achievements */}
          <section className="content-section">
            <h2 className="section-title">Transformative Projects</h2>
            <p className="section-intro">
              Through the collective efforts of our community members worldwide, SLMA has delivered 
              life-changing infrastructure and programs across the Silte Zone:
            </p>
            
            <div className="projects-grid">
              {/* Worabe Hospital */}
              <div className="project-card">
                <div className="project-image">
                  <div className="image-placeholder">🏥</div>
                </div>
                <div className="project-content">
                  <h3 className="project-title">Worabe Comprehensive Hospital</h3>
                  <div className="project-stats">
                    <span className="stat">200+ Beds</span>
                    <span className="stat">50 Doctors</span>
                    <span className="stat">24/7 Service</span>
                  </div>
                  <p className="project-description">
                    State-of-the-art medical facility providing specialized healthcare services 
                    including surgery, maternity, pediatrics, and emergency care to over 500,000 
                    people in the region.
                  </p>
                  <div className="project-impact">
                    <strong>Impact:</strong> Reduced maternal mortality by 60%, increased 
                    healthcare access by 300%
                  </div>
                </div>
              </div>
              
              {/* Hayrenzi School */}
              <div className="project-card">
                <div className="project-image">
                  <div className="image-placeholder">🏫</div>
                </div>
                <div className="project-content">
                  <h3 className="project-title">Hayrenzi Special Secondary & Preparatory School</h3>
                  <div className="project-stats">
                    <span className="stat">2,000 Students</span>
                    <span className="stat">Science Focus</span>
                    <span className="stat">95% Pass Rate</span>
                  </div>
                  <p className="project-description">
                    Premier educational institution with advanced science laboratories, 
                    computer centers, and library facilities, producing top-performing 
                    students in national examinations.
                  </p>
                  <div className="project-impact">
                    <strong>Impact:</strong> 500+ university admissions annually, 
                    national ranking in top 10%
                  </div>
                </div>
              </div>
              
              {/* Water Projects */}
              <div className="project-card">
                <div className="project-image">
                  <div className="image-placeholder">💧</div>
                </div>
                <div className="project-content">
                  <h3 className="project-title">Clean Water Initiative</h3>
                  <div className="project-stats">
                    <span className="stat">50+ Villages</span>
                    <span className="stat">Deep Wells</span>
                    <span className="stat">Piping Systems</span>
                  </div>
                  <p className="project-description">
                    Comprehensive water supply projects providing clean drinking water 
                    to remote communities, reducing waterborne diseases and improving 
                    quality of life.
                  </p>
                  <div className="project-impact">
                    <strong>Impact:</strong> 100,000+ people served, 80% reduction in 
                    water-related illnesses
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ongoing Projects */}
          <section className="content-section">
            <h2 className="section-title">Current Initiatives</h2>
            
            <div className="initiatives-grid">
              <div className="initiative-card">
                <h3 className="initiative-title">Digital Library Project</h3>
                <p className="initiative-description">
                  Establishing modern digital libraries in all woredas with internet access, 
                  computers, and e-learning resources.
                </p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '75%'}}></div>
                  <span className="progress-text">75% Complete</span>
                </div>
              </div>
              
              <div className="initiative-card">
                <h3 className="initiative-title">Youth Entrepreneurship Program</h3>
                <p className="initiative-description">
                  Training and startup funding for young Silte entrepreneurs in technology, 
                  agriculture, and manufacturing.
                </p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '60%'}}></div>
                  <span className="progress-text">60% Complete</span>
                </div>
              </div>
              
              <div className="initiative-card">
                <h3 className="initiative-title">Cultural Heritage Center</h3>
                <p className="initiative-description">
                  Construction of a center to document, preserve, and showcase Silte 
                  history, language, and traditions.
                </p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '40%'}}></div>
                  <span className="progress-text">40% Complete</span>
                </div>
              </div>
            </div>
          </section>

          {/* Organizational Structure */}
          <section className="content-section">
            <h2 className="section-title">How We Work</h2>
            
            <div className="structure-diagram">
              <div className="structure-level">
                <div className="level-title">General Assembly</div>
                <div className="level-description">All registered members • Annual meeting</div>
              </div>
              
              <div className="structure-arrow">↓</div>
              
              <div className="structure-level">
                <div className="level-title">Board of Directors</div>
                <div className="level-description">9 elected members • Strategic oversight</div>
              </div>
              
              <div className="structure-arrow">↓</div>
              
              <div className="structure-level">
                <div className="level-title">Executive Committee</div>
                <div className="level-description">Day-to-day operations • Project implementation</div>
              </div>
              
              <div className="structure-arrow">↓</div>
              
              <div className="structure-level">
                <div className="level-title">Project Committees</div>
                <div className="level-description">Specialized teams • Woreda representatives</div>
              </div>
            </div>
            
            <div className="committee-grid">
              <div className="committee">
                <h4 className="committee-title">Education Committee</h4>
                <p>School construction, scholarships, teacher training</p>
              </div>
              <div className="committee">
                <h4 className="committee-title">Healthcare Committee</h4>
                <p>Hospital projects, medical supplies, health awareness</p>
              </div>
              <div className="committee">
                <h4 className="committee-title">Infrastructure Committee</h4>
                <p>Roads, water, electricity, community buildings</p>
              </div>
              <div className="committee">
                <h4 className="committee-title">Cultural Committee</h4>
                <p>Heritage preservation, language, festivals, documentation</p>
              </div>
            </div>
          </section>

          {/* Impact Statistics */}
          <section className="stats-section">
            <h2 className="section-title text-center">Our Impact in Numbers</h2>
            
            <div className="impact-stats">
              <div className="impact-stat">
                <div className="stat-number">25+</div>
                <div className="stat-label">Major Projects Completed</div>
              </div>
              
              <div className="impact-stat">
                <div className="stat-number">$15M+</div>
                <div className="stat-label">Total Investment</div>
              </div>
              
              <div className="impact-stat">
                <div className="stat-number">500,000+</div>
                <div className="stat-label">People Served</div>
              </div>
              
              <div className="impact-stat">
                <div className="stat-number">9</div>
                <div className="stat-label">Woredas Covered</div>
              </div>
              
              <div className="impact-stat">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Members Worldwide</div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">Be Part of Our Journey</h2>
              <p className="cta-description">
                Join thousands of Silte community members who are building a better future 
                for our people. Your contribution—whether time, expertise, or resources—makes 
                a real difference.
              </p>
              
              <div className="cta-buttons">
                <a href="/membership" className="btn btn-primary">Join SLMA Today</a>
                <a href="/donate" className="btn btn-secondary">Support Our Projects</a>
                <a href="/projects" className="btn btn-outline">View All Projects</a>
              </div>
              
              <div className="testimonial">
                <p className="testimonial-text">
                  "SLMA has transformed our community. The hospital saved my daughter's life, 
                  and the school is educating our future leaders. I'm proud to be a member."
                </p>
                <div className="testimonial-author">
                  <strong>Ahmed Mohammed</strong>, Worabe Resident & SLMA Member
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}