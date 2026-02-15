'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin,
  Heart, Linkedin, Send
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
      { label: 'Woredas', href: '/woredas' },
    ],
    resources: [
      { label: t('nav.donate'), href: '/donate' },
      { label: t('nav.events'), href: '/events' },
      { label: t('nav.gallery'), href: '/gallery' },
      { label: t('nav.projects'), href: '/projects' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook className="social-icon" />, href: 'https://www.facebook.com/profile.php?id=100083184549440', label: 'Facebook' },
    { icon: <Send className="social-icon" />, href: 'https://t.me/+fPpsX67kUoljZjI0', label: 'Telegram' },
    { icon: <Youtube className="social-icon" />, href: 'https://www.youtube.com/results?search_query=worabe+tube', label: 'YouTube' },
    { icon: <Linkedin className="social-icon" />, href: 'https://www.linkedin.com/in/sofiya-yasin-181345355?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BnNgDn%2Fi0SDK3zHvrbw1VtA%3D%3D', label: 'LinkedIn' },
    { icon: <Instagram className="social-icon" />, href: 'https://www.instagram.com/sofiya63917', label: 'Instagram' },
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
              <div className="footer-logo has-image">
                <img
                  src="/images/slma.jpg"
                  alt="SLMA Logo"
                  className="w-full h-full object-cover"
                />
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
                  target="_blank"
                  rel="noopener noreferrer"
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

          {/* Resources */}
          <div className="footer-section">
            <h3 className="footer-section-title">Resources</h3>
            <ul className="footer-links-list">
              {footerLinks.resources.map((link) => (
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