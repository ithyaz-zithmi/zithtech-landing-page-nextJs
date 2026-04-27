'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Products.module.css';

import {
  AppstoreOutlined,
  IssuesCloseOutlined,
  FileTextOutlined,
  RadiusBottomleftOutlined,
} from '@ant-design/icons';

import img1 from '@/assets/productimgwhite1.png';
import img2 from '@/assets/productimgwhite2.png';
import img3 from '@/assets/productimgwhite3.png';
import img4 from '@/assets/productimgwhite4.png';

import img1Dark from '@/assets/productimg1.png';
import img2Dark from '@/assets/productimg2.png';
import img3Dark from '@/assets/productimg3.png';
import img4Dark from '@/assets/productimg1.png';

const Products = () => {
  const [activeTab, setActiveTab] = useState(0);
  const intervalRef = useRef(null);

  const productData = [
    { id: 0, img: img1, imgDark: img1Dark, color: '#A855F7' },
    { id: 1, img: img2, imgDark: img2Dark, color: '#22C55E' },
    { id: 2, img: img3, imgDark: img3Dark, color: '#F97316' },
    { id: 3, img: img4, imgDark: img4Dark, color: '#08a6ef' },
  ];

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % productData.length);
    }, 4000);
  }, [productData.length]);

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
    startInterval(); // Reset the interval when manually clicking
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startInterval]);

  return (
    <section id="product" className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>Our Products</span>
        <h2 className={styles.sectionTitle}>
          Flagship <span>SaaS</span> Products
        </h2>
      </div>

      <div className={styles.productCard}>
        {/* LEFT */}
        <div className={styles.textSide}>
          <h1 className={styles.brandTitle}>ZithSpace</h1>
          <h2 className={styles.platformSubtitle}>Business Management Platform</h2>
          <p className={styles.descriptionText}>
            All-in-one business management solution with project management, HRMS, Client
            management, and finance modules.
          </p>
          <Link 
            href="https://zithspace-landing-page.vercel.app"
            target="_blank"
            className={styles.exploreButton}
          >
            Explore now
          </Link>
        </div>

        {/* RIGHT */}
        <div
          className={styles.visualSide}
          style={{ '--accent-color': productData[activeTab].color }}
        >
          {/* Platform */}
          <div
            className={`${styles.iconWrapper} ${
              activeTab === 0 ? styles.active : ''
            } ${styles.posPurple}`}
            onClick={() => handleTabClick(0)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.iconBox}>
              <AppstoreOutlined />
            </div>
            <div className={styles.lineVertical} />
          </div>

          {/* Users */}
          <div
            className={`${styles.iconWrapper} ${
              activeTab === 1 ? styles.active : ''
            } ${styles.posGreen}`}
            onClick={() => handleTabClick(1)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.iconBox}>
              <FileTextOutlined />
            </div>
            <div className={styles.lineVertical} />
          </div>

          {/* Documents */}
          <div
            className={`${styles.iconWrapper} ${
              activeTab === 2 ? styles.active : ''
            } ${styles.posOrange}`}
            onClick={() => handleTabClick(2)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.iconBox}>
              <RadiusBottomleftOutlined />
            </div>
            <div className={styles.lineHorizontal} />
          </div>

          <div
            className={`${styles.iconWrapper} ${
              activeTab === 3 ? styles.active : ''
            } ${styles.posbule}`}
            onClick={() => handleTabClick(3)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.iconBox}>
              <IssuesCloseOutlined />
            </div>
            <div className={styles.lineHorizontal} />
          </div>

          {/* Dashboard Image */}
          <div className={styles.dashboardContainer}>
            <div className={styles.themeImageContainer}>
              <Image
                src={productData[activeTab].img}
                alt="Dashboard Preview Light"
                className={`${styles.themeImage} ${styles.light}`}
              />
              <Image
                src={productData[activeTab].imgDark}
                alt="Dashboard Preview Dark"
                className={`${styles.themeImage} ${styles.dark}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
