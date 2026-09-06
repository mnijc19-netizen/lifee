import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

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

export function saveSnapshot(sourceId, parsedData, metadata = {}) {
  const dir = ensureSnapshotsDir(sourceId);
  const historyFile = path.join(dir, 'history.json');

  let history = [];
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch {
      history = [];
    }
  }

  const nextVersion = history.length + 1;
  const contentHash = crypto.createHash('sha256')
    .update(JSON.stringify(parsedData.normalizedFacts))
    .digest('hex')
    .slice(0, 12);

  const snapshot = {
    sourceId,
    version: nextVersion,
    fetchedAt: metadata.fetchedAt || new Date().toISOString(),
    sourcePublishedAt: metadata.sourcePublishedAt || '2026-08-15',
    url: metadata.url || '',
    contentHash,
    parserVersion: parsedData.parserVersion || '1.0.0',
    normalizedFacts: parsedData.normalizedFacts,
    evidence: parsedData.evidence || []
  };

  // Write versioned file (never overwrite past versions!)
  const versionFile = path.join(dir, `v${nextVersion}.json`);
  fs.writeFileSync(versionFile, JSON.stringify(snapshot, null, 2), 'utf8');

  // Write/update latest.json pointer
  const latestFile = path.join(dir, 'latest.json');
  fs.writeFileSync(latestFile, JSON.stringify(snapshot, null, 2), 'utf8');

  // Update history index
  history.push({
    version: nextVersion,
    file: `v${nextVersion}.json`,
    fetchedAt: snapshot.fetchedAt,
    contentHash,
    summary: metadata.summary || 'Official policy snapshot'
  });
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');

  console.log(`[SnapshotManager] Saved ${sourceId} snapshot v${nextVersion} (hash: ${contentHash})`);
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
