import { LifeeSyncPayload } from './syncEngine';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

const SUPABASE_CONFIG_KEY = 'lifee_supabase_sync_config';

export const INITIAL_SUPABASE_SQL = `-- Lifee 多设备云端实时互通数据表 (在 Supabase SQL Editor 中运行一次即可)
CREATE TABLE IF NOT EXISTS public.lifee_user_sync (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 开启行级安全并允许凭借配对码进行读写
ALTER TABLE public.lifee_user_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read and write by pairing code" 
  ON public.lifee_user_sync 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
`;

export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    url: '',
    anonKey: '',
    enabled: false
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
 * Tests connection to the user's Supabase project.
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return { success: false, message: '请填写完整的 Supabase Project URL 与 Anon Key' };
  }

  try {
    // Query table existence via Supabase PostgREST API
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
      return { success: true, message: '连接成功！已检测到 lifee_user_sync 数据表，可正常实时云同步。' };
    } else if (res.status === 404 || res.status === 400) {
      const errBody = await res.text();
      if (errBody.includes('relation "public.lifee_user_sync" does not exist')) {
        return { 
          success: false, 
          message: '连接到 Supabase 成功，但尚未创建数据表。请在 Supabase 的 SQL Editor 中执行初始化 SQL。' 
        };
      }
      return { success: false, message: `Supabase 响应异常 (HTTP ${res.status}): ${errBody}` };
    } else if (res.status === 401 || res.status === 403) {
      return { success: false, message: '认证失败：Anon Key 无效或未授权，请检查后重试。' };
    } else {
      return { success: false, message: `连接失败，HTTP 状态码: ${res.status}` };
    }
  } catch (err: any) {
    return { success: false, message: `网络错误：无法连接到 Supabase 端点 (${err?.message || '请检查 URL 是否正确'})` };
  }
}

/**
 * Upserts user state to Supabase table using the pairing code as the primary key.
 */
export async function pushToSupabase(code: string, payload: LifeeSyncPayload): Promise<boolean> {
  const config = loadSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return false;
  }

  const cleanUrl = config.url.trim().replace(/\/+$/, '');
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
        id: code.toUpperCase().trim(),
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
 * Pulls user state from Supabase table using the pairing code.
 */
export async function pullFromSupabase(code: string): Promise<LifeeSyncPayload | null> {
  const config = loadSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  const cleanUrl = config.url.trim().replace(/\/+$/, '');
  const cleanKey = config.anonKey.trim();
  const endpoint = `${cleanUrl}/rest/v1/lifee_user_sync?id=eq.${encodeURIComponent(code.toUpperCase().trim())}&select=payload,updated_at`;

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
