import i18next from '../i18n';

export const translateComponent = () => {
  // auth
  const auth_header = document.querySelector('#swagger-ui  #section\\/Authentication h1');
  if(auth_header) {
    auth_header.textContent = auth_header.textContent.replace('Authentication', i18next.t('components.Authentication'));
  }
  const auth_section = document.querySelector('#swagger-ui li[data-item-id="section\\/Authentication"] span[title="Authentication"]')
  if(auth_section) {
    auth_section.textContent = i18next.t('components.Authentication');
  }
  const securityTable = document.querySelector('#swagger-ui table.security-details');
  if(securityTable) {
    Array.from((securityTable as HTMLTableElement).tBodies[0].rows).forEach(row => {
      const [ th ] = Array.from(row.cells);
      th.innerText = th.innerText.replace('Security Scheme Type', i18next.t('components.securityType'));
      th.innerText = th.innerText.replace('Header parameter name', i18next.t('components.headerName'))
    })
  }

  // table header
  const tableHeaders = document.querySelectorAll('.sc-nVkyK');
  if(tableHeaders.length) {
    Array.from(tableHeaders).forEach((h:HTMLSpanElement) => {
      if(h.innerText === 'Request') {
        h.innerText = h.innerText.replace('Request', i18next.t('components.request'));
      } else if(h.innerText === 'Responses') {
        h.innerText = h.innerText.replace('Responses', i18next.t('components.response'))
      } else if(h.innerText === 'Request samples') {
        h.innerText = h.innerText.replace('Request samples', i18next.t('components.requestSample'))
      } else if(h.innerText === 'Response samples') {
        h.innerText = h.innerText.replace('Response samples', i18next.t('components.responseSample'))
      }
    })
  }
  // h5 
  const h5s = document.querySelectorAll('h5.sc-kDTinF');
  if(h5s.length) {
    Array.from(h5s).forEach((h:HTMLHeadElement) => {
      h.innerText = h.innerText.replace('SECURITY', i18next.t('components.security'));
      h.innerText = h.innerText.replace('HEADER PARAMETERS', i18next.t('components.headerParams'));
      h.innerText = h.innerText.replace('REQUEST BODY SCHEMA', i18next.t('components.requestBody'));
      h.innerText = h.innerText.replace('RESPONSE SCHEMA', i18next.t('components.responseSchema'))
    })
  }

  // try-it

  const tabs = document.querySelectorAll('.sc-kmQMED li');
  const transButton = () => {
    const tryItButtons = document.querySelectorAll('button.sc-kLwhqv');
    if(tryItButtons.length) {
      Array.from(tryItButtons).forEach((b:HTMLButtonElement) => {
        b.innerText = b.innerText.replace('Copy', i18next.t('components.copy'));
        b.innerText = b.innerText.replace('Expand all', i18next.t('components.expand'));
        b.innerText = b.innerText.replace('Collapse all', i18next.t('components.collapse'));
      })
    }
  }
  transButton();
  if(tabs.length) {
    Array.from(tabs).forEach((t: HTMLUListElement) => {
      const observer = new MutationObserver((mutations) => {
        transButton();
      });
      observer.observe(t, {attributes: true});
    })
  }
  const transTryIt = () => {
    const tryIt = document.querySelectorAll('#swagger-ui button[data-cy="try-it"]');
    if(tryIt.length) {
      Array.from(tryIt).forEach((h:HTMLButtonElement) => {
        h.innerText = h.innerText.replace('Try it', i18next.t('components.tryItOut'))
      })
    }
    const buttons = document.querySelectorAll('#swagger-ui button.sc-jCHUfY');
    if(buttons.length) {
      Array.from(buttons).forEach((button:HTMLButtonElement) => {
        button.innerText = button.innerText.replace('Request', i18next.t('components.request'));
        button.innerText = button.innerText.replace('Response', i18next.t('components.response'));
      })
    }
    const send = document.querySelector('[data-cy="send-button"]') as HTMLButtonElement;
    if(send) {
      send.innerText = send.innerText.replace('Send', i18next.t('components.send'))
    }
  }
  transTryIt();
  const codeSample = document.querySelectorAll('[data-cy="samples-block"]');
  if(codeSample.length) {
    Array.from(codeSample).forEach((c:HTMLDivElement) => {
      const observer = new MutationObserver(() => {
        transTryIt();
      })
      observer.observe(c, { childList: true})
    })
  }

}