import { animate } from 'motion';

export function focusBloom(node: HTMLElement) {
  function onFocus() {
    animate(node, { scale: [1, 1.02, 1] }, { duration: 0.18, easing: 'ease-out' });
  }
  node.addEventListener('focus', onFocus, true);
  return {
    destroy() {
      node.removeEventListener('focus', onFocus, true);
    }
  };
}

export function clickPulse(node: HTMLElement) {
  function onClick() {
    animate(node, { scale: [1, 0.96, 1] }, { duration: 0.14, easing: 'ease-out' });
  }
  node.addEventListener('click', onClick);
  return {
    destroy() { node.removeEventListener('click', onClick); }
  };
}

