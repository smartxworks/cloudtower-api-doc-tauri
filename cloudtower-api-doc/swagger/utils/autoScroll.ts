import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export const autoScroll = () => {
  const { hash } = document.location;
  const decode_hash = decodeURIComponent(hash)
  if(!decode_hash) return;
  const exsitMapComponent = document.querySelector(decode_hash);
  if(exsitMapComponent) {
    exsitMapComponent.scrollIntoView();
  }
}
if (ExecutionEnvironment.canUseDOM) {
  window.addEventListener('load', autoScroll)
}