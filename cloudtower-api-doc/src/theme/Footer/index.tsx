import React, {useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import i18next from '../../../swagger/i18n';

interface FooterItem {
  type: 'link' | 'text' | 'copyright' | 'logo' | 'logo-text';
  href?: string;
  i18nKey?: string;
  text?: string; // 如果没有 i18nKey，直接使用 text
  src?: string; // for logo
  alt?: string; // for logo
}

interface FooterSection {
  items: FooterItem[];
}

interface FooterArea {
  logo?: string;
  text?: string | {i18nKey: string};
  items?: FooterItem[];
  top?: FooterSection;
  bottom?: FooterSection;
}

interface FooterConfig {
  left?: FooterArea;
  right?: FooterArea;
  separator?: string; // 默认 '·'
}

export default function Footer(): JSX.Element {
  const {i18n, siteConfig: { customFields }} = useDocusaurusContext();
  const footerConfig = customFields.footer as FooterConfig;
  const currentYear = new Date().getFullYear();
  const separator = footerConfig?.separator || '·';

  // 监听语言变化，同步更新 i18next
  useEffect(() => {
    i18next.changeLanguage(i18n.currentLocale);
  }, [i18n.currentLocale]);

  // 获取翻译文本
  const getText = (item: FooterItem | {i18nKey?: string; text?: string}): string => {
    if ('i18nKey' in item && item.i18nKey) {
      // 使用 i18next 进行翻译，namespace 为 components
      return i18next.t(item.i18nKey, {ns: 'components', defaultValue: item.text || ''});
    }
    return item.text || '';
  };

  // 渲染单个 item
  const renderItem = (item: FooterItem, index: number, items: FooterItem[]): React.ReactNode => {
    const content = getText(item);
    
    if (item.type === 'logo') {
      const logoUrl = item.src ? useBaseUrl(item.src) : null;
      return logoUrl ? (
        <img key={index} className="logo" src={logoUrl} alt={item.alt || ''} />
      ) : null;
    }

    if (item.type === 'logo-text') {
      return (
        <span key={index} className="logo-text">
          {content}
        </span>
      );
    }

    if (item.type === 'copyright') {
      return (
        <span key={index} className="copyright footer-copyright">
          {content.replace('{year}', currentYear.toString())}
        </span>
      );
    }

    if (item.type === 'link' && item.href) {
      return (
        <React.Fragment key={index}>
          <a href={item.href} className="footer-link">
            {content}
          </a>
          {index < items.length - 1 && (
            <span className="footer-separator">{separator}</span>
          )}
        </React.Fragment>
      );
    }

    if (item.type === 'text') {
      return (
        <React.Fragment key={index}>
          <span>{content}</span>
          {index < items.length - 1 && (
            <span className="footer-separator">{separator}</span>
          )}
        </React.Fragment>
      );
    }

    return null;
  };

  // 渲染一个区域（left 或 right）
  const renderArea = (area: FooterArea, className: string): React.ReactNode => {
    if (!area) return null;

    const {logo, text, items, top, bottom} = area;

    // 构建要渲染的 items 列表
    const allItems: FooterItem[] = [];

    // 如果有 logo，添加到 items 开头
    if (logo) {
      allItems.push({
        type: 'logo',
        src: logo
      });
    }

    // 如果有 text，添加到 items
    if (text) {
      const textContent = typeof text === 'string' 
        ? text 
        : text?.i18nKey 
          ? i18next.t(text.i18nKey, {ns: 'components', defaultValue: ''})
          : '';
      if (textContent) {
        allItems.push({
          type: 'text',
          text: textContent
        });
      }
    }

    // 如果有 items，添加到列表
    if (items && items.length > 0) {
      allItems.push(...items);
    }

    // 渲染区域内容
    const hasTop = top && top.items && top.items.length > 0;
    const hasBottom = bottom && bottom.items && bottom.items.length > 0;
    const hasItems = allItems.length > 0;

    if (!hasTop && !hasBottom && !hasItems) {
      return null;
    }

    return (
      <div className={className}>
        {/* 如果有 top/bottom 结构，使用多行布局 */}
        {(hasTop || hasBottom) ? (
          <>
            {/* 如果有 logo/text/items，先渲染它们 */}
            {hasItems && (
              <div className="footer-area-items">
                {allItems.map((item, index) => renderItem(item, index, allItems))}
              </div>
            )}
            {hasTop && (
              <div className="footer-area-top">
                {top.items.map((item, index) => renderItem(item, index, top.items))}
              </div>
            )}
            {hasBottom && (
              <div className="footer-area-bottom">
                {bottom.items.map((item, index) => renderItem(item, index, bottom.items))}
              </div>
            )}
          </>
        ) : (
          /* 否则使用单行布局，渲染所有 items */
          <div className="footer-area-items">
            {allItems.map((item, index) => renderItem(item, index, allItems))}
          </div>
        )}
      </div>
    );
  };

  // 如果配置了自定义 footer，使用自定义组件
  if (footerConfig && (footerConfig.left || footerConfig.right)) {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer__links">
            {renderArea(footerConfig.left, 'footer-left')}
            {renderArea(footerConfig.right, 'footer-right')}
          </div>
        </div>
      </footer>
    );
  }

  return null;
}