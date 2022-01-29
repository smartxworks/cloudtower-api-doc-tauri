import i18next from '../i18n';

export const translateComponent = () => {
  // auth
  const auth_btn = document.querySelector('#swagger-ui > section > div > div:nth-child(2) > div.scheme-container > section > div.auth-wrapper > button span');
  if(auth_btn) { auth_btn.textContent = auth_btn.textContent.replace('Authorize', i18next.t('components.authorization'))}

  //example
  const example_tab = document.querySelectorAll('#swagger-ui [data-name="example"]');
  if(example_tab.length) { Array.from(example_tab).forEach(tab => tab.textContent = tab.textContent.replace('Example Value', i18next.t('components.exampleValue')))}

  //model
  const model_tab = document.querySelectorAll('#swagger-ui [data-name="model"]');
  if(model_tab.length) { Array.from(model_tab).forEach(tab => tab.textContent = tab.textContent.replace('Schema', i18next.t('components.schema')))}

  //parameter
  const parameters = document.querySelectorAll('#swagger-ui div.opblock-section-header div.tab-header > div > h4 > span');
  if(parameters.length) {
    Array.from(parameters).forEach(param => {
      param.textContent = param.textContent.replace('Parameters', i18next.t('components.parameters'))
    })
  }
  const param_names = document.querySelectorAll('.col_header.parameters-col_name');
  if(param_names.length) {
    Array.from(param_names).forEach(name => {
      name.textContent = name.textContent.replace('Name', i18next.t('components.name'))
    })
  }
  const param_des = document.querySelectorAll('.col_header.parameters-col_description')
  if(param_des.length) {
    Array.from(param_des).forEach(des => {
      des.textContent = des.textContent.replace('Description', i18next.t('components.description'))
    })
  }

  const section_header = document.querySelectorAll('.opblock-section-header .opblock-title');
  if(section_header.length) {
    Array.from(section_header).forEach(section => {
      section.textContent = section.textContent.replace('Request body', i18next.t('components.requestBody'))
    })
  } 

  // response
  const response_section = document.querySelectorAll('.responses-wrapper .opblock-section-header h4');
  if(response_section.length) {
    Array.from(response_section).forEach(section => {
      section.textContent = section.textContent.replace('Responses', i18next.t('components.responses'))
    })
  }
  const response_code = document.querySelectorAll('.col_header.response-col_status');
  if(response_code.length) {
    Array.from(response_code).forEach(code => {
      code.textContent = code.textContent.replace('Code', i18next.t('components.code'))
    })
  }
  const response_des = document.querySelectorAll('.col_header.response-col_description');
  if(response_des.length) {
    Array.from(response_des).forEach(des => {
      des.textContent = des.textContent.replace('Description', i18next.t('components.description'))
    })
  }

  // try-it-out
  const tio_btn = document.querySelector('.btn.try-out__btn');
  if(tio_btn) { tio_btn.textContent = i18next.t('components.tryItOut')}

  // filter
  const filter = document.querySelector('.filter.wrapper input');
  if(filter) { (filter as HTMLInputElement).placeholder = i18next.t('components.filter_placeholder')}
}