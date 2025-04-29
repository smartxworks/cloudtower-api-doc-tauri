import React from "react";
import clsx from "clsx";
import NavbarMobileSidebarSecondaryMenu from "@theme/Navbar/MobileSidebar/SecondaryMenu";
import TOCItems from "@theme/TOCItems";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";

import styles from "./styles.module.scss";

const SegmentedControl: React.FC<{
  activeIndex: number;
  onChange: (index: number) => void;
}> = (props) => {
  const { activeIndex, onChange } = props;

  return (
    <div className={clsx("col", styles.segmentedControl)}>
      <div
        className={clsx(styles.segmentedControlItem, {
          [styles.segmentedControlItemActive]: activeIndex === 0,
        })}
        onClick={() => onChange(0)}
      >
        文档目录
      </div>
      <div
        className={clsx(styles.segmentedControlItem, {
          [styles.segmentedControlItemActive]: activeIndex === 1,
        })}
        onClick={() => onChange(1)}
      >
        文档目录
      </div>
    </div>
  );
};

const MobileSidebarContent: React.FC<{ activeIndex: number }> = (props) => {
  const { activeIndex } = props;

  return (
    <div className={styles.mobileSidebarContent}>
      {activeIndex === 0 ? <NavbarMobileSidebarSecondaryMenu /> : <MobileToc />}
    </div>
  );
};

const MobileToc: React.FC = () => {
  const themeConfig = useThemeConfig();
  const minHeadingLevel = themeConfig.tableOfContents.minHeadingLevel;
  const maxHeadingLevel = themeConfig.tableOfContents.maxHeadingLevel;
  const { toc } = useDoc();
  return (
    <div className={styles.mobileToc}>
      <TOCItems
        toc={toc}
        minHeadingLevel={minHeadingLevel}
        maxHeadingLevel={maxHeadingLevel}
      />
    </div>
  );
};

const MobileSidebar: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div className={clsx("col", styles.mobileSidebar, "popup")}>
      <div className={styles.segmentedControlWrap}>
        <SegmentedControl
          activeIndex={activeIndex}
          onChange={(index) => setActiveIndex(index)}
        />
      </div>
      <MobileSidebarContent activeIndex={activeIndex} />
    </div>
  );
};

export default MobileSidebar;
