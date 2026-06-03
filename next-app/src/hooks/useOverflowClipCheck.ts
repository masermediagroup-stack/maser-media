'use client';

import { useEffect, type RefObject } from 'react';

export type OverflowClipIssue = {
  kind: 'self-scroll' | 'ancestor-clip';
  label: string;
  details: string;
};

export type UseOverflowClipCheckOptions = {
  label?: string;
  enabled?: boolean;
  /** Extra px tolerance before reporting */
  tolerance?: number;
  onIssue?: (issues: OverflowClipIssue[]) => void;
};

function getOverflowClipAncestors(el: HTMLElement) {
  const ancestors: HTMLElement[] = [];
  let node = el.parentElement;

  while (node) {
    const style = getComputedStyle(node);
    const values = [style.overflow, style.overflowX, style.overflowY];
    if (values.some((value) => value === 'hidden' || value === 'clip')) {
      ancestors.push(node);
    }
    node = node.parentElement;
  }

  return ancestors;
}

function rectsOverflow(inner: DOMRectReadOnly, outer: DOMRectReadOnly, tolerance: number) {
  return (
    inner.left < outer.left - tolerance ||
    inner.top < outer.top - tolerance ||
    inner.right > outer.right + tolerance ||
    inner.bottom > outer.bottom + tolerance
  );
}

export function runOverflowClipCheck(
  root: HTMLElement,
  { label = 'element', tolerance = 2 }: Pick<UseOverflowClipCheckOptions, 'label' | 'tolerance'> = {},
): OverflowClipIssue[] {
  const issues: OverflowClipIssue[] = [];

  if (
    root.scrollWidth > root.clientWidth + tolerance ||
    root.scrollHeight > root.clientHeight + tolerance
  ) {
    issues.push({
      kind: 'self-scroll',
      label,
      details: `scroll ${root.scrollWidth}x${root.scrollHeight} exceeds client ${root.clientWidth}x${root.clientHeight}`,
    });
  }

  const watchNodes = [
    root,
    ...Array.from(root.querySelectorAll('img, canvas, svg, video')),
  ] as HTMLElement[];

  for (const ancestor of getOverflowClipAncestors(root)) {
    const ancestorRect = ancestor.getBoundingClientRect();
    for (const node of watchNodes) {
      if (!node.getClientRects().length) continue;
      const nodeRect = node.getBoundingClientRect();
      if (rectsOverflow(nodeRect, ancestorRect, tolerance)) {
        issues.push({
          kind: 'ancestor-clip',
          label,
          details: `${node.tagName.toLowerCase()} extends outside clipping ancestor (${ancestor.className || ancestor.tagName})`,
        });
      }
    }
  }

  return issues;
}

export function useOverflowClipCheck(
  ref: RefObject<HTMLElement | null>,
  options: UseOverflowClipCheckOptions = {},
) {
  const { label = 'element', enabled = true, tolerance = 2, onIssue } = options;

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV === 'production') return;

    const root = ref.current;
    if (!root) return;

    let lastStatus = '';

    const runCheck = () => {
      const target = ref.current;
      if (!target) return;

      const issues = runOverflowClipCheck(target, { label, tolerance });
      const status = issues.length === 0 ? 'ok' : 'fail';

      target.dataset.mmClipCheck = status;

      if (status !== lastStatus) {
        lastStatus = status;
        if (issues.length > 0) {
          console.warn(`[mm-overflow-clip] ${label}`, issues);
          onIssue?.(issues);
        }
      }
    };

    const scheduleCheck = () => {
      requestAnimationFrame(runCheck);
    };

    scheduleCheck();

    const resizeObserver = new ResizeObserver(scheduleCheck);
    resizeObserver.observe(root);

    window.addEventListener('resize', scheduleCheck, { passive: true });
    window.addEventListener('scroll', scheduleCheck, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleCheck);
      window.removeEventListener('scroll', scheduleCheck);
      delete root.dataset.mmClipCheck;
    };
  }, [enabled, label, onIssue, ref, tolerance]);
}
