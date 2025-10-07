import { animate } from 'motion';

export function addFocusBloom(node: HTMLElement) {
  function onFocus() {
    animate(node, { transform: ['scale(1)', 'scale(1.02)', 'scale(1)'] } as any, { duration: 0.18 } as any);
  }
  node.addEventListener('focus', onFocus, true);
  return () => node.removeEventListener('focus', onFocus, true);
}

export function addClickPulse(node: HTMLElement) {
  function onClick() {
    animate(node, { transform: ['scale(1)', 'scale(0.96)', 'scale(1)'] } as any, { duration: 0.14 } as any);
  }
  node.addEventListener('click', onClick);
  return () => node.removeEventListener('click', onClick);
}

export function bloomElement(node: HTMLElement) {
  animate(
    node,
    { transform: ['scale(0.98)', 'scale(1.02)', 'scale(1)'], opacity: [0.9, 1, 1] } as any,
    { duration: 0.4 } as any
  );
}

export function addSparkleHover(node: HTMLElement) {
  function onMouseEnter() {
    animate(
      node,
      {
        transform: ['rotate(0deg) scale(1)', 'rotate(180deg) scale(1.1)', 'rotate(360deg) scale(1)']
      } as any,
      {
        duration: 0.6,
        easing: [0.4, 0.0, 0.2, 1] // ease-in-out cubic bezier
      } as any
    );
  }

  node.addEventListener('mouseenter', onMouseEnter);
  return () => node.removeEventListener('mouseenter', onMouseEnter);
}
