import React from 'react';
import styles from './styles.module.css';

export default function DownloadButton() {
  return (
    <a
      href="https://github.com/smartxworks/cloudtower-api-doc-tauri/releases/tag/v2.18.0"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.downloadButton}
    >
      <div className={styles.iconContainer}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 1V11M8 11L4 7M8 11L12 7M2 13H14"
            stroke="#0C2849"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={styles.buttonText}>Desktop Client</span>
    </a>
  );
}
