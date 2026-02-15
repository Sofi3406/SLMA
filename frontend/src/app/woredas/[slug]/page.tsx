import Link from 'next/link';
import { MapPin, Users, Calendar, Home } from 'lucide-react';

const woredaDetails: Record<string, {
  name: string;
  subtitle: string;
  type: string;
  description: string;
  population: string;
  area: string;
  communities: string;
  established: string;
  highlights: string[];
}> = {
  'worabe-city-administration': {
    name: 'Worabe City Administration',
    subtitle: 'Administrative capital of Silte Zone',
    type: 'City Administration',
    description: 'Worabe City Administration serves as the administrative capital and major service center of the zone, providing governance, commerce, and public services for surrounding communities.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Zone administration hub', 'Public services center', 'Commerce and markets']
  },
  'alem-gebeya-city-administration': {
    name: 'Alem Gebeya City Administration',
    subtitle: 'Urban service and market center',
    type: 'City Administration',
    description: 'Alem Gebeya City Administration supports local markets, municipal services, and community development initiatives.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Municipal services', 'Local trade center', 'Community development']
  },
  'qbet-city-administration': {
    name: 'Qbet City Administration',
    subtitle: 'Urban administration and services',
    type: 'City Administration',
    description: 'Qbet City Administration focuses on urban services, infrastructure, and local economic activity.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Urban services', 'Infrastructure development', 'Local economy support']
  },
  'tora-city-administration': {
    name: 'Tora City Administration',
    subtitle: 'Growing municipal center',
    type: 'City Administration',
    description: 'Tora City Administration is a growing municipal center delivering administrative services and supporting local commerce.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Administrative services', 'Local commerce', 'Urban growth']
  },
  'dalocha-city-administration': {
    name: 'Dalocha City Administration',
    subtitle: 'Commercial city administration',
    type: 'City Administration',
    description: 'Dalocha City Administration serves as a commercial hub with municipal services and public administration for residents.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Commercial hub', 'Municipal services', 'Public administration']
  },
  'silti-woreda': {
    name: 'Silti Woreda',
    subtitle: 'Rural woreda with cultural heritage',
    type: 'Woreda',
    description: 'Silti Woreda is known for its rich cultural heritage and strong rural livelihoods rooted in agriculture and community traditions.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Cultural heritage', 'Agricultural livelihoods', 'Community traditions']
  },
  'misraq-silti-woreda': {
    name: 'Misraq Silti Woreda',
    subtitle: 'Eastern Silti rural communities',
    type: 'Woreda',
    description: 'Misraq Silti Woreda supports rural communities with agriculture, local services, and community development.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Rural services', 'Agriculture', 'Community development']
  },
  'lanfro-woreda': {
    name: 'Lanfro Woreda',
    subtitle: 'Highland agricultural woreda',
    type: 'Woreda',
    description: 'Lanfro Woreda is a highland area focused on agriculture, livestock, and rural community services.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Highland agriculture', 'Livestock farming', 'Rural services']
  },
  'mitto-woreda': {
    name: 'Mitto Woreda',
    subtitle: 'Rural woreda with local markets',
    type: 'Woreda',
    description: 'Mitto Woreda supports rural livelihoods with agricultural production and local market activity.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Agricultural production', 'Local markets', 'Community services']
  },
  'dalocha-woreda': {
    name: 'Dalocha Woreda',
    subtitle: 'Rural woreda surrounding Dalocha',
    type: 'Woreda',
    description: 'Dalocha Woreda includes rural communities surrounding the city administration, with agriculture and local services as key activities.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Rural agriculture', 'Local services', 'Community development']
  },
  'sankura-woreda': {
    name: 'Sankura Woreda',
    subtitle: 'Woreda with cultural heritage',
    type: 'Woreda',
    description: 'Sankura Woreda is recognized for its cultural heritage and strong community networks.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Cultural heritage', 'Community networks', 'Local development']
  },
  'wulbarag-woreda': {
    name: 'Wulbarag Woreda',
    subtitle: 'Agricultural rural woreda',
    type: 'Woreda',
    description: 'Wulbarag Woreda focuses on agricultural production, rural services, and local trade.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Agriculture', 'Rural services', 'Local trade']
  },
  'mirab-azernet-berbere-woreda': {
    name: 'Mirab Azernet Berbere Woreda',
    subtitle: 'Western Azernet Berbere woreda',
    type: 'Woreda',
    description: 'Mirab Azernet Berbere Woreda serves western communities with rural services and agricultural support.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Rural services', 'Agriculture', 'Community support']
  },
  'misraq-azernet-berbere-woreda': {
    name: 'Misraq Azernet Berbere Woreda',
    subtitle: 'Eastern Azernet Berbere woreda',
    type: 'Woreda',
    description: 'Misraq Azernet Berbere Woreda supports eastern communities with local services and agricultural livelihoods.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Agricultural livelihoods', 'Local services', 'Community development']
  },
  'alicho-woriro-woreda': {
    name: 'Alicho Woriro Woreda',
    subtitle: 'Rural woreda with community focus',
    type: 'Woreda',
    description: 'Alicho Woriro Woreda is a rural area emphasizing community development, agriculture, and local services.',
    population: '—',
    area: '—',
    communities: '—',
    established: '—',
    highlights: ['Community development', 'Agriculture', 'Local services']
  }
};

export default function WoredaDetailPage({ params }: { params: { slug: string } }) {
  const woreda = woredaDetails[params.slug];

  if (!woreda) {
    return (
      <div className="woreda-page">
        <div className="woreda-container">
          <div className="woreda-header">
            <Link href="/woredas" className="back-link">
              ← Back to All Woredas
            </Link>
            <h1 className="woreda-title">Woreda Page Coming Soon</h1>
            <p className="woreda-subtitle">
              This woreda&apos;s page is building on and Insha&apos;Allah will finish coming soon
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="woreda-page">
      <div className="woreda-container">
        <div className="woreda-header">
          <Link href="/woredas" className="back-link">
            ← Back to All Woredas
          </Link>
          <h1 className="woreda-title">{woreda.name}</h1>
          <p className="woreda-subtitle">{woreda.subtitle}</p>
          <div className="woreda-badge">{woreda.type}</div>
        </div>

        <div className="woreda-content">
          <div className="overview-section">
            <h2>Overview</h2>
            <p className="woreda-description">{woreda.description}</p>

            <div className="stats-grid">
              <div className="stat-card">
                <Users className="stat-icon" />
                <div className="stat-value">{woreda.population}</div>
                <div className="stat-label">Population</div>
              </div>
              <div className="stat-card">
                <Home className="stat-icon" />
                <div className="stat-value">{woreda.communities}</div>
                <div className="stat-label">Communities</div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-value">{woreda.area}</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div className="stat-value">{woreda.established}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Key Highlights</h2>
            <ul className="feature-list">
              {woreda.highlights.map((highlight, index) => (
                <li key={index} className="feature-item">
                  <div className="feature-bullet"></div>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
