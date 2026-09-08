/**
 * Lifee Cloud Sync Configuration (Isolated & Explicit Protocol)
 * 
 * 严格遵循真实身份与租户隔离原则：
 * 1. 杜绝任何全网共享的固定主槽位 (彻底废除已存在风险的 public masterSlotId)。
 * 2. 默认关闭未授权的静默自动上传；用户仅在显式配置配对码或独立端点后才激活同步。
 * 3. 前端绝不包含 service_role 私钥，公开端点仅允许已配对租户读写。
 */

export const CLOUD_SYNC_CONFIG = {
  // 可选的官方/自建 Supabase 同步端点
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL || 'https://pbnuvmbdiorssmtaxlkr.supabase.co').trim(),
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GaYbk71JVw2IfuMKEi-3SQ_uljkxE5E').trim(),
  
  // 默认关闭自动静默同步，须由用户显式配对或开启
  autoSyncEnabled: false,
  
  // 轮询与同步保护间隔 (秒)
  syncPollIntervalSec: 30
};

const USER_SLOT_KEY = 'lifee_user_isolated_sync_slot';
const SYNC_ENABLED_KEY = 'lifee_sync_is_user_enabled';

export function getUserSyncSlotId(): string | null {
  try {
    return localStorage.getItem(USER_SLOT_KEY);
  } catch {
    return null;
  }
}

export function setUserSyncSlotId(slotId: string | null): void {
  try {
    if (slotId) {
      localStorage.setItem(USER_SLOT_KEY, slotId.trim().toUpperCase());
    } else {
      localStorage.removeItem(USER_SLOT_KEY);
    }
  } catch {
    // ignore
  }
}

export function isUserSyncEnabled(): boolean {
  try {
    const flag = localStorage.getItem(SYNC_ENABLED_KEY);
    return flag === 'true' && Boolean(getUserSyncSlotId());
  } catch {
    return false;
  }
}

export function setUserSyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function isCloudSyncPreConfigured(): boolean {
  return Boolean(CLOUD_SYNC_CONFIG.supabaseUrl && CLOUD_SYNC_CONFIG.supabaseAnonKey);
}
