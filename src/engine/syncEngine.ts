import { UserProfile, UserPlanTask, Evidence } from '../types';
import { pushToSupabase, pullFromSupabase } from './supabaseSync';

export interface LifeeSyncPayload {
  version: number;
  updatedAt: string;
  deviceId: string;
  profile: UserProfile;
  tasks: UserPlanTask[];
  watchlist: string[];
  customEvidence: Evidence[];
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  syncCode: string | null;
  isSyncing: boolean;
  statusMessage: string;
}

const SYNC_CODE_KEY = 'lifee_sync_pairing_code';
const LAST_SYNC_KEY = 'lifee_last_synced_at';
const DEVICE_ID_KEY = 'lifee_client_device_id';

// Generate or retrieve persistent local device ID
export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'dev_ephemeral';
  }
}

// Generate a memorable 6-character sync pairing code (e.g. LF-892A)
export function generatePairingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'LF-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getSavedSyncCode(): string | null {
  try {
    return localStorage.getItem(SYNC_CODE_KEY);
  } catch {
    return null;
  }
}

export function saveSyncCode(code: string): void {
  try {
    localStorage.setItem(SYNC_CODE_KEY, code.toUpperCase().trim());
  } catch {
    // ignore
  }
}

// Native Web Compression (Gzip + Base64) for URL-safe instant cross-device transfer
export async function compressPayload(payload: LifeeSyncPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const response = new Response(stream);
  const buffer = await response.arrayBuffer();
  
  // Convert arrayBuffer to base64url
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Native Web Decompression for URL-safe cross-device transfer
export async function decompressPayload(base64Url: string): Promise<LifeeSyncPayload> {
  // Convert base64url back to base64
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const response = new Response(stream);
  const text = await response.text();
  return JSON.parse(text) as LifeeSyncPayload;
}

export async function uploadToCloudRelay(code: string, payload: LifeeSyncPayload): Promise<boolean> {
  try {
    const compressed = await compressPayload(payload);
    localStorage.setItem(`lifee_cloud_cache_${code}`, compressed);
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    // Dual-layer: If Supabase is configured, upload to cloud database
    try {
      await pushToSupabase(code, payload);
    } catch {
      // Supabase upload optional
    }

    return true;
  } catch (err) {
    console.warn('Cloud sync relay write error, cached locally:', err);
    return false;
  }
}

export async function downloadFromCloudRelay(code: string): Promise<LifeeSyncPayload | null> {
  try {
    // 1. Try Supabase cloud database first
    try {
      const remoteData = await pullFromSupabase(code);
      if (remoteData) {
        return remoteData;
      }
    } catch {
      // ignore
    }

    // 2. Fall back to local relay cache
    const cached = localStorage.getItem(`lifee_cloud_cache_${code}`);
    if (cached) {
      return await decompressPayload(cached);
    }
    return null;
  } catch (err) {
    console.warn('Cloud sync relay read error:', err);
    return null;
  }
}

// Generate an instant 1-click sync link for mobile (iPhone 16 Pro)
export async function generateInstantMobileSyncUrl(payload: LifeeSyncPayload): Promise<string> {
  const compressed = await compressPayload(payload);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#import=${compressed}`;
}
