import React from 'react';
import Servers from './components/Servers';
import { CommonSwaggerProps, translateComponent } from './utils';

interface ILayoutState {
  customServers: { url: string }[];
}
export default class extends React.PureComponent<
  CommonSwaggerProps,
  ILayoutState
> {
  constructor(props: CommonSwaggerProps) {
    super(props);
    this.state = {
      customServers: [],
    };
  }

  componentDidUpdate(_p: CommonSwaggerProps, prevState: ILayoutState) {
    if (prevState.customServers.length !== this.state.customServers.length) {
      const { specActions, specSelectors } = this.props;

      const spec = specSelectors.specJson().toJS();
      specActions.updateSpec(
        JSON.stringify({
          ...spec,
          servers: this.state.customServers,
        })
      );
    }
    translateComponent();
  }

  render() {
    const { getComponent, specSelectors } = this.props;
    const { customServers } = this.state;
    const Container = getComponent('Container');
    const Row = getComponent('Row');
    const Col = getComponent('Col');

    const SvgAssets = getComponent('SvgAssets');
    const VersionPragmaFilter = getComponent('VersionPragmaFilter');
    const Errors = getComponent('errors', true);
    const InfoContainer = getComponent('InfoContainer', true);
    const Operations = getComponent('operations', true);
    const Models = getComponent('Models', true);

    const SchemesContainer = getComponent('SchemesContainer', true);
    const AuthorizeBtnContainer = getComponent('AuthorizeBtnContainer', true);
    const FilterContainer = getComponent('FilterContainer', true);

    const schemes = specSelectors.schemes();
    const paths = specSelectors.paths();

    const hasPaths = paths && paths.size;
    const hasSchemes = schemes && schemes.size;
    const hasSecurityDefinitions = !!specSelectors.securityDefinitions();

    const isSwagger2 = specSelectors.isSwagger2();
    const isOAS3 = specSelectors.isOAS3();

    const loadingStatus = specSelectors.loadingStatus();


    let loadingMessage = null;
    if (loadingStatus === 'loading') {
      loadingMessage = (
        <div className="info">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      );
    }

    if (loadingMessage) {
      return (
        <div className="swagger-ui">
          <div className="loading-container">{loadingMessage}</div>
        </div>
      );
    }

    return (
      <Container className="swagger-ui">
        <div className="swagger-ui">
          <SvgAssets />
          <VersionPragmaFilter
            isSwagger2={isSwagger2}
            isOAS3={isOAS3}
            alsoShow={<Errors />}>
            <Errors />
            <Row className="information-container">
              <Col mobile={12}>
                <InfoContainer />
              </Col>
            </Row>

            {hasSchemes || hasSecurityDefinitions ? (
              <div className="scheme-container">
                <Col className="schemes wrapper" mobile={12}>
                  <Servers
                    {...this.props}
                    addServer={server => {
                      const servers = customServers.concat([{ url: server }]);
                      this.setState({ customServers: servers });
                    }}
                  />
                  {hasSchemes ? <SchemesContainer /> : null}
                  {hasSecurityDefinitions ? <AuthorizeBtnContainer /> : null}
                </Col>
              </div>
            ) : null}

            <FilterContainer />
            {
              hasPaths && (
                <Row>
                  <Col mobile={12} desktop={12}>
                    <Operations />
                  </Col>
                </Row>
              )
            }
            <Row>
              <Col mobile={12} desktop={12}>
                <Models />
              </Col>
            </Row>
          </VersionPragmaFilter>
        </div>
      </Container>
    );
  }
}
