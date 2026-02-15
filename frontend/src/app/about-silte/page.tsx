export default function AboutSiltePage() {
  return (
    <div className="about-silte-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">About Us</h1>
          <p className="hero-subtitle">
            Silte Zone Government Communication Affairs Department
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        <div className="content-grid">
          {/* Left Column - Main Content */}
          <div className="main-content">
            {/* About Us */}
            <section className="content-section">
              <h2 className="section-title">About Us</h2>
              <p className="paragraph">
                The Silte Zone Government Communication Affairs Department plays a vital role in fostering
                transparent and effective communication between the local government and the community. This
                department ensures the public is well-informed about government policies, initiatives, and
                activities, promoting transparency and accountability. Through various communication channels,
                the department disseminates crucial information, updates, and announcements to the people,
                helping them stay engaged with ongoing projects and decisions that impact their daily lives.
                Additionally, the department works to strengthen public trust by addressing concerns, answering
                inquiries, and providing accurate and timely information to foster a better understanding of
                government operations. The Communication Affairs Department is committed to enhancing the flow
                of information, building awareness, and supporting the government’s efforts to serve the needs
                of the community more efficiently.
              </p>
            </section>

            {/* Vision */}
            <section className="content-section">
              <h2 className="section-title">Vision</h2>
              <p className="paragraph">
                In the year 2023, the people of our zone will see equality, unity and brotherhood confirmed
                through their shared decision-making, which is rich in information.
              </p>
            </section>

            {/* Mission */}
            <section className="content-section">
              <h2 className="section-title">Mission</h2>
              <p className="paragraph">
                It is to provide access to reliable, high-quality information by establishing a communication
                system that motivates, enhances and benefits the society for universal participation in zonal
                and national issues.
              </p>
            </section>

            {/* Values */}
            <section className="content-section">
              <h2 className="section-title">Values</h2>
              <ul className="economy-list">
                <li className="economy-item">Providing better service</li>
                <li className="economy-item">Develop the ability to be creative and creative</li>
                <li className="economy-item">Respect and unity</li>
                <li className="economy-item">Believing in the victory of ideas</li>
                <li className="economy-item">Cooperation and teamwork</li>
                <li className="economy-item">Leadership skills</li>
                <li className="economy-item">Management and taking responsibility</li>
              </ul>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="sidebar">
            {/* Woredas List */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Silte Woredas</h3>
              <ul className="woredas-list">
                <li className="woreda-item">Worabe (Capital)</li>
                <li className="woreda-item">Hulbarag</li>
                <li className="woreda-item">Sankura</li>
                <li className="woreda-item">Alicho</li>
                <li className="woreda-item">Silti</li>
                <li className="woreda-item">Dalocha</li>
                <li className="woreda-item">Lanforo</li>
                <li className="woreda-item">East Azernet Berbere</li>
                <li className="woreda-item">West Azernet Berbere</li>
              </ul>
            </div>

            {/* Cultural Symbols */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Cultural Symbols</h3>
              <div className="symbols-grid">
                <div className="symbol-item">
                  <div className="symbol-icon">⚫</div>
                  <div className="symbol-name">Enset Tree</div>
                </div>
                <div className="symbol-item">
                  <div className="symbol-icon">⚫</div>
                  <div className="symbol-name">Coffee Plant</div>
                </div>
                <div className="symbol-item">
                  <div className="symbol-icon">⚫</div>
                  <div className="symbol-name">Traditional Weaving</div>
                </div>
                <div className="symbol-item">
                  <div className="symbol-icon">⚫</div>
                  <div className="symbol-name">Round House (Tukul)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Preserve Our Heritage</h2>
          <p className="cta-description">
            Join the Silte Ləmat Mehber in our mission to document, preserve, and celebrate 
            the rich cultural heritage of the Silte people for future generations.
          </p>
          <div className="cta-buttons">
            <a href="/auth/register" className="btn btn-primary">Join Our Community</a>
            <a href="/donate" className="btn btn-outline">Support Our Work</a>
          </div>
        </div>
      </section>
    </div>
  );
}