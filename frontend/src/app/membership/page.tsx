'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Users, 
  Award, 
  Calendar, 
  BookOpen, 
  Shield, 
  Globe, 
  Mail, 
  ChevronDown,
  Star,
  Heart,
  Target,
  Zap
} from 'lucide-react';

export default function MembershipPage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const membershipPlans = [
    {
      title: "Basic Member",
      subtitle: "For individuals new to the community",
      price: "Free",
      period: "Annual membership",
      features: [
        "Access to community events",
        "Monthly newsletter",
        "Basic member directory access",
        "Community forum participation",
        "Limited cultural resource access"
      ],
      buttonText: "Join Free",
      buttonVariant: "secondary" as const,
      color: "blue" as const
    },
    {
      title: "Active Member",
      subtitle: "Most popular choice",
      price: "ETB 500",
      period: "Per year",
      features: [
        "All Basic Member benefits",
        "Priority event registration",
        "Full member directory access",
        "Voting rights in association",
        "Access to all cultural resources",
        "Member discount on merchandise",
        "Digital membership card"
      ],
      recommended: true,
      buttonText: "Become Active Member",
      buttonVariant: "primary" as const,
      color: "indigo" as const
    },
    {
      title: "Premium Member",
      subtitle: "For dedicated community supporters",
      price: "ETB 1,200",
      period: "Per year",
      features: [
        "All Active Member benefits",
        "VIP event invitations",
        "Leadership committee eligibility",
        "Mentorship program access",
        "Annual recognition certificate",
        "Free cultural workshop access",
        "Personalized support",
        "Early access to new programs"
      ],
      buttonText: "Join Premium",
      buttonVariant: "primary" as const,
      color: "purple" as const
    }
  ];

  const membershipBenefits = [
    {
      icon: <Users />,
      title: "Community Network",
      description: "Connect with Silte community members worldwide and build meaningful relationships."
    },
    {
      icon: <Award />,
      title: "Cultural Preservation",
      description: "Participate in initiatives to preserve and promote Silte language, traditions, and heritage."
    },
    {
      icon: <Calendar />,
      title: "Exclusive Events",
      description: "Access to cultural festivals, workshops, networking events, and community gatherings."
    },
    {
      icon: <BookOpen />,
      title: "Educational Resources",
      description: "Learning materials, language courses, and cultural documentation resources."
    },
    {
      icon: <Shield />,
      title: "Advocacy & Support",
      description: "Collective advocacy for community interests and mutual support network."
    },
    {
      icon: <Globe />,
      title: "Global Connections",
      description: "Connect with Silte diaspora communities across different countries and regions."
    },
    {
      icon: <Target />,
      title: "Leadership Development",
      description: "Opportunities for leadership roles and community project participation."
    },
    {
      icon: <Heart />,
      title: "Social Impact",
      description: "Contribute to community development projects and social welfare initiatives."
    }
  ];

  const faqItems = [
    {
      question: "Who can become a member of SLMA?",
      answer: "Anyone of Silte heritage or those married to Silte individuals can become members. We also welcome friends and supporters of the Silte community who wish to contribute to our cultural preservation efforts."
    },
    {
      question: "How long does membership last?",
      answer: "Membership is annual and renews automatically. You'll receive a reminder email 30 days before your membership expires. You can choose to renew, upgrade, or cancel at any time."
    },
    {
      question: "Can I upgrade my membership plan?",
      answer: "Yes, you can upgrade from Basic to Active or Premium at any time. The remaining value of your current membership will be prorated towards your upgraded plan."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept mobile money ( CBE Birr)and bank transfers."
    },
    {
      question: "Are there family membership options?",
      answer: "Yes! We offer family packages for Active and Premium members. Contact our membership coordinator for details on family rates and benefits."
    },
    {
      question: "How can I get involved beyond membership?",
      answer: "We welcome volunteers for events, cultural programs, and community projects. Premium members get priority for leadership roles. Contact our volunteer coordinator to learn about current opportunities."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const communityStats = [
    { number: "25+", label: "Active Members" },
    { number: "12+", label: "Woredas Represented" },
    { number: "45+", label: "Annual Events" },
    { number: "15", label: "Community Projects" }
  ];

  return (
    <div className="membership-page">
      <div className="membership-container">
        {/* Header */}
        <div className="membership-header">
          <h1 className="membership-title">Join the Silte Lmat Mehber Association</h1>
          <p className="membership-subtitle">
            Become part of a vibrant community dedicated to preserving Silte heritage, 
            fostering connections, and driving positive change. Choose the membership 
            level that best suits your commitment to our shared journey.
          </p>
          <p className="membership-tagline">
            Together, we preserve our past, empower our present, and build our future.
          </p>
        </div>

        {/* Membership Plans */}
        <div className="membership-plans-grid">
          {membershipPlans.map((plan, index) => (
            <div key={index} className="membership-plan-card">
              {plan.recommended && (
                <div className="recommended-badge">Most Popular</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-title">{plan.title}</h3>
                <p className="plan-subtitle">{plan.subtitle}</p>
                <div className="plan-price">
                  <div className="price-amount">{plan.price}</div>
                  <div className="price-period">{plan.period}</div>
                </div>
              </div>

              <div className="plan-features">
                <h4 className="features-title">Included Benefits</h4>
                <ul className="features-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="feature-item">
                      <Check className="feature-icon" />
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-footer">
                <button 
                  className={`select-plan-button ${plan.buttonVariant === 'secondary' ? 'secondary' : ''}`}
                  onClick={() => window.location.href = `/auth/register?plan=${plan.title.toLowerCase().replace(' ', '-')}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Membership Benefits */}
        <div className="membership-benefits">
          <div className="benefits-header">
            <h2 className="benefits-title">Why Join SLMA?</h2>
            <p className="benefits-description">
              Your membership supports our community's growth and gives you access to exclusive benefits
            </p>
          </div>

          <div className="benefits-grid">
            {membershipBenefits.map((benefit, index) => (
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

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-description">
              Find answers to common questions about SLMA membership
            </p>
          </div>

          <div className="faq-accordion">
            {faqItems.map((faq, index) => (
              <div key={index} className="faq-item">
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`faq-icon ${activeFAQ === index ? 'open' : ''}`} />
                </div>
                <div className={`faq-answer ${activeFAQ === index ? 'open' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2 className="cta-title">Ready to Join Our Community?</h2>
          <p className="cta-description">
            Become part of something meaningful. Your membership strengthens our collective voice 
            and supports cultural preservation for future generations.
          </p>
          
          <div className="cta-buttons">
            <Link href="/auth/register" className="cta-button primary">
              Sign Up Now
            </Link>
            <Link href="/contact" className="cta-button secondary">
              Contact Membership Team
            </Link>
          </div>

          <div className="stat-counter">
            {communityStats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}