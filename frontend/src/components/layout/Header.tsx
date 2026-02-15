'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = authService.getCurrentUser();
  const isAuthenticated = !!user;

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/about-silte', label: t('nav.about') },
    { href: '/about-slma', label: t('nav.slma') },
    { href: '/woredas', label: 'Woredas' },
    { href: '/events', label: t('nav.events') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/projects', label: t('nav.projects') },
    { href: '/donate', label: t('nav.donate') },
    { href: '/contact', label: 'Contact Us' },
    { href: '/co-founders', label: t('co-founders') }
  ];

  // Add admin area link if current user is admin
  if (isAuthenticated && authService.isAdmin()) {
    navItems.push({ href: '/admin/dashboard', label: 'Admin' });
  }

  const languageOptions = [
    { code: 'en', label: 'EN' },
    { code: 'am', label: 'አማ' },
    { code: 'silt', label: 'ስል' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="header-logo-link">
          <div className="header-logo has-image">
            <img
              src="/images/slma.jpg"
              alt="SLMA Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="header-logo-text">
            <span className="site-kicker">SLMA Logo</span>
            <h1 className="site-title">Silte Lmat Mehber</h1>
            <p className="site-tagline">Preserving heritage, building community,</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Language & Auth */}
        <div className="header-controls">
          {/* Language Switcher */}
          <div className="language-switcher">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => setLanguage(option.code as any)}
                className={`language-btn ${language === option.code ? 'active' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          {user ? (
            <div className="user-menu">
              <button className="user-btn">
                <span>👤</span>
                <span>{user.name.split(' ')[0]}</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/auth/login" className="nav-link">
                {t('nav.login')}
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            {!user && (
              <div className="mobile-auth-buttons">
                <Link
                  href="/auth/login"
                  className="btn btn-outline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;