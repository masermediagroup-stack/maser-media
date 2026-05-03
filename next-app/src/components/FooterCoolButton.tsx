'use client';

import { Button } from '@/components/ui/button';
import { CoolMode } from '@/registry/magicui/cool-mode';

export function FooterCoolButton() {
  return (
    <div className="mm-footer-cool-button pointer-events-auto absolute z-10">
      <CoolMode>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-sm leading-tight line-through shadow-none"
          aria-label="Joke control: the label is crossed out on purpose. Press or drag on the button to play a short decorative particle animation."
        >
          DON&apos;T CLICK ME
        </Button>
      </CoolMode>
    </div>
  );
}
