// stolen
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';

// Create adaptor for DOM-less environment
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

// Initialize MathJax document
const mjDocument = mathjax.document('', {
    InputJax: new TeX({ packages: ['base', 'ams'] }),
    OutputJax: new SVG({ fontCache: 'local' })
});

const mjOptions = {
    em: 16,
    ex: 8,
    containerWidth: 1280,
};

// Convert math string to SVG
export function getMathjaxSVG(math: string): string {
    const node = mjDocument.convert(math, mjOptions);
    return adaptor.innerHTML(node);
}
