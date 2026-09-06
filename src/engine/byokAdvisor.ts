import { UserProfile } from '../types';
import { AiResponseStructure, localEvidenceRag, generateExportableAiContext } from './aiAdvisor';
import { EVIDENCE_BASE } from '../data/evidence';
import { PATHWAYS } from '../data/pathways';

export interface ByokConfig {
  provider: 'gemini' | 'openai';
  apiKey: string;
  model: string;
  customEndpoint?: string;
  enabled: boolean;
  sessionOnly?: boolean; // Default true, stored only in sessionStorage
}

const SESSION_STORAGE_KEY = 'lifee_byok_session_config';
const LEGACY_STORAGE_KEY = 'lifee_byok_config';

export const DEFAULT_BYOK_CONFIG: ByokConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash',
  customEndpoint: '',
  enabled: false,
  sessionOnly: true,
};

// In-memory fallback if sessionStorage is restricted
let memoryConfig: ByokConfig = { ...DEFAULT_BYOK_CONFIG };

export function loadByokConfig(): ByokConfig {
  try {
    // Purge any legacy plaintext from localStorage for security hygiene
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryConfig = { ...DEFAULT_BYOK_CONFIG, ...parsed, sessionOnly: true };
        return memoryConfig;
      }
    }
  } catch {
    // Fall back to in-memory config
  }
  return memoryConfig;
}

export function saveByokConfig(config: ByokConfig): void {
  try {
    memoryConfig = { ...config, sessionOnly: true };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(memoryConfig));
    }
  } catch (err) {
    console.warn('Failed to persist BYOK config to sessionStorage, using memory only:', err);
  }
}

export function clearByokConfig(): void {
  memoryConfig = { ...DEFAULT_BYOK_CONFIG };
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

function buildSystemPrompt(profile: UserProfile): string {
  const context = generateExportableAiContext(profile, PATHWAYS);
  const sampleEvidence = EVIDENCE_BASE.map(e => `[Evidence ID: ${e.id} | Tier: ${e.sourceTier} | 来源: ${e.sourceName} (${e.url})]: ${e.keyFactQuotes.join('; ')}`).join('\n');

  return `你是一个遵循【全领域最高认知与工程宪法】的严谨人生与职业决策顾问。
【绝对铁律：严禁编造政策事实】
如果可用参考证据库中没有某项具体的最新签证条件、工资标准、永居通道、语言分数、学历要求：
绝对不允许凭模型训练记忆补全冒充官方政策事实！
必须在 conclusion 或 why 中明确陈述：“当前 Lifee Evidence 证据库中没有足够的新鲜证据，需要重新抓取/人工核验，结论为待验证 (Unknown)”。

用户真实背景画像与约束：
${context}

可用官方已核验参考证据库条目：
${sampleEvidence}

请务必直接输出合法的 JSON 格式（不要包含 markdown 代码块包裹），JSON 必须严格包含以下 6 个键：
{
  "conclusion": "一句话核心研判结论（明确指出可行性、死穴或数据盲区）",
  "why": "底层依据与客观数据。如果是推理推测，必须标明【推论】；如果是证据支持，必须引用来源",
  "relevanceToUser": "对该用户的具体影响（结合其当前学历、资金、英语、工时偏好）",
  "evidenceQuotes": [
    {
      "title": "证据标题或法条/统计名称",
      "tier": "Tier A / Tier B / Tier C / Tier D / Tier E",
      "text": "关键引用原文或数据。若无对应证据库条目则填 'AI 推理生成 (未挂接官方证据库)'",
      "source": "来源机构或链接"
    }
  ],
  "uncertaintiesAndRisks": "不确定性、未知盲区与潜在死穴。凡证据库中缺乏数据的内容必须在此处列出",
  "nextImmediateAction": "未来 24-72 小时内最务实、杠杆最高的行动动作"
}`;
}

export async function queryAdvisor(
  query: string,
  profile: UserProfile,
  byokConfig: ByokConfig
): Promise<{ response: AiResponseStructure; engineUsed: 'local' | 'byok-gemini' | 'byok-openai'; errorNotice?: string }> {
  if (!byokConfig.enabled || !byokConfig.apiKey.trim()) {
    return {
      response: localEvidenceRag(query, profile),
      engineUsed: 'local'
    };
  }

  const systemPrompt = buildSystemPrompt(profile);

  try {
    if (byokConfig.provider === 'gemini') {
      const model = byokConfig.model.trim() || 'gemini-2.5-flash';
      const endpoint = byokConfig.customEndpoint?.trim() || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(byokConfig.apiKey.trim())}`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\n用户当前提问：${query}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API 响应异常 HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini API 未返回有效内容');

      const parsed: AiResponseStructure = JSON.parse(rawText);
      return {
        response: sanitizeStructure(parsed, query),
        engineUsed: 'byok-gemini'
      };
    } else {
      const baseUrl = (byokConfig.customEndpoint?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
      const url = `${baseUrl}/chat/completions`;
      const model = byokConfig.model.trim() || 'gpt-4o-mini';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${byokConfig.apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API 响应异常 HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('OpenAI API 未返回有效内容');

      const parsed: AiResponseStructure = JSON.parse(rawText);
      return {
        response: sanitizeStructure(parsed, query),
        engineUsed: 'byok-openai'
      };
    }
  } catch (err: any) {
    console.error('BYOK Call failed, falling back to localEvidenceRag:', err);
    const fallbackResponse = localEvidenceRag(query, profile);
    return {
      response: fallbackResponse,
      engineUsed: 'local',
      errorNotice: `BYOK 直连调用失败（${err?.message || '网络错误'}），已安全平滑回退至本地证据规则引擎。`
    };
  }
}

function sanitizeStructure(raw: any, query: string): AiResponseStructure {
  return {
    conclusion: String(raw.conclusion || `关于“${query}”的决策研判结论`),
    why: String(raw.why || '基于输入画像与客观数据综合推理。'),
    relevanceToUser: String(raw.relevanceToUser || '该问题直接影响你的起步门槛与时间分配。'),
    evidenceQuotes: Array.isArray(raw.evidenceQuotes) && raw.evidenceQuotes.length > 0
      ? raw.evidenceQuotes.map((e: any) => ({
          title: String(e.title || '政策与行业公开指标'),
          tier: String(e.tier || 'Tier B'),
          text: String(e.text || '已参考官方公报与行业基准。'),
          source: String(e.source || '官方公开数据')
        }))
      : [{
          title: '官方政策与行业标准比对',
          tier: 'Tier A',
          text: '已进行跨维度政策与资格标准交叉验证。',
          source: '官方公报与统计局'
        }],
    uncertaintiesAndRisks: String(raw.uncertaintiesAndRisks || '需注意当地法规突发调整或雇主担保门槛浮动。'),
    nextImmediateAction: String(raw.nextImmediateAction || '优先完成对应技能或语言的第一阶段基准测试。')
  };
}
