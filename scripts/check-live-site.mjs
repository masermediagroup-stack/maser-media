#!/usr/bin/env node
import dns from 'node:dns/promises';

const domains = process.argv.slice(2).length ? process.argv.slice(2) : ['maestromedia.co'];
const expectedStrings = [
  'Maser Media brings brands',
  'Two creatives, tired of seeing people fall short',
];

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'maser-media-live-check/1.0' },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function inspectDomain(domain) {
  console.log(`\n[live-check] ${domain}`);

  try {
    const [aRecords, cnameRecords] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolveCname(domain),
    ]);
    const addresses = aRecords.status === 'fulfilled' ? aRecords.value : [];
    const cnames = cnameRecords.status === 'fulfilled' ? cnameRecords.value : [];
    console.log(`  A: ${addresses.length ? addresses.join(', ') : '(none)'}`);
    console.log(`  CNAME: ${cnames.length ? cnames.join(', ') : '(none)'}`);

    const pointsAtVercel =
      addresses.includes('76.76.21.21') ||
      cnames.some((record) => record.includes('vercel-dns.com'));
    if (!pointsAtVercel) {
      console.warn('  warning: DNS does not look like a standard Vercel custom-domain target.');
    }
  } catch (error) {
    console.warn(`  warning: DNS lookup failed: ${error.message}`);
  }

  for (const path of ['/', '/about']) {
    const url = `https://${domain}${path}`;
    try {
      const response = await fetchWithTimeout(url);
      const html = await response.text();
      const headers = ['server', 'x-vercel-id', 'x-vercel-cache']
        .map((name) => `${name}=${response.headers.get(name) ?? '(none)'}`)
        .join(' ');
      console.log(`  ${path}: ${response.status} ${response.url} ${headers}`);

      for (const expected of expectedStrings) {
        if (!html.includes(expected)) {
          console.warn(`  warning: missing expected copy: "${expected}"`);
        }
      }
    } catch (error) {
      console.warn(`  warning: fetch failed for ${url}: ${error.message}`);
    }
  }
}

for (const domain of domains) {
  await inspectDomain(domain);
}
