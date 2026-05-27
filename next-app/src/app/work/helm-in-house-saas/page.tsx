import type { Metadata } from 'next';

import { InnerRouteShell } from '@/components';
import { ProjectPlaceholderPage } from '../project-placeholder';

export const metadata: Metadata = {
  title: 'Helm In-House SAAS - Maser Media',
  description: 'Placeholder case study page for the Helm in-house SaaS project.',
};

export default function HelmInHouseSaasPage() {
  return (
    <InnerRouteShell>
      <ProjectPlaceholderPage
        eyebrow="Internal SaaS build"
        title="Helm In-House SAAS"
        summary="An internal tool we are building to support how creative studios plan, organize, and move client work from idea to launch."
      />
    </InnerRouteShell>
  );
}
