'use client';

import { Button } from '@/components/ui/button';
import { CoolMode } from '@/registry/magicui/cool-mode';

export function FooterCoolButton() {
  return (
    <div className="pointer-events-auto absolute right-4 bottom-[calc(clamp(4.5rem,8vw,6rem)+1rem)] z-10 sm:right-6 sm:bottom-[calc(clamp(4.5rem,8vw,6rem)+1.25rem)]">
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
