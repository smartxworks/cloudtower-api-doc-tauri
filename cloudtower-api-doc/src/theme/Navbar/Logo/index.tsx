import React from 'react';
import Logo from '@theme/Logo';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function NavbarLogo() {
  return (
    <Logo
      className={clsx(
        "navbar__brand",
        [
          styles.logoOverwrite
        ],
      )}
      imageClassName="navbar__logo"
      titleClassName="navbar__title text--truncate"
    />
  );
}
