import { useState } from 'react';
import Logo from '../assets/LOGO.png';
import '../css/LandingPage.css';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

const services = [
  {
    title: 'Document Requests',
    description: 'Request barangay clearances, certificates, and other official documents online.',
  },
  {
    title: 'Announcements',
    description: 'Stay updated with the latest news, events, and important advisories.',
  },
  {
    title: 'Submit Concerns',
    description: 'File complaints, suggestions, or urgent issues directly to barangay officials.',
  },
  {
    title: 'Emergency Response',
    description: 'Access emergency hotlines and expedite response to urgent situations.',
  },
];

const faqs = [
  {
    question: 'How do I register for an iBarangay account?',
    answer:
      'Select your barangay, provide your contact details, and verify via email or SMS. Approval typically takes less than 24 hours.',
  },
  {
    question: 'What documents can I request in iBarangay?',
    answer:
      'You can request barangay certificates, residency, clearance, indigency records, and more depending on your LGU setup.',
  },
  {
    question: 'Is my personal information secure in iBarangay?',
    answer:
      'Yes. We encrypt all resident data in transit and at rest, and only authorized officials can access requests.',
  },
  {
    question: 'How do I pick up my requested documents?',
    answer:
      'You will receive a notification once your document is ready. Visit your barangay hall with your ID for release.',
  },
  {
    question: 'Can I use iBarangay on my mobile phone?',
    answer:
      'Absolutely. The portal is fully responsive and works on smartphones, tablets, and desktops.',
  },
];

const aboutCards = [
  {
    title: 'Your Digital Barangay',
    description:
      'Barangay in action delivered online for residents, officials, and stakeholders with transparent workflows.',
  },
  {
    title: 'Key Features',
    description:
      'Request official documents online, submit concerns and complaints, manage announcements, and keep residents informed.',
  },
];

const stats = [
  { value: '2x faster', label: 'Average document processing time' },
  { value: '98%', label: 'Resident satisfaction across barangays' },
  { value: '24/7', label: 'Access to announcements and updates' },
];

const highlights = [
  {
    title: 'Resident-first workflows',
    detail: 'Guided steps for every request keep citizens informed at each checkpoint.',
  },
  {
    title: 'Data you can trust',
    detail: 'Encrypted records, audit trails, and exportable summaries for compliance.',
  },
  {
    title: 'Smart notifications',
    detail: 'Automated SMS/email alerts ensure no request or incident is overlooked.',
  },
];

const heroChecklist = [
  'Digital request tracking with live status updates',
  'Secure resident profiles for faster verification',
  'Auto-reminders for pending documents and dues',
];

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4V12h2.4V9.7c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12Z" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.7 7.6c.01.2.01.4.01.6 0 6-4.6 12.9-13 12.9a12.8 12.8 0 0 1-7-2.1c.4 0 .9.1 1.3.1a9.1 9.1 0 0 0 5.6-1.9 4.5 4.5 0 0 1-4.2-3.1c.3 0 .6.1.9.1.4 0 .8-.1 1.1-.2a4.5 4.5 0 0 1-3.6-4.4v-.1c.6.4 1.3.7 2 .7a4.5 4.5 0 0 1-2-3.7 4.5 4.5 0 0 1 .6-2.3 13 13 0 0 0 9.3 4.7c-.2-.9-.1-1.8.3-2.6a4.4 4.4 0 0 1 7.6-1 9 9 0 0 0 2.9-1.1 4.5 4.5 0 0 1-2 2.5 9 9 0 0 0 2.6-.7 9.6 9.6 0 0 1-2.2 2.3Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3Zm3 13.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3Zm-4.75-6.93a.9.9 0 1 1 1.8 0 .9.9 0 0 1-1.8 0ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      </svg>
    ),
  },
];

function LandingPage({ onNavigateLogin, onNavigateAdminLogin }) {
  const [activeFaq, setActiveFaq] = useState(0);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState('');

  const handleFaqToggle = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormStatus('Sending your message...');
    
    try {
      const response = await fetch('/api/contactus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact form');
      }

      setFormStatus('Thanks for reaching out! We will get back to you shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });

      // Clear success message after 5 seconds
      setTimeout(() => setFormStatus(''), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormStatus(`Error: ${error.message}`);
      setTimeout(() => setFormStatus(''), 5000);
    }
  };

  const handleLoginClick = (event) => {
    event.preventDefault();
    setShowLoginOptions(true);
  };

  const handleUserLogin = () => {
    setShowLoginOptions(false);
    onNavigateLogin?.();
  };

  const handleAdminLogin = () => {
    setShowLoginOptions(false);
    onNavigateAdminLogin?.();
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#hero" className="brand">
            <img src={Logo} alt="iBarangay logo" />
            <span>iBarangay</span>
          </a>

          <nav aria-label="Primary navigation">
            <ul>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="login-btn-wrapper">
            <button className="login-btn" type="button" onClick={handleLoginClick}>
              Login
            </button>
            {showLoginOptions && (
              <div className="login-options-dropdown">
                <button type="button" className="login-option" onClick={handleUserLogin}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Login as User
                </button>
                <button type="button" className="login-option" onClick={handleAdminLogin}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Login as Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {showLoginOptions && <div className="login-overlay" onClick={() => setShowLoginOptions(false)}></div>}

      <main className="landing-page">
        <div className="landing-scale">
          <section className="hero" id="hero">
            <div className="hero-content">
            <p className="eyebrow">Your Barangay Services, Anytime Anywhere</p>
            <h1>Serve citizens faster with a modern barangay workspace.</h1>
            <p className="subtitle">
              Process documents, broadcast announcements, and resolve concerns in one intuitive dashboard.
              iBarangay keeps residents updated and officials in sync—no long queues required.
            </p>
            <ul className="hero-list">
              {heroChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <a className="btn primary" onClick={handleUserLogin}>
                Get Started
              </a>
            </div>
          </div>

            <div className="hero-preview" aria-label="iBarangay preview card">
            <div className="hero-badge">Update</div>
            <h3>Smart Resident Portal</h3>
            <p>Residents submit requests, upload IDs, and track progress without stepping into the barangay hall.</p>
            <div className="preview-list">
              <div>
                <span>1trillion</span>
                <p>Active requests today</p>
              </div>
              <div>
                <span>1M</span>
                <p>Announcements sent</p>
              </div>
            </div>
            <small>Available on desktop and mobile with secure sign-in.</small>
            </div>
          </section>

          <section className="stats-panel">
          {stats.map((item) => (
            <article key={item.label}>
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </article>
          ))}
          </section>

          <section id="about" className="about-section">
        <h2>
          What is <span>iBarangay?</span>
        </h2>
        <div className="about-grid">
          {aboutCards.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
          </section>

          <section className="highlights-section">
        <h2>Why barangays choose us</h2>
        <div className="highlight-grid">
          {highlights.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
          </section>

          <section id="services" className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service) => (
            <article key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
          </section>

          <section id="faq" className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((item, index) => {
            const isOpen = index === activeFaq;
            return (
              <div key={item.question} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button onClick={() => handleFaqToggle(index)} aria-expanded={isOpen}>
                  <span>{item.question}</span>
                  <span className="icon">{isOpen ? '-' : '+'}</span>
                </button>
                {isOpen && <p>{item.answer}</p>}
              </div>
            );
          })}
        </div>
          </section>

          <section id="contact" className="contact-section">
        <div className="contact-card">
          <h2>Contact Us</h2>
          <p>
            Need help or want a guided demo? Reach out to us and we’ll connect you to your barangay support team
            right away.
          </p>
          <ul>
            <li>
              <strong>Email:</strong> support@ibarangay.ph
            </li>
            <li>
              <strong>Phone:</strong> (02) 1234-6815 / (+63) 927-123-4567
            </li>
            <li>
              <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
            </li>
            <li>
              <strong>Address:</strong> Consolacion, Dalaguete, Cebu
            </li>
          </ul>
          <div className="socials" aria-label="Social media links">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                <span className="social-icon">{link.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Contact Us</h3>
          <label>
            Name
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </label>
          <label>
            Phone
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
          </label>
          <label>
            Message
            <textarea name="message" rows="4" value={formData.message} onChange={handleInputChange} required />
          </label>
          <button type="submit" className="btn primary">
            Submit
          </button>
          {formStatus && <p className="form-status">{formStatus}</p>}
        </form>
          </section>
          <footer className="site-footer">© 2025 iBarangay. All rights reserved.</footer>
        </div>
      </main>
    </>
  );
}

export default LandingPage;

