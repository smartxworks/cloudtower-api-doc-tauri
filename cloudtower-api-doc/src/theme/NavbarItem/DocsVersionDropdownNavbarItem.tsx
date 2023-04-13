import React, { useState } from 'react';
import {
  useVersions,
  useActiveDocContext,
} from '@docusaurus/plugin-content-docs/client';
import {useDocsPreferredVersion} from '@docusaurus/theme-common';
import {useDocsVersionCandidates} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import {useLocation} from '@docusaurus/router';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import i18next from '../../../swagger/i18n';
import styles from './styles.module.scss'
import clsx from 'clsx';

const getVersionMainDoc = (version) =>
  version.docs.find((doc) => doc.id === version.mainDocId);
export default function DocsVersionDropdownNavbarItem({
  mobile,
  docsPluginId,
  dropdownActiveClassDisabled,
  dropdownItemsBefore,
  dropdownItemsAfter,
  className,
  ...props
}) {
  const {search, hash} = useLocation();
  const [ active, setActive ] = useState(false)
  const activeDocContext = useActiveDocContext(docsPluginId);
  const { i18n: { currentLocale } } = useDocusaurusContext()
  const versions = useVersions(docsPluginId);
  const {savePreferredVersionName} = useDocsPreferredVersion(docsPluginId);
  const versionLinks = versions.map((version) => {
    // We try to link to the same doc, in another version
    // When not possible, fallback to the "main doc" of the version
    const versionDoc =
      activeDocContext.alternateDocVersions[version.name] ??
      getVersionMainDoc(version);
    return {
      label: version.label,
      // preserve ?search#hash suffix on version switches
      to: `${versionDoc.path}${search}${hash}`,
      isActive: () => version === activeDocContext.activeVersion,
      onClick: () => savePreferredVersionName(version.name),
    };
  });
  const items = [
    ...dropdownItemsBefore,
    ...versionLinks,
    ...dropdownItemsAfter,
  ];
  const dropdownVersion = useDocsVersionCandidates(docsPluginId)[0];
  // Mobile dropdown is handled a bit differently
  const dropdownLabel =
    mobile && items.length > 1
      ? translate({
          id: 'theme.navbar.mobileVersionsDropdown.label',
          message: 'Versions',
          description:
            'The label for the navbar versions dropdown on mobile view',
        })
      : dropdownVersion.label;
  const dropdownTo =
    mobile && items.length > 1
      ? undefined
      : getVersionMainDoc(dropdownVersion).path;
  // We don't want to render a version dropdown with 0 or 1 item. If we build
  // the site with a single docs version (onlyIncludeVersions: ['1.0.0']),
  // We'd rather render a button instead of a dropdown
  if (items.length <= 1) {
    return (
      <DefaultNavbarItem
        {...props}
        mobile={mobile}
        label={dropdownLabel}
        to={dropdownTo}
        isActive={dropdownActiveClassDisabled ? () => false : undefined}
      />
    );
  }
  const completeItems = React.useMemo(() => ([
    {
      type: 'html',
      value: `<span class="dropdown-subtitle">${i18next.t('components.lastVersion')}</span>`
    },
    items[0],
    {
      type: 'html',
      value: "<hr class=\"dropdown-separator\">"
    },
    {
      type: 'html',
      value: `<span class="dropdown-subtitle">${i18next.t('components.historyVersion')}</span>`
    },
    ...items.slice(1)
  ]).map(v => {
    if(v.label) {
      return {
        ...v,
        label: i18next.t('components.version_icu', {version: v.label})
      }
    }
    return v;
  }), [currentLocale]);

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      dropdownclassname={styles.dropdownULOverwrite}
      unHoverable={true}
      onClick={() => setActive(!active)}
      clickOutside={() => setActive(false)}
      label={
      <>
        <span>{i18next.t('components.version_icu', { version: dropdownLabel })}</span>
        <svg className='locales-dropdown-icon' width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.9497 6.58577L9.13134 10.4041C9.12486 10.4106 9.11843 10.417 9.11206 10.4234C8.72883 10.8066 8.53358 10.9994 8.30898 11.0724C8.10814 11.1376 7.89179 11.1376 7.69095 11.0724C7.46262 10.9982 7.26461 10.8002 6.86859 10.4041L3.05022 6.58577C2.65969 6.19524 2.65969 5.56208 3.05022 5.17156C3.44074 4.78103 4.07391 4.78103 4.46443 5.17155L7.99996 8.70709L11.5355 5.17156C11.926 4.78103 12.5592 4.78103 12.9497 5.17156C13.3402 5.56208 13.3402 6.19524 12.9497 6.58577Z" fill="#2C3852" fillOpacity="0.6"/>
        </svg>
      </>}
      to={dropdownTo}
      items={completeItems}
      itemclassname={styles.versionItemOverwrite}
      className={clsx(styles.versionTitleOverwrite, {
        [styles.dropdownActive]: active
      })}
      isActive={dropdownActiveClassDisabled ? () => false : undefined}
    />
  );
}
