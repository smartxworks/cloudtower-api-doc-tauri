export const autoScroll = () => {
  const { hash } = document.location;
  const decode_hash = decodeURIComponent(hash)
  const exsitMapComponent = document.querySelector(decode_hash);
  if(exsitMapComponent) {
    exsitMapComponent.scrollIntoView();
  }
}

window.addEventListener('load', autoScroll)