import React, { useMemo, useState } from 'react';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import clsx from 'clsx';
import i18next from '../../../swagger/i18n';
import { useSpecMap } from '../../../swagger/utils/swagger';
import styles from './styles.module.scss'
import { useLocation } from '@docusaurus/router';

export default function DocsVersionDropdownNavbarItem({
  mobile,
  docsPluginId,
  dropdownActiveClassDisabled,
  dropdownItemsBefore,
  dropdownItemsAfter,
  className,
  ...props
}) {
  const specMap = useSpecMap();
  const versions = Object.keys(specMap);
  const [ active, setActive ] = useState(false)
  const { search, pathname, hash } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currentVersion = searchParams.get('version') || versions[0];
  const versionLinks = useMemo(() => {
    return versions.map((version) => {
      searchParams.set('version', version);
      return {
        label: version,
        to: `${pathname}?${searchParams.toString()}${hash}`,
        isActive: () => version === currentVersion,
      };
    })
  }, [ versions, currentVersion]);

  const items = [
    ...dropdownItemsBefore,
    ...versionLinks,
    ...dropdownItemsAfter,
  ];
  if (items.length <= 1) {
    return (
      <DefaultNavbarItem
        {...props}
        mobile={mobile}
        label={i18next.t('components.version_icu', {version: currentVersion })}
        isActive={dropdownActiveClassDisabled ? () => false : undefined}
      />
    );
  }
  const archiveIndex = items.findIndex(v => v.label.startsWith('3.4.4'));
  const completeItems = [
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
    ...items.slice(1, archiveIndex),
    {
      type: 'html',
      value: "<hr class=\"dropdown-separator\">"
    },
    {
      type: 'html',
      value: `<span class="dropdown-subtitle">${i18next.t('components.archivedVersion')}</span>`
    },
    ...items.slice(archiveIndex),
  ].map(v => {
    if(v.label) {
      let label = v.label;
      if(v.label.startsWith('3.4')) {
        label = '3.4.x LTS'
      }
      if(v.label.startsWith('2.8.0')) {
        label = '2.x'
      }
      if(v.href) {
        return v;
      }
      return {
        ...v,
        label: i18next.t('components.version_icu', {version: label })
      }
    }
    return v;
  });
  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      to={undefined}
      dropdownclassname={styles.dropdownULOverwrite}
      unHoverable={true}
      onClick={() => setActive(!active)}
      clickOutside={() => setActive(false)}
      label={
      <>
        <span>{i18next.t('components.version_icu', { version: currentVersion })}</span>
        <svg className='locales-dropdown-icon' width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.9497 6.58577L9.13134 10.4041C9.12486 10.4106 9.11843 10.417 9.11206 10.4234C8.72883 10.8066 8.53358 10.9994 8.30898 11.0724C8.10814 11.1376 7.89179 11.1376 7.69095 11.0724C7.46262 10.9982 7.26461 10.8002 6.86859 10.4041L3.05022 6.58577C2.65969 6.19524 2.65969 5.56208 3.05022 5.17156C3.44074 4.78103 4.07391 4.78103 4.46443 5.17155L7.99996 8.70709L11.5355 5.17156C11.926 4.78103 12.5592 4.78103 12.9497 5.17156C13.3402 5.56208 13.3402 6.19524 12.9497 6.58577Z" fill="#2C3852" fillOpacity="0.6"/>
        </svg>
      </>}
      items={completeItems}
      itemclassname={styles.versionItemOverwrite}
      className={clsx(styles.versionTitleOverwrite, {
        [styles.dropdownActive]: active
      })}
      isActive={dropdownActiveClassDisabled ? () => false : undefined}
    />
  );
}
