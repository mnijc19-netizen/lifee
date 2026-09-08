import { UserProfile, UserPlanTask, Evidence } from '../types';
import { pushToSupabase, pullFromSupabase, loadSupabaseConfig } from './supabaseSync';
import { getUserSyncSlotId, setUserSyncSlotId, isUserSyncEnabled, setUserSyncEnabled } from '../config/cloudSyncConfig';

export interface LifeeSyncPayload {
  version: number;
  updatedAt: string;
  deviceId: string;
  profile: UserProfile;
  tasks: UserPlanTask[];
  watchlist: string[];
  customEvidence: Evidence[];
}

export type RealSyncState = 
  | 'DISCONNECTED'     // 未配置或已关闭云端同步
  | 'PENDING_UPLOAD'   // 本地已修改，等待上传
  | 'SYNCING'          // 正在与服务器通讯
  | 'SYNCED'           // 服务器明确响应已持久化
  | 'FAILED_RETRY'     // 网络错误或服务异常，本地数据已保全，待重试
  | 'CONFLICT';        // 云端存在更新版本

export interface SyncStatus {
  lastSyncedAt: string | null;
  syncCode: string | null;
  syncState: RealSyncState;
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
  return getUserSyncSlotId() || localStorage.getItem(SYNC_CODE_KEY);
}

export function saveSyncCode(code: string): void {
  const clean = code.toUpperCase().trim();
  try {
    localStorage.setItem(SYNC_CODE_KEY, clean);
    setUserSyncSlotId(clean);
  } catch {
    // ignore
  }
}

// Native Web Compression (Gzip + Base64) for URL-safe cross-device transfer
// Notice: Gzip + Base64 is transport encoding, NOT cryptographic encryption.
export async function compressPayload(payload: LifeeSyncPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const response = new Response(stream);
  const buffer = await response.arrayBuffer();
  
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

/**
 * Uploads payload to the server only with real result reporting.
 * Zero fake success: only returns true if the remote server acknowledged storage.
 */
export async function uploadToCloudRelay(code: string, payload: LifeeSyncPayload): Promise<{ success: boolean; message: string }> {
  const cleanCode = code.toUpperCase().trim();
  if (!cleanCode) {
    return { success: false, message: '配对码无效' };
  }

  const config = loadSupabaseConfig();
  if (!config.enabled) {
    return { success: false, message: '云端同步未开启或未授权。数据已安全保留在本地。' };
  }

  try {
    const pushed = await pushToSupabase(cleanCode, payload);
    if (pushed) {
      const nowIso = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, nowIso);
      return { success: true, message: '已安全同步至云端专属槽位' };
    } else {
      return { success: false, message: '云端服务拒绝或写入失败，本地修改已完好保留。' };
    }
  } catch (err: any) {
    return { success: false, message: `网络异常 (${err?.message || '无法连接'})，本地数据未受影响。` };
  }
}

/**
 * Downloads payload from the server with validation.
 */
export async function downloadFromCloudRelay(code: string): Promise<LifeeSyncPayload | null> {
  const cleanCode = code.toUpperCase().trim();
  if (!cleanCode) return null;

  try {
    return await pullFromSupabase(cleanCode);
  } catch (err) {
    console.warn('[Sync Engine] Download error:', err);
    return null;
  }
}

/**
 * Generates an instant link with transparent user notice that payload is encoded.
 */
export async function generateInstantMobileSyncUrl(payload: LifeeSyncPayload): Promise<string> {
  const compressed = await compressPayload(payload);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#import=${compressed}`;
}
