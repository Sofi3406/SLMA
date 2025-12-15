'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin,
  Heart
} from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { label: t('nav.about'), href: '/about-silte' },
      { label: t('nav.slma'), href: '/about-slma' },
      { label: 'Co-Founders', href: '/co-founders' },
      { label: 'Contact Us', href: '/contact' },
    ],
    membership: [
      { label: t('nav.membership'), href: '/membership' },
      { label: 'Benefits', href: '/membership#benefits' },
      { label: 'Register', href: '/auth/register' },
      { label: 'Member Login', href: '/auth/login' },
    ],
    resources: [
      { label: t('nav.events'), href: '/events' },
      { label: t('nav.gallery'), href: '/gallery' },
      { label: t('nav.projects'), href: '/projects' },
      { label: 'News', href: '/news' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook className="social-icon" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="social-icon" />, href: '#', label: 'Twitter' },
    { icon: <Instagram className="social-icon" />, href: '#', label: 'Instagram' },
    { icon: <Youtube className="social-icon" />, href: '#', label: 'YouTube' },
  ];

  const contactInfo = [
    { icon: <Mail className="contact-icon" />, text: 'info@slma.org' },
    { icon: <Phone className="contact-icon" />, text: '+251 930670088' },
    { icon: <MapPin className="contact-icon" />, text: 'Worabe, Silte Zone, Ethiopia' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo & Description */}
          <div className="footer-logo-section">
            <Link href="/" className="footer-logo-link">
              <div className="footer-logo">
                <span className="footer-logo-text">SL</span>
              </div>
              <div>
                <h2 className="footer-organization-name">Silte Lmat Mehber</h2>
                <p className="footer-subtitle">{t('hero.subtitle')}</p>
              </div>
            </Link>
            <p className="footer-description">
              Dedicated to preserving Silte heritage and fostering community development through cultural preservation and modern initiatives.
            </p>
            <div className="footer-social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-section-title">Quick Links</h3>
            <ul className="footer-links-list">
              {footerLinks.about.map((link) => (
                <li key={link.href} className="footer-link-item">
                  <Link
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Membership */}
          <div className="footer-section">
            <h3 className="footer-section-title">Membership</h3>
            <ul className="footer-links-list">
              {footerLinks.membership.map((link) => (
                <li key={link.href} className="footer-link-item">
                  <Link
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-section-title">Contact Us</h3>
            <ul className="contact-info-list">
              {contactInfo.map((item, index) => (
                <li key={index} className="contact-info-item">
                  <div className="contact-icon">{item.icon}</div>
                  <span className="contact-text">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright & Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} Silte Lmat Mehber. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <Link href="/privacy" className="bottom-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="bottom-link">
              Terms of Service
            </Link>
            <div className="credit">
              Made with <Heart className="heart-icon" /> by SLMA Community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;