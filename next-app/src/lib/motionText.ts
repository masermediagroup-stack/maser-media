/**
 * Wraps non-whitespace runs in direct text descendants into `<span class="mm-word">`.
 * Idempotent via `data-mm-split-wrapped`.
 */
export function wrapWordsInElement(root: HTMLElement): void {
  if (root.dataset.mmSplitWrapped === 'true') return;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (!text.trim()) return;
      const parent = node.parentNode;
      if (!parent || (node as Text).parentElement?.closest('.mm-word')) return;

      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else if (part) {
          const span = document.createElement('span');
          span.className = 'mm-word';
          span.textContent = part;
          frag.appendChild(span);
        }
      }
      parent.replaceChild(frag, node);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'SVG') return;

    const children = Array.from(el.childNodes);
    for (const child of children) walk(child);
  };

  walk(root);
  root.dataset.mmSplitWrapped = 'true';
}

/**
 * Splits `textContent` of `root` into per-character spans (`.mm-char`).
 * Use sparingly on short strings only.
 */
export function wrapCharsInElement(root: HTMLElement): void {
  if (root.dataset.mmCharSplit === 'true') return;
  const text = root.textContent ?? '';
  if (!text.trim()) return;

  root.textContent = '';
  const frag = document.createDocumentFragment();
  for (const ch of text) {
    if (ch === '\n') {
      frag.appendChild(document.createElement('br'));
      continue;
    }
    const span = document.createElement('span');
    span.className = 'mm-char';
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    frag.appendChild(span);
  }
  root.appendChild(frag);
  root.dataset.mmCharSplit = 'true';
}
