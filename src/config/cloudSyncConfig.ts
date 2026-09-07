/**
 * Lifee Master Multi-Device Cloud Sync Configuration
 * 
 * 专用于个人三端 (Windows PC · iPhone 16 Pro · 小米 14 Pro) 完全无感静默实时互通。
 * 一旦配置 Supabase URL 与 anonKey，三台设备直接访问原本的网址即可毫秒级自动双向同步，
 * 彻底告别所有手动复制链接、输入配对码或多端配置。
 */

export const CLOUD_SYNC_CONFIG = {
  // 若填写，系统将自动预编译进代码，全设备打开即同步
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  
  // 个人三端共享的单一主租户槽位 ID
  masterSlotId: 'lifee_master_user',
  
  // 是否启用完全无感自动静默后台同步
  autoSyncEnabled: true,
  
  // 切回前台或定时轮询的秒数 (默认 15 秒)
  syncPollIntervalSec: 15
};

export function isCloudSyncPreConfigured(): boolean {
  return Boolean(CLOUD_SYNC_CONFIG.supabaseUrl && CLOUD_SYNC_CONFIG.supabaseAnonKey);
}
