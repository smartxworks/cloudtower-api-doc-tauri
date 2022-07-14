import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import {
  ContentItemModel,
  ContentItemProps,
  OperationModel,
  LayoutVariant,
  ProStore,
  Section,
  SectionItem,
} from "@redocly/reference-docs";
import Operation from "../Operation";

const Skeleton: React.FC = () => {
  return <></>;
};

@observer
class OperationItem extends React.Component<{
  item: OperationModel;
  layout?: LayoutVariant;
}> {
  constructor(props) {
    super(props)
  }

  render(): React.ReactNode {
    return(<Operation operation={this.props.item} layout={this.props.layout}/>)
  }
}

@observer
class ContentItem extends React.Component<ContentItemProps> {
  render(): React.ReactNode {
    const { item, store } = this.props;
    let Wrapper: React.FC | null;
    switch (item.type) {
      case "group":
        Wrapper = null;
        break;
      case "tag":
      case "section":
      default:
        Wrapper = () => <SectionItem layout={store.layout} {...this.props} />;
        break;
      case "operation":
        Wrapper = () => <OperationItem item={item} layout={store.layout} />;
        break;
    }
    return (
      <React.Fragment>
        {Wrapper && (
          <Section id={item.id} underlined={item.type === "operation"}>
            <Wrapper />
          </Section>
        )}
 
        {item.items.length ? <ContentItems items={item.items} store={store} /> : null}
      </React.Fragment>
    );
  }
}

const ContentItems: React.FC<{
  items: ContentItemModel[];
  store: ProStore;
}> = observer(({ items, store }) => {
  const [isLoading, setIsLoading] = useState(
    !store.options.disablePaginationLoadingAnimation
  );

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 200);
  }, []);

  useEffect(() => {
    store.options.disablePaginationLoadingAnimation ||
      isLoading ||
      store.onDidMount();
  }, [isLoading, store.options.disablePaginationLoadingAnimation]);
  return items.length ? (
    <React.Fragment>
      {isLoading ? (
        <div
          style={{
            flex: 1,
            width: "100%",
          }}
        >
          <Skeleton />
        </div>
      ) : (
        items.map((item) => (
          <ContentItem key={item.id} item={item} store={store} />
        ))
      )}
    </React.Fragment>
  ) : null;
});

export default ContentItems;
