import React from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import type {Props} from '@theme/TOC';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

// Using a custom className
// This prevents TOCInline/TOCCollapsible getting highlighted by mistake
const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

interface TOCConfig {
  title?:string;
}
export default function TOC({className, ...props}: Props): JSX.Element {
  const { siteConfig: { customFields }} = useDocusaurusContext();

  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}>
      {
        (customFields.toc as TOCConfig)?.title ?
        <span className="table-of-contents__title">{(customFields.toc as TOCConfig).title}</span> : null
      }
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </div>
  );
}
