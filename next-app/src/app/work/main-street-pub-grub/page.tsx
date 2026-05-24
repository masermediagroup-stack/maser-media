import type { Metadata } from 'next';

import { Nav } from '@/components';
import { ProjectPlaceholderPage } from '../project-placeholder';

export const metadata: Metadata = {
  title: 'Main Street Pub & Grub - Maser Media',
  description: 'Placeholder case study page for the Main Street Pub & Grub brand identity project.',
};

export default function MainStreetPubGrubPage() {
  return (
    <>
      <Nav />
      <ProjectPlaceholderPage
        eyebrow="Hospitality brand identity"
        title="Main Street Pub & Grub"
        summary="A neighborhood pub brand system built to feel welcoming, recognizable, and easy to carry across the room, menu, and local launch materials."
      />
    </>
  );
}
