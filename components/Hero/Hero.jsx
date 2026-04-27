'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';
import send from '@/assets/send.png';
import sendb from '@/assets/sended.png';
import sendo from '@/assets/sending.png';

const words = ['Custom Apps', 'Digital Products', 'Smart Software'];

const Hero = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className={styles.hero}>
      <div className={styles.gridBackground} />

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Flag */}
          <div className={styles.flagText}>
            <span>🚀</span>
            <span>our flagship SaaS product is live</span>
            <Link 
              href="https://zithspace-landing-page.vercel.app"
              target="_blank"
              className={styles.flagBrand}
            >
              ZithSpace
            </Link>
          </div>

          {/* Title */}
          <h1 className={styles.title}>
            {/* Floating Labels */}
            <div className={`${styles.floatingLabel} ${styles.leftLabel}`}>SaaS Company</div>

            <div className={styles.send}>
              <Image src={send} alt="icon" />
            </div>

            <div className={`${styles.floatingLabel} ${styles.rightLabel}`}>Product Company</div>

            <div className={styles.sendb}>
              <Image src={sendb} alt="icon1" />
            </div>

            <div className={`${styles.floatingLabel} ${styles.bottomLabel}`}>Guest</div>

            <div className={styles.sendo}>
              <Image src={sendo} alt="icon2" />
            </div>

            {/* Main Title */}
            <div className={styles.titleLine1}>
              <span className={styles.staticText}>Building Smart&nbsp;</span>

              <span className={styles.wordSlot}>
                <span key={currentWordIndex} className={styles.changingWord}>
                  {words[currentWordIndex]}
                </span>
              </span>
            </div>

            <div className={styles.titleLine2}>Scalable Solutions</div>
          </h1>

          <p className={styles.subtitle}>
            We build digital products and custom software that turn ideas into scalable realities.
          </p>

          <div className={styles.buttons}>
            <button
              className={styles.primaryBtn}
              onClick={() =>
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Get in Touch
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() =>
                document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Explore Our Product
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
