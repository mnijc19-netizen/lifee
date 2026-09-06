import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { diffSnapshots } from './diffEngine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const snapshotsBaseDir = path.join(rootDir, 'public', 'data', 'snapshots');

export function ensureSnapshotsDir(sourceId) {
  const dir = path.join(snapshotsBaseDir, sourceId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Saves a versioned snapshot strictly obeying:
 * - RULE-32: Never copy registry dates into sourcePublishedAt.
 * - RULE-36: Do not increment fact version if contentHash is unchanged.
 * - RULE-37: Distinguish fetch run from fact version.
 */
export function saveSnapshot(sourceId, parsedData, metadata = {}) {
  const dir = ensureSnapshotsDir(sourceId);
  const historyFile = path.join(dir, 'history.json');
  const latestFile = path.join(dir, 'latest.json');

  let history = [];
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch {
      history = [];
    }
  }

  // Calculate content hash of normalized business facts
  const contentHash = crypto.createHash('sha256')
    .update(JSON.stringify(parsedData.normalizedFacts))
    .digest('hex')
    .slice(0, 12);

  const existingLatest = getLatestSnapshot(sourceId);
  const nowIso = metadata.fetchedAt || new Date().toISOString();

  // RULE-36 & RULE-37: Repeated fetch of identical facts is NOT a new fact version!
  if (existingLatest && existingLatest.contentHash === contentHash) {
    const updatedLatest = {
      ...existingLatest,
      lastCheckedAt: nowIso,
      fetchedAt: nowIso
    };
    fs.writeFileSync(latestFile, JSON.stringify(updatedLatest, null, 2), 'utf8');
    console.log(`[SnapshotManager] Facts unchanged for ${sourceId} (version v${existingLatest.version}, hash: ${contentHash}). Updated lastCheckedAt.`);
    return updatedLatest;
  }

  // Content has changed or first snapshot: create next fact version
  const nextVersion = history.length + 1;
  const sourcePublishedAt = parsedData.sourcePublishedAt !== undefined
    ? parsedData.sourcePublishedAt
    : (metadata.sourcePublishedAt !== undefined ? metadata.sourcePublishedAt : null);

  const snapshot = {
    sourceId,
    version: nextVersion,
    fetchedAt: nowIso,
    lastCheckedAt: nowIso,
    sourcePublishedAt: sourcePublishedAt || null, // RULE-32: null if unstated, never guess
    url: metadata.url || '',
    contentHash,
    parserVersion: parsedData.parserVersion || '2.0.0',
    normalizedFacts: parsedData.normalizedFacts,
    evidence: parsedData.evidence || []
  };

  // Write immutable versioned file
  const versionFile = path.join(dir, `v${nextVersion}.json`);
  fs.writeFileSync(versionFile, JSON.stringify(snapshot, null, 2), 'utf8');

  // Update latest pointer
  fs.writeFileSync(latestFile, JSON.stringify(snapshot, null, 2), 'utf8');

  // Update history log
  history.push({
    version: nextVersion,
    file: `v${nextVersion}.json`,
    fetchedAt: snapshot.fetchedAt,
    sourcePublishedAt: snapshot.sourcePublishedAt,
    contentHash,
    summary: metadata.summary || 'Official policy snapshot'
  });
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');

  console.log(`[SnapshotManager] New fact version saved for ${sourceId}: v${nextVersion} (hash: ${contentHash})`);
  return snapshot;
}

export function getLatestSnapshot(sourceId) {
  const latestFile = path.join(snapshotsBaseDir, sourceId, 'latest.json');
  if (fs.existsSync(latestFile)) {
    try {
      return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

export function getPreviousSnapshot(sourceId) {
  const dir = path.join(snapshotsBaseDir, sourceId);
  const historyFile = path.join(dir, 'history.json');
  if (!fs.existsSync(historyFile)) return null;

  try {
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    if (history.length < 2) return null;
    const prevItem = history[history.length - 2];
    const prevFile = path.join(dir, prevItem.file);
    if (fs.existsSync(prevFile)) {
      return JSON.parse(fs.readFileSync(prevFile, 'utf8'));
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * RULE-33: Computes last meaningful change date strictly from snapshot diff history.
 * Returns 'Unknown / No recorded change' if never recorded.
 */
export function getLastMeaningfulChangeDate(sourceId) {
  const dir = path.join(snapshotsBaseDir, sourceId);
  const historyFile = path.join(dir, 'history.json');
  if (!fs.existsSync(historyFile)) return 'Unknown / No recorded change';

  try {
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    if (history.length < 2) return 'Unknown / No recorded change';

    // Check backwards from latest version
    for (let i = history.length - 1; i >= 1; i--) {
      const currFile = path.join(dir, history[i].file);
      const prevFile = path.join(dir, history[i - 1].file);
      if (fs.existsSync(currFile) && fs.existsSync(prevFile)) {
        const currSnap = JSON.parse(fs.readFileSync(currFile, 'utf8'));
        const prevSnap = JSON.parse(fs.readFileSync(prevFile, 'utf8'));
        const diff = diffSnapshots(prevSnap, currSnap);
        if (diff.hasChange && diff.changeType === 'POLICY_CHANGE') {
          return currSnap.sourcePublishedAt || (currSnap.fetchedAt ? currSnap.fetchedAt.split('T')[0] : 'Unknown');
        }
      }
    }
  } catch {
    return 'Unknown / No recorded change';
  }
  return 'Unknown / No recorded change';
}
