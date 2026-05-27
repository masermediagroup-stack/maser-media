#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const pullFastForward = args.has('--pull-ff-only');
const hookMode = args.has('--hook');

function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function tryGit(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(`\n[sync-check] ${message}`);
  process.exitCode = 1;
}

const branch = tryGit(['branch', '--show-current']) || '(detached)';
const head = tryGit(['rev-parse', '--short=12', 'HEAD']) || '(unknown)';
const upstream = tryGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
const dirtyLines = (tryGit(['status', '--porcelain=v1']) || '')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);
const remoteMain = (tryGit(['ls-remote', 'origin', 'refs/heads/main']) || '').split(/\s+/)[0] || null;
const localOriginMain = tryGit(['rev-parse', 'origin/main']);

console.log(`[sync-check] branch=${branch} head=${head} upstream=${upstream ?? 'none'} dirty=${dirtyLines.length}`);

if (!remoteMain) {
  fail('Could not read origin/main from GitHub. Check network/auth before starting production work.');
} else if (localOriginMain && localOriginMain !== remoteMain) {
  console.log(`[sync-check] GitHub main has newer refs than local origin/main: ${remoteMain.slice(0, 12)}`);
}

if (dirtyLines.length) {
  console.log('[sync-check] Local uncommitted files:');
  dirtyLines.slice(0, 20).forEach((line) => console.log(`  ${line}`));
  if (dirtyLines.length > 20) console.log(`  ...and ${dirtyLines.length - 20} more`);
}

if (!pullFastForward) {
  if (remoteMain && localOriginMain && localOriginMain !== remoteMain) {
    fail('Run npm run sync:pull from a clean tree, or commit/stash local work before pulling.');
  } else if (!hookMode) {
    console.log('[sync-check] Local origin/main ref is current. Use npm run sync:pull to fast-forward safely.');
  }
  process.exit();
}

if (dirtyLines.length) {
  fail('Refusing to pull with a dirty working tree. Commit or stash local work first.');
  process.exit();
}

git(['fetch', '--prune', 'origin'], { stdio: 'inherit' });

const [aheadRaw = '0', behindRaw = '0'] = (tryGit(['rev-list', '--left-right', '--count', 'HEAD...origin/main']) || '0 0')
  .split(/\s+/);
const ahead = Number(aheadRaw);
const behind = Number(behindRaw);

if (ahead > 0 && behind > 0) {
  fail(`Local ${branch} has diverged from origin/main (${ahead} ahead, ${behind} behind). Resolve manually.`);
} else if (ahead > 0) {
  fail(`Local ${branch} is ${ahead} commit(s) ahead of origin/main. Push or branch before pulling.`);
} else if (behind > 0) {
  git(['pull', '--ff-only', 'origin', 'main'], { stdio: 'inherit' });
  console.log('[sync-check] Fast-forward pull complete.');
} else {
  console.log('[sync-check] Already up to date with origin/main.');
}
