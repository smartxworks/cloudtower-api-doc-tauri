import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig} from '@docusaurus/theme-common';
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';

function LogoThemedImage({logo, alt, imageClassName}) {
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };
  const themedImage = (
    <ThemedImage
      className={logo.className}
      sources={sources}
      height={logo.height}
      width={logo.width}
      alt={alt}
      style={logo.style}
    />
  );
  // Is this extra div really necessary?
  // introduced in https://github.com/facebook/docusaurus/pull/5666
  return imageClassName ? (
    <div className={imageClassName}>{themedImage}</div>
  ) : (
    themedImage
  );
}

export default function Logo(props) {
  const {
    siteConfig: {title},
    i18n: {
      currentLocale,
    }
  } = useDocusaurusContext();
  const {
    navbar: {title: navbarTitle, logo},
  } = useThemeConfig();
  const {imageClassName, titleClassName, ...propsRest} = props;
  const logoLink = useBaseUrl(logo?.href || '/');
  // If visible title is shown, fallback alt text should be
  // an empty string to mark the logo as decorative.
  const fallbackAlt = navbarTitle ? '' : title;
  // Use logo alt text if provided (including empty string),
  // and provide a sensible fallback otherwise.
  const alt = logo?.alt ?? fallbackAlt;
  
  return (
    <div className={styles.logoContainer}>
      <a
        href="https://www.arcfra.com"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.logoLink}
        {...propsRest}>
        {logo && (
          <LogoThemedImage
            logo={{
              ...logo,
              src: `img/arcfra-logo-${currentLocale}.svg`
            }}
            alt={alt}
            imageClassName={imageClassName}
          />
        )}
      </a>
      <Link
        to={logoLink}
        className={styles.developerLink}
        {...(logo?.target && {target: logo.target})}>
        <span className={styles.developerText}>Developer</span>
      </Link>
      {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
    </div>
  );
}
