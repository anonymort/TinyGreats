// Helper to convert Lucide IconNode to SVG element
type IconNode = [tag: string, attrs: Record<string, string | number>][];

export function iconToSVG(icon: IconNode, size: number = 24): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  // Set SVG attributes
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  // Create child elements
  icon.forEach(([tag, attrs]) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    svg.appendChild(element);
  });

  return svg;
}
