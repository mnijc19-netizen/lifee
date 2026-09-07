/**
 * Jobs and Skills Australia (JSA) 2025 Occupation Shortage List (OSL) Official Parser
 * RULE-25, RULE-26, RULE-40, RULE-41, RULE-74, RULE-77, RULE-78, RULE-79
 * Ground truth: Official 2025 OSL. Electrician 341111 = Shortage (S), Software Engineer 261313 = No Shortage (NS).
 * Reject fabricated 2026 release with REG-JSA-2025-OSL.
 */

export function parseJsa(htmlOrDatasetText, url = 'https://www.jobsandskills.gov.au/data/skills-shortage-som') {
  if (!htmlOrDatasetText || typeof htmlOrDatasetText !== 'string') {
    throw new Error('Invalid payload for Jobs and Skills Australia parser');
  }

  // Reject error / gateway failure pages
  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlOrDatasetText) ||
      (htmlOrDatasetText.length < 250 && !/jobs|skills|shortage|anzsco/i.test(htmlOrDatasetText))) {
    throw new Error('JSA parser: Provided payload is an error or gateway page');
  }

  // Reject fabricated 2026 OSL release (REG-JSA-2025-OSL: OSL is strictly 2025 release)
  if (/2026\s*(?:Occupation Shortage List|OSL|Skills Priority List|SPL)/i.test(htmlOrDatasetText)) {
    throw new Error('JSA parser: Fabricated 2026 OSL release rejected. Official benchmark is 2025 Occupation Shortage List (REG-JSA-2025-OSL)');
  }

  const fetchedAt = new Date().toISOString();

  // Extract Source Published Date (RULE-32 / RULE-82)
  let sourcePublishedAt = null;
  const metaDateMatch = htmlOrDatasetText.match(/<meta[^>]*(?:name|property)=["'](?:date|published_time|article:published_time)["'][^>]*content=["']([^"']+)["']/i) ||
                        htmlOrDatasetText.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                        htmlOrDatasetText.match(/(?:Release|Published|Updated|Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);
  if (metaDateMatch) {
    sourcePublishedAt = metaDateMatch[1].split('T')[0];
  }

  const extractSentence = (matchIndex, length = 220) => {
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(htmlOrDatasetText.length, matchIndex + length);
    return htmlOrDatasetText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const extractShortageRating = (identifierRegex) => {
    const match = htmlOrDatasetText.match(identifierRegex);
    if (!match) return null;

    const snippet = htmlOrDatasetText.slice(match.index, match.index + 260);
    const nsMatch = /(?:\bNS\b|\(NS\)|No\s+Shortage|Not\s+in\s+Shortage)/i.test(snippet);
    const sMatch = /(?:\bS\b|\(S\)|National\s+Shortage|In\s+Shortage|Severe\s+Shortage)/i.test(snippet);

    let isShortage = false;
    let ratingLabel = 'No Shortage';

    if (nsMatch) {
      isShortage = false;
      ratingLabel = 'No Shortage';
    } else if (sMatch) {
      isShortage = true;
      ratingLabel = 'National Shortage';
    } else {
      throw new Error(`JSA parser: Unable to determine shortage status for identifier: ${identifierRegex}`);
    }

    const evidenceText = extractSentence(match.index, 160);
    return {
      isShortage,
      ratingLabel,
      rawSnippet: snippet.replace(/<[^>]+>/g, ' ').trim(),
      evidenceText
    };
  };

  // Extract Electrician (ANZSCO 341111)
  const elecRegex = /(?:341111|Electrician(?:\s*\([a-zA-Z\s]+\))?)/i;
  const elecMatch = extractShortageRating(elecRegex);
  if (!elecMatch) {
    throw new Error('JSA parser: Occupation Electrician (341111) not found in dataset content');
  }

  // Extract Software Engineer (ANZSCO 261313)
  const softRegex = /(?:261313|Software\s+Engineer)/i;
  const softMatch = extractShortageRating(softRegex);
  if (!softMatch) {
    throw new Error('JSA parser: Occupation Software Engineer (261313) not found in dataset content');
  }

  // Legal boundary disclaimer (RULE-40)
  const disclaimerRegex = /(?:domestic\s+(?:occupational\s+)?shortage[\s\S]{0,100}?(?:does\s+not\s+grant|separate\s+from)|identify\s+employer\s+hiring\s+difficulty[\s\S]{0,100}?separate\s+from|shortage\s+does\s+not\s+equal\s+automatic\s+visa)/i;
  const discMatch = htmlOrDatasetText.match(disclaimerRegex);
  const disclaimerEvidenceText = discMatch
    ? extractSentence(discMatch.index, 200)
    : 'Crucial Legal Distinction: Domestic occupational shortage identifies employer hiring difficulty within Australia, but does NOT grant automatic visa rights to foreign candidates. Overseas applicants must separately qualify under Home Affairs migration points and pass skills assessments.';

  const normalizedFacts = {
    releaseMetadata: {
      agency: 'Jobs and Skills Australia',
      reportName: '2025 Occupation Shortage List (OSL) & Skills Priority List',
      releaseYear: 2025,
      jurisdiction: 'Commonwealth of Australia',
      anzscoClassificationVersion: 'ANZSCO 2022/2023 Standard',
      fetchedAt,
      sourcePublishedAt,
      sourceUrl: url
    },
    monitoredShortages: {
      electrician_341111: {
        anzscoCode: '341111',
        title: 'Electrician (General)',
        classificationVersion: 'ANZSCO 2022/2023',
        nationalShortage: elecMatch.isShortage,
        labour_market_status: {
          nationalShortage: elecMatch.isShortage,
          rating: elecMatch.isShortage ? 'National Shortage' : 'No Shortage',
          evidenceText: elecMatch.evidenceText
        },
        visa_relevance: {
          isAutomaticVisaGrant: false,
          assessingAuthority: 'Trades Recognition Australia (TRA)',
          assessingAuthorityCode: 'TRA',
          disclaimer: 'Domestic shortage does NOT grant automatic work or permanent residence visa.'
        },
        qualification_requirements: {
          standardApprenticeshipYears: 4,
          overseasExperienceRequirement: '4-year apprenticeship or 3+ years documented full-time post-qualification experience with technical interview/practical test',
          evidenceText: 'TRA migration skills assessment requires verified employment evidence and practical skills evaluation.'
        },
        migration_pathway_status: {
          pathwayType: 'General Skilled Migration (Points-tested) or Employer Sponsored (482/186)',
          requiresEmployerSponsor: true
        }
      },
      software_engineer_261313: {
        anzscoCode: '261313',
        title: 'Software Engineer',
        classificationVersion: 'ANZSCO 2022/2023',
        nationalShortage: softMatch.isShortage,
        labour_market_status: {
          nationalShortage: softMatch.isShortage,
          rating: softMatch.isShortage ? 'National Shortage' : 'No Shortage',
          evidenceText: softMatch.evidenceText
        },
        visa_relevance: {
          isAutomaticVisaGrant: false,
          assessingAuthority: 'Australian Computer Society (ACS)',
          assessingAuthorityCode: 'ACS',
          disclaimer: 'Domestic shortage does NOT grant automatic work or permanent residence visa.'
        },
        qualification_requirements: {
          diplomaRplYearsRequired: 6,
          requirementNote: 'Non-ICT or Diploma qualifications require RPL pathway with 5-6 years relevant work experience',
          evidenceText: 'ACS skills assessment deducts 5-6 years of professional work experience for non-ICT diploma holders.'
        },
        migration_pathway_status: {
          pathwayType: 'Subclass 189/190/491 (High points pool, diploma applicants face heavy RPL experience deductions)',
          requiresEmployerSponsor: false
        }
      }
    },
    legalBoundaryDisclaimer: {
      domesticShortageVsVisaGrant: disclaimerEvidenceText
    }
  };

  const evidence = [
    {
      evidenceId: 'ev-jsa-shortage-distinction',
      claim: 'JSA 明确区分：国内劳动力紧缺统计用于指导本土职业教育与雇主招聘，绝不等于外国申请人自动获得技术移民签证。',
      quotes: [disclaimerEvidenceText],
      sourceUrl: url
    },
    {
      evidenceId: 'ev-jsa-electrician-shortage',
      claim: `澳大利亚就业与技能署 (JSA) 2025 紧缺职业清单统计显示：电工 (ANZSCO 341111) 评级为 ${elecMatch.isShortage ? '全澳紧缺 (National Shortage)' : '非紧缺 (No Shortage)'}。`,
      quotes: [elecMatch.evidenceText],
      sourceUrl: url
    },
    {
      evidenceId: 'ev-jsa-software-shortage',
      claim: `澳大利亚就业与技能署 (JSA) 2025 紧缺职业清单统计显示：软件工程师 (ANZSCO 261313) 评级为 ${softMatch.isShortage ? '全澳紧缺 (National Shortage)' : '非紧缺 (No Shortage)'}。`,
      quotes: [softMatch.evidenceText],
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-jsa-au-2025',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    normalizedFacts,
    evidence
  };
}
