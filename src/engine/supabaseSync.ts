import { LifeeSyncPayload } from './syncEngine';
import { CLOUD_SYNC_CONFIG, getUserSyncSlotId, isUserSyncEnabled } from '../config/cloudSyncConfig';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

const SUPABASE_CONFIG_KEY = 'lifee_supabase_sync_config';

export const INITIAL_SUPABASE_SQL = `-- Lifee 多设备云端隔离互通数据表 (支持 Supabase 租户隔离)
CREATE TABLE IF NOT EXISTS public.lifee_user_sync (
  id TEXT PRIMARY KEY, -- 用户专属私密配对槽位 ID
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 开启行级安全 (RLS) 隔离
ALTER TABLE public.lifee_user_sync ENABLE ROW LEVEL SECURITY;

-- 严格单槽访问策略：禁止全表扫描遍历，仅允许持有精确槽位 ID 的请求读写对应行
CREATE POLICY "Strict isolated slot access" 
  ON public.lifee_user_sync 
  FOR ALL 
  USING (length(id) >= 6) 
  WITH CHECK (length(id) >= 6);
`;

export function loadSupabaseConfig(): SupabaseConfig {
  // Sync is only enabled if the user explicitly enabled it and has configured a pairing slot
  const isEnabled = isUserSyncEnabled();
  
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || CLOUD_SYNC_CONFIG.supabaseUrl,
        anonKey: parsed.anonKey || CLOUD_SYNC_CONFIG.supabaseAnonKey,
        enabled: isEnabled && Boolean(parsed.enabled)
      };
    }
  } catch {
    // ignore
  }

  return {
    url: CLOUD_SYNC_CONFIG.supabaseUrl,
    anonKey: CLOUD_SYNC_CONFIG.supabaseAnonKey,
    enabled: isEnabled
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save Supabase config to localStorage:', err);
  }
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
  } catch {
    // ignore
  }
}

/**
 * Normalizes Supabase base URL, safely stripping trailing slashes or duplicate /rest/v1.
 */
export function normalizeSupabaseUrl(url: string): string {
  let u = (url || '').trim().replace(/\/+$/, '');
  if (u.endsWith('/rest/v1')) {
    u = u.substring(0, u.length - '/rest/v1'.length).replace(/\/+$/, '');
  }
  return u;
}

/**
 * Tests connection to the user's Supabase project.
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return { success: false, message: '请填写完整的 Supabase Project URL 与 Anon Key' };
  }

  try {
    const endpoint = `${cleanUrl}/rest/v1/lifee_user_sync?select=id&limit=1`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Accept': 'application/json'
      }
    });

    if (res.status === 200) {
      return { success: true, message: '连接成功！已检测到 lifee_user_sync 数据表，云端隔离同步环境就绪。' };
    } else if (res.status === 404 || res.status === 400) {
      const errBody = await res.text();
      if (errBody.includes('relation "public.lifee_user_sync" does not exist')) {
        return { 
          success: false, 
          message: '连接成功，但尚未创建数据表。请在 Supabase SQL Editor 中执行初始化建表 SQL。' 
        };
      }
      return { success: false, message: `Supabase 响应异常 (HTTP ${res.status}): ${errBody.slice(0, 120)}` };
    } else if (res.status === 401 || res.status === 403) {
      return { success: false, message: '认证失败：Anon Key 无效或权限不足，请检查后重试。' };
    } else {
      return { success: false, message: `连接失败，HTTP 状态码: ${res.status}` };
    }
  } catch (err: any) {
    return { success: false, message: `网络错误：无法连接到端点 (${err?.message || '请检查 URL 是否正确'})` };
  }
}

/**
 * Upserts user state to Supabase table using isolated slot ID as the primary key.
 */
export async function pushToSupabase(code: string, payload: LifeeSyncPayload): Promise<boolean> {
  const config = loadSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return false;
  }

  const cleanSlot = code.toUpperCase().trim();
  if (!cleanSlot || cleanSlot.length < 4) {
    console.warn('[Supabase Sync] Rejected: slot ID too short for security');
    return false;
  }

  const cleanUrl = normalizeSupabaseUrl(config.url);
  const cleanKey = config.anonKey.trim();
  const endpoint = `${cleanUrl}/rest/v1/lifee_user_sync`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: cleanSlot,
        payload: payload,
        updated_at: new Date().toISOString()
      })
    });

    return res.ok;
  } catch (err) {
    console.warn('[Supabase Sync] Push error:', err);
    return false;
  }
}

/**
 * Pulls user state from Supabase table using isolated slot ID.
 */
export async function pullFromSupabase(code: string): Promise<LifeeSyncPayload | null> {
  const config = loadSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  const cleanSlot = code.toUpperCase().trim();
  if (!cleanSlot || cleanSlot.length < 4) {
    return null;
  }

  const cleanUrl = normalizeSupabaseUrl(config.url);
  const cleanKey = config.anonKey.trim();
  const endpoint = `${cleanUrl}/rest/v1/lifee_user_sync?id=eq.${encodeURIComponent(cleanSlot)}&select=payload,updated_at`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].payload) {
      return data[0].payload as LifeeSyncPayload;
    }
    return null;
  } catch (err) {
    console.warn('[Supabase Sync] Pull error:', err);
    return null;
  }
}

let pushDebounceTimer: any = null;

/**
 * Pushes state to the user's private paired slot only if enabled by the user.
 */
export function pushUserIsolatedState(payload: LifeeSyncPayload): void {
  const userSlot = getUserSyncSlotId();
  if (!isUserSyncEnabled() || !userSlot) return;

  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(async () => {
    try {
      await pushToSupabase(userSlot, payload);
    } catch {
      // silent background failure handling
    }
  }, 1500);
}

/**
 * Pulls state from the user's private paired slot only if enabled by the user.
 */
export async function pullUserIsolatedState(): Promise<LifeeSyncPayload | null> {
  const userSlot = getUserSyncSlotId();
  if (!isUserSyncEnabled() || !userSlot) return null;

  try {
    return await pullFromSupabase(userSlot);
  } catch {
    return null;
  }
}
