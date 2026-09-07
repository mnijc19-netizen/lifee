/**
 * Make it in Germany Composite Aggregator
 * Aggregates parseDeOpportunityCard and parseDeVocationalTraining
 * Maintains backward compatibility while delegating discrete factual extractions.
 */

import { parseDeOpportunityCard } from './deOpportunityCardParser.mjs';
import { parseDeVocationalTraining } from './deVocationalTrainingParser.mjs';

export function parseMakeItGermany(htmlText, url = 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid HTML payload for Make it in Germany parser');
  }

  // Sanity check
  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) ||
      (htmlText.length < 250 && !/opportunity|chancenkarte|blocked|ausbildung/i.test(htmlText))) {
    throw new Error('Make it in Germany parser: Provided payload is an error or gateway page');
  }

  const oppCardResult = parseDeOpportunityCard(htmlText, url);
  let vocationalResult = null;
  try {
    vocationalResult = parseDeVocationalTraining(htmlText, url);
  } catch (err) {
    // If payload contains only opportunity card without Ausbildung, keep vocational null
  }

  const fetchedAt = oppCardResult.fetchedAt;
  const sourcePublishedAt = oppCardResult.sourcePublishedAt;
  const effectiveAt = oppCardResult.effectiveAt;

  const normalizedFacts = {
    opportunityCard: oppCardResult.normalizedFacts,
    ausbildung: vocationalResult ? {
      companyBasedMinimumGross: vocationalResult.normalizedFacts.companyBasedMinimumGross,
      minimumNet: vocationalResult.normalizedFacts.companyBasedEstimatedNet,
      schoolBasedMinimumNetEur: vocationalResult.normalizedFacts.schoolBasedMinimumNetEur,
      supplementalProofRequiredWhenInsufficient: vocationalResult.normalizedFacts.supplementalProofRequiredWhenInsufficient,
      languageRequirement: vocationalResult.normalizedFacts.languageRequirement,
      sourceEvidence: vocationalResult.evidence[0]?.quotes?.join(' | ') || ''
    } : null,
    qualification: {
      degreeEquivalencePortal: 'ZAB Anabin',
      vocationalRecognitionRequired: true
    }
  };

  const evidence = [
    ...oppCardResult.evidence,
    ...(vocationalResult ? vocationalResult.evidence : [])
  ];

  return {
    sourceId: 'src-make-it-germany',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    effectiveAt,
    normalizedFacts,
    evidence
  };
}
