import React from "react";
import { observer } from "mobx-react";
import { configure } from "mobx";
import {
  RedoclyReferenceDocsStandaloneProps,
  ErrorBoundary,
  ProStoreProvider,
  argValueToBoolean,
  RedocNormalizedOptions,
  RedoclyReferenceDocs as RedoclyReferenceDocsComponent,
  Loading,
  ProProviders,
  CssFixes,
  Console,
  StickyResponsiveSidebar,
  ApiLogo,
  LayoutVariant,
  ApiInfo,
  ContinueButton,
  SideMenu
} from "@redocly/reference-docs";
import {
  RedocWrap,
  ApiContentWrap,
  BackgroundStub,
  BackgroundStubFix,
} from "@redocly/reference-docs/lib/components/styled.elements";
import { VersionSwitcher } from "@redocly/reference-docs/lib/components/VersionSwitcher";
import { VersionedSpecStore } from "@redocly/reference-docs/lib/services/VersionedSpecStore";
import ContentItems from './ContentItems'

configure({ useProxies: "ifavailable" });

@observer
class RedoclyReferenceDocs extends RedoclyReferenceDocsComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const { store } = this.props;
    const { options, definition } = store;
    return (
      <ProProviders store={store}>
        <RedocWrap className="redoc-wrap" ref={this.rootElementRef}>
          <CssFixes
            layout={store.layout}
            showRightPanel={store.showRightPanel}
            whiteLabel={options.whiteLabel}
          />
          {store.tryItOperation && (
            <Console
              rootElement={this.rootElementRef.current}
              store={store}
              operation={store.tryItOperation}
              onClose={this.handleClose}
            />
          )}
          {!options.disableSidebar && (
            <StickyResponsiveSidebar menu={store.menu} className="menu-content">
              {!options.hideLogo && <ApiLogo info={definition.info} />}
              {definition instanceof VersionedSpecStore && (
                <VersionSwitcher
                  spec={definition}
                  onChange={(e) => {
                    e.idx && definition.changeVersion(e.idx);
                    store.menu.updateItemsByVersionChange();
                    store.tryItOut();
                  }}
                />
              )}
              <SideMenu menu={store.menu}/>
            </StickyResponsiveSidebar>
          )}
          <ApiContentWrap
            className={(store.isLoading ? "loading " : "") + "api-content"}
            layout={
              store.layout === LayoutVariant.THREE_PANEL && store.showRightPanel
                ? LayoutVariant.THREE_PANEL
                : LayoutVariant.STACKED
            }
          >
            {options.theme.layout.showDarkRightPanel &&
              store.showRightPanel &&
              store.layout !== LayoutVariant.STACKED && <BackgroundStub />}
            {!options.hideInfoSection &&
              ("none" === options.pagination ||
                store.menu.activeRenderItemIdx <= 0) && (
                <ApiInfo store={store} />
              )}
            <ContentItems items={store.menu.renderItems as any} store={store} />
            {options.showNextButton && (
              <ContinueButton
                pagination={options.pagination}
                menu={store.menu}
              />
            )}
            {this.props.children}
          </ApiContentWrap>
          {store.options.theme.layout.showDarkRightPanel &&
            store.showRightPanel &&
            store.layout !== LayoutVariant.STACKED && <BackgroundStubFix />}
        </RedocWrap>
      </ProProviders>
    );
  }
}
const Redoc: React.FC<RedoclyReferenceDocsStandaloneProps> = (props) => {
  const ProStoreWrapper: React.FC<
    Omit<Parameters<typeof ProStoreProvider>[0], "children"> & {
      hideLoading?: boolean;
    }
  > = ({
    definition,
    definitionUrl,
    options,
    activeItemId,
    activeDeepLink,
    activeSampleLanguage,
  }) => {
    const hideLoading = argValueToBoolean(options.hideLoading, false);
    const redocOptions = new RedocNormalizedOptions(options);
    return (
      <ProStoreProvider
        options={options}
        definition={definition}
        activeDeepLink={activeDeepLink}
        activeItemId={activeItemId}
        activeSampleLanguage={activeSampleLanguage}
        definitionUrl={definitionUrl}
      >
        {({ loading, store }) =>
          loading ? (
            hideLoading ? null : (
              <Loading color={redocOptions.theme.colors.primary.main} />
            )
          ) : (
            <RedoclyReferenceDocs store={store} />
          )
        }
      </ProStoreProvider>
    );
  };
  return props.options.disableErrorBoundary ? (
    <ProStoreWrapper {...props} />
  ) : (
    <ErrorBoundary>
      <ProStoreWrapper {...props} />
    </ErrorBoundary>
  );
};

export default Redoc;
