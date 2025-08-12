import { animate } from 'motion';

export function focusBloom(node: HTMLElement) {
  function onFocus() {
    animate(node, { scale: [1, 1.02, 1] }, { duration: 180, easing: [0.4, 0, 0.2, 1] });
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
    animate(node, { scale: [1, 0.96, 1] }, { duration: 140, easing: [0.4, 0, 0.2, 1] });
  }
  node.addEventListener('click', onClick);
  return {
    destroy() { node.removeEventListener('click', onClick); }
  };
}

