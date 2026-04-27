'use client';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import styles from './Footer.module.css';
import logoImage from '@/assets/logo.svg';
import ContactForm from '../Contact/ContactForm';
import Link from "next/link";
import { useState } from 'react';
import Toast from '../Toast/Toast';

const Footer = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  // Track email click
  const trackEmailClick = async (emailAddress) => {
    console.log('Email clicked:', emailAddress);
    
    if (isTracking) return; // Prevent multiple tracking
    
    setIsTracking(true);
    
    try {
      // Get user info for tracking
      const userAgent = navigator.userAgent;
      
      // Track the click first (without waiting for IP)
      fetch('/api/track/email-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: emailAddress,
          clickSource: 'footer',
          userAgent: userAgent,
          ipAddress: null // Will be filled by server if needed
        }),
      }).then(() => {
        console.log('Email click tracked successfully:', emailAddress);
      }).catch((error) => {
        console.error('Failed to track email click:', error);
      });

    } catch (error) {
      console.error('Track email error:', error);
    } finally {
      setIsTracking(false);
    }
  };

  // Handle newsletter subscription
  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail.trim()) {
      setToast({ message: 'Please enter your email address', type: 'error', isVisible: true });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setToast({ message: 'Please enter a valid email address', type: 'error', isVisible: true });
      return;
    }

    setIsSubscribing(true);

    try {
      const userAgent = navigator.userAgent;
      
      // Get IP address
      let ipAddress = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.warn('Could not get IP address:', ipError);
      }

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: newsletterEmail,
          userAgent: userAgent,
          ipAddress: ipAddress
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Successfully subscribed!', type: 'success', isVisible: true });
        setNewsletterEmail('');
        console.log('Newsletter subscription successful:', newsletterEmail);
      } else {
        if (data.alreadyExists) {
          setToast({ message: 'Email already subscribed', type: 'error', isVisible: true });
        } else {
          setToast({ message: 'Subscription failed. Please try again.', type: 'error', isVisible: true });
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setToast({ message: 'Subscription failed. Please try again.', type: 'error', isVisible: true });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: '', type: '', isVisible: false })}
      />
      <footer className={styles.footerContainer}>
        <div style={{ paddingTop: '100px', marginTop: '-100px' }}>
          <ContactForm />
        </div>

        {/* MAIN FOOTER */}
        <div className={styles.mainFooter}>
        {/* NEW TOP ROW: Logo and Email side by side */}
        <div className={styles.topRow}>
          <div className={styles.logoRow}>
            <Image src={logoImage} alt="ZithSpace Logo" className={styles.logosquar} />
            <h1 className={styles.brandName}>Zithtech</h1>
          </div>

          <div className={styles.newsletter}>
            <input 
              type="email" 
              placeholder="Enter your Company Email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNewsletterSubscribe();
                }
              }}
            />
            <button 
              onClick={handleNewsletterSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? 'Subscribing...' : 'Send'}
            </button>
                      </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <p className={styles.brandDesc}>
              Partner with Zithtech to transform your business with next-gen AI and smart IT
              solutions.
            </p>
            <div className={styles.contactLinks}>
              <div 
                className={styles.contactItem}
                onClick={() => {
                  console.log('Footer email clicked');
                  trackEmailClick('hello@zithtech.com');
                  setTimeout(() => {
                    window.location.href = 'mailto:hello@zithtech.com';
                  }, 100);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Icon icon="mdi:email-outline" /> hello@zithtech.com
              </div>
              <div className={styles.contactItem}>
                <Icon icon="mdi:phone-outline" /> 80722 55742
              </div>
              <div className={styles.contactItem}>
                <Icon icon="mdi:phone-outline" /> 88387 82347
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linkCol}>
            <h4>Quick Link</h4>
            <ul>
              <li><Link href="/#home">home</Link></li>
  <li><Link href="/#about">About Us</Link></li>
<li><Link href="/#service">Service</Link></li>
<li><Link href="/#product">Product</Link></li>
<li><Link href="/#process">Process</Link></li>
<li><Link href="/#contact">Contact Us</Link></li>

</ul>

          </div>

          {/* Socials */}


          <div className={styles.linkCol}>
  <h4>Join Us</h4>

  <a
    href="https://www.linkedin.com/company/zithtech/"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.socialLink}
  >
    <Icon icon="mdi:linkedin" color="#0077B5" />
    LinkedIn
  </a>

  <div className={styles.socialLink}>
    <Icon icon="mdi:instagram" color="#E4405F" /> Instagram
  </div>

  {/* <a
    href="https://www.instagram.com/your-instagram"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.socialLink}
  >
    <Icon icon="mdi:instagram" color="#E4405F" />
    Instagram
  </a> */}


</div>


          {/* Location */}
          <div className={styles.locationCol}>
            <h4>Company Location</h4>
            <div className={styles.flagRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://flagcdn.com/w40/in.png" alt="India" />
            </div>
            <p className={styles.address}>
              No 37,Balaji Towers,Ground Floor,Ram Nagar South,8th Cross Street,2nd Main
              Road,Madipakkam,Chennai-600091
            </p>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>Copyright © {new Date().getFullYear()} Zithtech | All Rights Reserved</p>
        </div>
      </div>
    </footer>
      </>
  );
};

export default Footer;
