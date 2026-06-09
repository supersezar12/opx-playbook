/**
 * OPX Deploy Monitor — v1.6
 *
 * Tracks GitHub commits against the currently running build.
 * Uses the public GitHub API (no auth required for public repos).
 * All state persisted in localStorage under 'opx_deploy_*' keys.
 *
 * Features:
 *  - Reads the current build's commit SHA from a stamped constant
 *  - Polls GitHub API every 60s for new commits on main branch
 *  - Compares remote HEAD vs deployed SHA → shows diff summary
 *  - Tracks "last known good" snapshot for rollback
 *  - Fires callbacks when new commits are detected
 */

// ── Stamped at build time by vite.config.ts ────────────────────────────────
// Vite replaces __DEPLOY_COMMIT__ with the actual git SHA during build.
// Falls back to 'dev' in local dev mode.
export const CURRENT_COMMIT: string =
  (typeof __DEPLOY_COMMIT__ !== 'undefined' ? __DEPLOY_COMMIT__ : 'dev') as string;

export const REPO_OWNER  = 'supersezar12';
export const REPO_NAME   = 'opx-playbook';
export const REPO_BRANCH = 'main';
export const GITHUB_API  = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

const LS_KEYS = {
  deployedCommit:    'opx_deploy_commit',
  deployedAt:        'opx_deploy_at',
  lastGoodCommit:    'opx_deploy_last_good',
  lastGoodAt:        'opx_deploy_last_good_at',
  buildState:        'opx_deploy_state',
  cachedCommits:     'opx_deploy_cached_commits',
  lastFetchedAt:     'opx_deploy_last_fetched',
  rollbackAvailable: 'opx_deploy_rollback',
} as const;

export type BuildState = 'live' | 'deploying' | 'failed' | 'unknown';

export interface CommitInfo {
  sha:     string;
  short:   string;   // first 7 chars
  message: string;
  author:  string;
  date:    string;   // ISO
  url:     string;
}

export interface DeployStatus {
  deployedCommit:    string;
  deployedShort:     string;
  deployedAt:        string;
  remoteCommit:      string;
  remoteShort:       string;
  remoteAt:          string;
  lastFetchedAt:     string;
  buildState:        BuildState;
  isAhead:           boolean;    // remote has commits not yet deployed
  aheadCount:        number;
  newCommits:        CommitInfo[];
  lastGoodCommit:    string;
  lastGoodAt:        string;
  rollbackAvailable: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function ls(key: string): string { try { return localStorage.getItem(key) ?? ''; } catch { return ''; } }
function lsSet(key: string, v: string): void { try { localStorage.setItem(key, v); } catch {} }
function short(sha: string): string { return sha.slice(0, 7); }

// ── Initialise deploy record on first load ────────────────────────────────
export function initDeployRecord(): void {
  if (!ls(LS_KEYS.deployedCommit)) {
    lsSet(LS_KEYS.deployedCommit, CURRENT_COMMIT);
    lsSet(LS_KEYS.deployedAt, new Date().toISOString());
    lsSet(LS_KEYS.buildState, 'live');
  }
}

export function getDeployedCommit(): string { return ls(LS_KEYS.deployedCommit) || CURRENT_COMMIT; }
export function getBuildState(): BuildState { return (ls(LS_KEYS.buildState) as BuildState) || 'unknown'; }
export function getLastGoodCommit(): string { return ls(LS_KEYS.lastGoodCommit); }

export function setBuildState(state: BuildState): void {
  lsSet(LS_KEYS.buildState, state);
  if (state === 'live') {
    const deployed = ls(LS_KEYS.deployedCommit);
    if (deployed) {
      lsSet(LS_KEYS.lastGoodCommit, deployed);
      lsSet(LS_KEYS.lastGoodAt, new Date().toISOString());
      lsSet(LS_KEYS.rollbackAvailable, 'true');
    }
  }
  if (state === 'failed') {
    lsSet(LS_KEYS.rollbackAvailable, 'true');
  }
}

export function markDeployed(sha: string): void {
  lsSet(LS_KEYS.deployedCommit, sha);
  lsSet(LS_KEYS.deployedAt, new Date().toISOString());
  setBuildState('live');
}

export function markRollback(): void {
  const good = ls(LS_KEYS.lastGoodCommit);
  if (good) {
    markDeployed(good);
    setBuildState('live');
  }
}

// ── Fetch latest commits from GitHub API ──────────────────────────────────
export async function fetchRemoteCommits(since?: string): Promise<CommitInfo[]> {
  const url = since
    ? `${GITHUB_API}/commits?sha=${REPO_BRANCH}&per_page=10&since=${since}`
    : `${GITHUB_API}/commits?sha=${REPO_BRANCH}&per_page=10`;

  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);

  const data = await res.json() as Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    html_url: string;
  }>;

  return data.map(c => ({
    sha:     c.sha,
    short:   short(c.sha),
    message: c.commit.message.split('\n')[0].slice(0, 80),
    author:  c.commit.author.name,
    date:    c.commit.author.date,
    url:     c.html_url,
  }));
}

// ── Get full deploy status ─────────────────────────────────────────────────
export async function getDeployStatus(): Promise<DeployStatus> {
  const deployedSha = getDeployedCommit();
  const now = new Date().toISOString();

  let commits: CommitInfo[] = [];
  let fetchError = false;

  try {
    commits = await fetchRemoteCommits();
    lsSet(LS_KEYS.cachedCommits, JSON.stringify(commits));
    lsSet(LS_KEYS.lastFetchedAt, now);
  } catch {
    fetchError = true;
    try {
      const cached = ls(LS_KEYS.cachedCommits);
      if (cached) commits = JSON.parse(cached) as CommitInfo[];
    } catch {}
  }

  const remoteHead = commits[0] ?? {
    sha: deployedSha, short: short(deployedSha),
    message: '', author: '', date: '', url: '',
  };

  // Find which commits are ahead of deployed
  const deployedIdx = commits.findIndex(c => c.sha.startsWith(deployedSha.slice(0, 7)) || deployedSha.startsWith(c.sha.slice(0, 7)));
  const newCommits  = deployedIdx > 0 ? commits.slice(0, deployedIdx) : deployedIdx === -1 ? commits : [];
  const isAhead     = newCommits.length > 0;

  return {
    deployedCommit:    deployedSha,
    deployedShort:     short(deployedSha),
    deployedAt:        ls(LS_KEYS.deployedAt) || now,
    remoteCommit:      remoteHead.sha,
    remoteShort:       remoteHead.short,
    remoteAt:          remoteHead.date || now,
    lastFetchedAt:     fetchError ? (ls(LS_KEYS.lastFetchedAt) || now) : now,
    buildState:        getBuildState(),
    isAhead,
    aheadCount:        newCommits.length,
    newCommits,
    lastGoodCommit:    ls(LS_KEYS.lastGoodCommit),
    lastGoodAt:        ls(LS_KEYS.lastGoodAt),
    rollbackAvailable: ls(LS_KEYS.rollbackAvailable) === 'true',
  };
}
