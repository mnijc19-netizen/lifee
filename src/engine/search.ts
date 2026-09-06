import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { PATHWAYS } from '../data/pathways';
import { INTELLIGENCE_STREAM } from '../data/intelligence';
import { EVIDENCE_BASE } from '../data/evidence';
import { LOW_REGRET_SKILLS } from '../data/lowRegretSkills';

export interface SearchResultItem {
  id: string;
  type: 'occupation' | 'country' | 'pathway' | 'intelligence' | 'evidence' | 'skill';
  title: string;
  subtitle: string;
  badge: string;
  linkTab: string;
  targetId: string;
}

export function globalSearch(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  // 1. Occupations
  for (const occ of OCCUPATIONS) {
    if (
      occ.title.toLowerCase().includes(q) ||
      occ.titleEn.toLowerCase().includes(q) ||
      occ.category.toLowerCase().includes(q) ||
      occ.iscoCode.includes(q) ||
      occ.topSkills.some(s => s.name.toLowerCase().includes(q)) ||
      occ.summaryVerdict.toLowerCase().includes(q)
    ) {
      results.push({
        id: occ.id,
        type: 'occupation',
        title: occ.title,
        subtitle: `${occ.category} · ISCO ${occ.iscoCode} · 匹配度 ${occ.feasibilityScore}%`,
        badge: '职业',
        linkTab: 'careers',
        targetId: occ.id
      });
    }
  }

  // 2. Countries
  for (const c of COUNTRIES) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.visaRoutesSummary.some(v => v.toLowerCase().includes(q)) ||
      c.summaryVerdict.toLowerCase().includes(q)
    ) {
      results.push({
        id: c.id,
        type: 'country',
        title: `${c.flag} ${c.name} (${c.nameEn})`,
        subtitle: `${c.region} · 购买力指数 ${c.netHourlyPurchasingPowerIndex} · 大专友好度: ${c.associateDegreeFriendliness}`,
        badge: '国家',
        linkTab: 'countries',
        targetId: c.id
      });
    }
  }

  // 3. Pathways
  for (const p of PATHWAYS) {
    if (
      p.name.toLowerCase().includes(q) ||
      p.targetCountry.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.whyRecommended.toLowerCase().includes(q)
    ) {
      results.push({
        id: p.id,
        type: 'pathway',
        title: p.name,
        subtitle: `目标: ${p.targetCountry} · 预计 ${p.totalMonthsEst} 个月 · 起步门槛 ¥${p.minCapitalRmb.toLocaleString()}`,
        badge: '路线',
        linkTab: 'pathways',
        targetId: p.id
      });
    }
  }

  // 4. Intelligence
  for (const intel of INTELLIGENCE_STREAM) {
    if (
      intel.title.toLowerCase().includes(q) ||
      intel.country.toLowerCase().includes(q) ||
      intel.category.toLowerCase().includes(q) ||
      intel.summary.toLowerCase().includes(q) ||
      intel.whatToChangeForMe.toLowerCase().includes(q)
    ) {
      results.push({
        id: intel.id,
        type: 'intelligence',
        title: intel.title,
        subtitle: `影响分 ${intel.impactScore} · ${intel.country} · ${intel.category}`,
        badge: '情报',
        linkTab: 'intelligence',
        targetId: intel.id
      });
    }
  }

  // 5. Evidence
  for (const ev of EVIDENCE_BASE) {
    if (
      ev.title.toLowerCase().includes(q) ||
      ev.country.toLowerCase().includes(q) ||
      ev.sourceName.toLowerCase().includes(q) ||
      ev.summary.toLowerCase().includes(q) ||
      ev.keyFactQuotes.some(quote => quote.toLowerCase().includes(q))
    ) {
      results.push({
        id: ev.id,
        type: 'evidence',
        title: ev.title,
        subtitle: `${ev.sourceTier} · ${ev.sourceName} · ${ev.country}`,
        badge: '证据',
        linkTab: 'evidence',
        targetId: ev.id
      });
    }
  }

  // 6. Low Regret Skills
  for (const s of LOW_REGRET_SKILLS) {
    if (
      s.name.toLowerCase().includes(q) ||
      s.whyLowRegret.toLowerCase().includes(q) ||
      s.crossRouteValue.toLowerCase().includes(q)
    ) {
      results.push({
        id: s.id,
        type: 'skill',
        title: s.name,
        subtitle: `${s.category} · 跨路线复用价值极高`,
        badge: '低后悔技能',
        linkTab: 'lowregret',
        targetId: s.id
      });
    }
  }

  return results.slice(0, 25);
}
