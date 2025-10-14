import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';
import i18next from '../../../swagger/i18n';
import styles from "./styles.module.scss";

const Footer: React.FC = () => {
  const { i18n: { currentLocale} } = useDocusaurusContext();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Left side - Copyright and legal links */}
        <div className={styles.footerContainerLeft}>
          <div className={styles.footerContainerRightRow}>
            <span className={styles.copyright}>
              © 2025 Arcfra All rights reserved.
            </span>
            <a href="https://www.arcfra.com/privacy">Privacy</a>
            <span className={styles.dot}>·</span>
            <a href="https://www.arcfra.com/term">Terms</a>
            <span className={styles.dot}>·</span>
            <a href="https://www.arcfra.com/cookies">Cookie Preferences</a>
          </div>
        </div>

        {/* Right side - Social media icons */}
        <div className={styles.footerContainerRight}>
          <div className={styles.socialIconsContainer}>
            <a 
              href="https://x.com/arcfra" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <img src={useBaseUrl('img/social/x.svg')} alt="X (Twitter)" />
            </a>
            <a 
              href="https://linkedin.com/company/arcfra" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <img src={useBaseUrl('img/social/linkedin.svg')} alt="LinkedIn" />
            </a>
            <a 
              href="https://youtube.com/@arcfra" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <img src={useBaseUrl('img/social/youtube.svg')} alt="YouTube" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
