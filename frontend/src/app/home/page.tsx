'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Users, BookOpen, Heart, TrendingUp, Target, Award } from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();

  const features = [
    {
      title: 'Community Network',
      description: 'Connect with Silte community members worldwide.',
      emoji: '👥',
      icon: <Users className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Cultural Events',
      description: 'Participate in traditional festivals and gatherings.',
      emoji: '🎉',
      icon: <Calendar className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Heritage Gallery',
      description: 'Explore photos and videos of Silte culture.',
      emoji: '🖼️',
      icon: <BookOpen className="w-8 h-8 text-purple-600" />
    },
    {
      title: 'Development Projects',
      description: 'Support community development initiatives.',
      emoji: '❤️',
      icon: <Heart className="w-8 h-8 text-red-600" />
    },
  ];

  const stats = [
    { number: '2,500+', label: 'Active Members' },
    { number: '45+', label: 'Annual Events' },
    { number: '15', label: 'Woredas Covered' },
    { number: '15', label: 'Community Projects' }
  ];

  const woredas = [
    { name: 'Worabe city administration', slug: 'worabe' },
    { name: 'Alem Gebeya city administration', slug: 'alem-gebeya-city-administration' },
    { name: 'Qbet city administration', slug: 'qbet-city-administration' },
    { name: 'Tora city administration', slug: 'tora-city-administration' },
    { name: 'Dalocha city administration', slug: 'dalocha' },
    { name: 'Silti woreda', slug: 'silti' },
    { name: 'Misraq Silti woreda', slug: 'misraq-silti-woreda' },
    { name: 'Lanfro woreda', slug: 'lanforo' },
    { name: 'Mitto woreda', slug: 'mitto-woreda' },
    { name: 'Dalocha woreda', slug: 'dalocha-woreda' },
    { name: 'Sankura woreda', slug: 'sankura' },
    { name: 'Wulbarag woreda', slug: 'hulbarag' },
    { name: 'Mirab Azernet Berbere woreda', slug: 'west-azernet-berbere' },
    { name: 'Misraq Azernet Berbere woreda', slug: 'east-azernet-berbere' },
    { name: 'Alicho Woriro woreda', slug: 'alicho' }
  ];

  const membershipReasons = [
    {
      title: 'Community Network',
      description: 'Connect with Silte community members worldwide and build meaningful relationships.',
      icon: <Users className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Cultural Preservation',
      description: 'Participate in initiatives to preserve and promote Silte language, traditions, and heritage.',
      icon: <Heart className="w-8 h-8 text-rose-600" />
    },
    {
      title: 'Exclusive Events',
      description: 'Access to cultural festivals, workshops, networking events, and community gatherings.',
      icon: <Calendar className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Educational Resources',
      description: 'Learning materials, language courses, and cultural documentation resources.',
      icon: <BookOpen className="w-8 h-8 text-purple-600" />
    },
    {
      title: 'Advocacy & Support',
      description: 'Collective advocacy for community interests and mutual support network.',
      icon: <Target className="w-8 h-8 text-amber-600" />
    },
    {
      title: 'Global Connections',
      description: 'Connect with Silte diaspora communities across different countries and regions.',
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />
    },
    {
      title: 'Leadership Development',
      description: 'Opportunities for leadership roles and community project participation.',
      icon: <Award className="w-8 h-8 text-teal-600" />
    },
    {
      title: 'Social Impact',
      description: 'Contribute to community development projects and social welfare initiatives.',
      icon: <Heart className="w-8 h-8 text-red-600" />
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t('hero.title')}</h1>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>
            <div className="hero-buttons">
              <Link href="/auth/login" className="btn btn-primary btn-lg">
                {t('nav.login')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Silte + SLMA Highlights */}
      <section className="landing-about-section">
        <div className="container">
          <div className="about-summaries">
            <div className="about-card">
              <div className="about-card-header">
                <p className="about-kicker">About Silte</p>
                <h2 className="about-title">Silte Zone Communication Affairs</h2>
                <p className="about-summary">
                  Strengthening transparency and public trust through reliable, timely information
                  and community engagement across the Silte Zone.
                </p>
              </div>
              <ul className="about-points">
                <li>Vision: unity and shared decision-making through access to information.</li>
                <li>Mission: motivate participation in zonal and national issues.</li>
                <li>Values: service, respect, teamwork, and leadership.</li>
              </ul>
              <Link href="/auth/register" className="about-link">Join SLMA</Link>
            </div>

            <div className="about-card">
              <div className="about-card-header">
                <p className="about-kicker">About SLMA</p>
                <h2 className="about-title">Silte Lmat Mehber (SLMA)</h2>
                <p className="about-summary">
                  Uniting diaspora and local communities to preserve heritage while advancing
                  education, healthcare, and economic opportunity.
                </p>
              </div>
              <ul className="about-points">
                <li>Mission: sustainable community development rooted in culture.</li>
                <li>Vision: a prosperous, educated, and culturally vibrant Silte community.</li>
                <li>Impact: hospitals, schools, and infrastructure across the zone.</li>
              </ul>
              <Link href="/auth/register" className="about-link">Join SLMA</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Join SLMA?</h2>
            <p className="section-description">
              Be part of a vibrant community dedicated to preserving our heritage
              while building a better future for all Silte people.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.emoji}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-8 mt-12">
            <h3 className="section-title">Membership Benefits</h3>
            <p className="section-description">
              Your membership supports our community's growth and gives you access to exclusive benefits
            </p>
          </div>

          <div className="benefits-grid">
            {membershipReasons.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  {benefit.icon}
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Woredas Section */}
      <section className="woredas-section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Woredas</h2>
            <p className="section-description">
              Connecting communities across all fifteen Silte woredas
            </p>
          </div>

          <div className="woredas-grid">
            {woredas.map((woreda) => (
              <Link key={woreda.slug} href={`/woredas/${woreda.slug}`} className="woreda-tag">
                {woreda.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-description">
            Join thousands of Silte community members who are preserving our heritage
            and building our future together.
          </p>
          <div className="cta-buttons">
            <Link href="/auth/register" className="btn btn-white">
              Become a Member
            </Link>
            <Link href="/auth/register" className="btn btn-outline-white">
              Support Our Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title" style={{ color: 'white' }}>Stay Connected</h2>
            <p className="section-description" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Subscribe to our newsletter for updates on events, projects, and community news
            </p>
          </div>
          
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
