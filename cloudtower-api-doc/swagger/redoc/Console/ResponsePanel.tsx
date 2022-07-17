import React, { useEffect, useState } from "react";
import { ResponsePanel as ResponsePanelComponent } from "@redocly/reference-docs/lib/components/console/ResponsePanel";
import { styled } from "@redocly/reference-docs/lib/redoc-lib";
import { StyledPre } from "@redocly/reference-docs/lib/redoc-lib/src/common-elements";
import { ResponseBody } from "@redocly/reference-docs/lib/components/console/ResponseBody";
import i18next from '../../i18n'

const ResponseBadges = styled.div`
  margin-bottom: 10px;
`;
const ResponseBadgeBase = styled.div`
  display: inline-block;
  margin-right: 20px;
  padding: 2px 0;
  text-align: center;
  color: ${(prop) => prop.theme.colors.text.light};
`;
const ResponseBadge = styled(ResponseBadgeBase)`
  color: ${(e) => {
    const t = e.theme,
      n = e.code;
    return n >= 200 && n < 300
      ? t.colors.responses.success.tabTextColor
      : n >= 300 && n < 400
      ? t.colors.responses.redirect.tabTextColor
      : n > 400
      ? t.colors.responses.error.tabTextColor
      : t.colors.responses.info.tabTextColor;
  }};
`;
const HeaderName = styled.strong`
  text-transform: capitalize;
  display: inline-block;
  padding-right: 5px;
`;
const ErrorHeader = styled.header`
  font-weight: bold;
  margin-bottom: 10px;
`;
const ErrorDetails = styled.code`
  border-left: 3px solid #ff4040;
  padding-left: 5px;
`;
const ResponseHeader = styled.div`
  margin-bottom: 10px;
  &:not(:first-child) {
    margin-top: 10px;
  }
`;
const PanelStyledPre = styled(StyledPre)`
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

export const ResponsePanelWrap:React.FC = (props) => {
  const [lng, setLng] = useState<string>(i18next.language);
  useEffect(() => {
    i18next.on('languageChanged', setLng);
    return () => {
      i18next.off('languageChanged', setLng);
    }
  }, [])
  return <>
    <span data-lng={lng}></span>
    {props.children}
  </>
}
export class ResponsePanel extends ResponsePanelComponent {
  constructor(props) {
    super(props);
  }
  render(): JSX.Element {
    const { error, response, time } = this.props;
    const res = response || error?.response;
    const resData = res?.data?.length || 0;
    const resDataSize =
      resData > 1 * 1_000 * 1_000
        ? ((resData / 1_000) * 1_000).toFixed(2) + " MB"
        : resData > 1_000
        ? (resData / 1_000).toFixed(2) + " KB"
        : resData + " B";
    if ((error && !error.response) || !res) {
      return (
        <>
          <ErrorHeader>{i18next.t('components.ResponseHeader_1')}</ErrorHeader>
          <ErrorDetails>{error?.message || "Unknown error"}</ErrorDetails>
          <br />
          <ErrorHeader>{i18next.t('components.ResponseHeader_2')}</ErrorHeader>
          <div>{i18next.t('components.ResponseErrorReason_1')}</div>
          <div>{i18next.t('components.ResponseErrorReason_2')}</div>
          <div>{i18next.t('components.ResponseErrorReason_3')}</div>
          <div>{i18next.t('components.ResponseErrorReason_4')}</div>
          <div>{i18next.t('components.ResponseErrorReason_5')}</div>
          <div>{i18next.t('components.ResponseErrorReason_6')}</div>
        </>
      );
    }
    if (!res) {
      return <>{i18next.t('components.ResponseHeader_3')}</>;
    }
    const headers = Object.keys(res.headers);
    return (
      <ResponsePanelWrap>
        <ResponseBadges>
          <ResponseBadge code={res.status}>
            <span>
              {i18next.t('components.Status')}{res.status} {res.statusText}
            </span>
          </ResponseBadge>
          <ResponseBadgeBase>
            <span>{i18next.t('components.Time')}{time} ms</span>
          </ResponseBadgeBase>
          <ResponseBadgeBase>
            <span>{i18next.t('components.Size')}{resDataSize}</span>
          </ResponseBadgeBase>
        </ResponseBadges>
        <div>
          <ResponseHeader>{i18next.t('components.Headers')} </ResponseHeader>
          <PanelStyledPre>
            {headers.map((header) => (
              <div key={header}>
                <HeaderName>{header}:</HeaderName>
                <code>{res.headers[header]}</code>
              </div>
            ))}
          </PanelStyledPre>
          <ResponseBody response={res} />
        </div>
      </ResponsePanelWrap>
    );
  }
}
