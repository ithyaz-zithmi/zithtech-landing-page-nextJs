'use client';
import { useEffect } from 'react';
import styles from './Toast.module.css';

const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastContent}>
        <span className={styles.toastMessage}>{message}</span>
        <button 
          className={styles.toastClose}
          onClick={onClose}
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
