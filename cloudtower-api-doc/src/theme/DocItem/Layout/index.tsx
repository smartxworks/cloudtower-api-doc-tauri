import React from "react";
import clsx from "clsx";
import { useWindowSize } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocItemFooter from "@theme/DocItem/Footer";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemContent from "@theme/DocItem/Content";
import type { Props } from "@theme/DocItem/Layout";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";

import styles from "./styles.module.scss";

function useDocTOC() {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({ children }: Props): JSX.Element {
  const docTOC = useDocTOC();
  return (
    // <div className="row" id={"doc-row"}>
    //   <div id="center" className={clsx("col",!docTOC.hidden && styles.docItemCol)}>
    //     <DocVersionBanner />
    //     <div className={styles.docItemContainer}>
    //       <article>
    //         <DocItemContent>{children}</DocItemContent>
    //         <DocItemFooter />
    //       </article>
    //       <DocItemPaginator />
    //     </div>
    //   </div>

    // </div>
    <div className="row">
      <div className={clsx("col", !docTOC.hidden && styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      <div className="col sidebar-wrapper col--3">
        <div className="right-sidebar">{docTOC.desktop}</div>
      </div>
    </div>
  );
}
