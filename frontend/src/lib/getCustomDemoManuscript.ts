import { Manuscript } from '@/components/ManuscriptPreview';

/**
 * Generates a custom demo manuscript based on the research topic and article summaries
 * @param parsedIdea The parsed research idea
 * @param articleSummaries Summaries of the articles found
 * @returns A complete manuscript object
 */
export function getCustomDemoManuscript(
  parsedIdea: any,
  articleSummaries: any[]
): Manuscript {
  const researchTopic = parsedIdea?.research_topic || 'medical research topic';
  const studyType = parsedIdea?.study_type || 'systematic review';
  const population = parsedIdea?.population || 'patients';
  const targetJournal = parsedIdea?.target_journal || 'JAMA';
  
  const title = `${studyType.charAt(0).toUpperCase() + studyType.slice(1)}: ${researchTopic}`;
  
  const abstractContent = `Importance: ${researchTopic} is an important area of research in ${population} healthcare. Understanding the effectiveness of interventions is crucial for clinical decision-making.

Objective: To evaluate the efficacy and safety of interventions for ${researchTopic} in ${population} through a ${studyType}.

Data Sources: PubMed, Cochrane Library, and EMBASE were searched from January 2000 through December 2022.

Study Selection: Randomized controlled trials and observational studies examining interventions for ${researchTopic} in ${population}.

Data Extraction and Synthesis: Data were extracted by two independent reviewers. Random-effects meta-analysis was performed to calculate risk ratios (RRs) with 95% confidence intervals (CIs).

Main Outcomes and Measures: Primary outcomes included efficacy measures specific to ${researchTopic} and adverse events. Secondary outcomes included quality of life and cost-effectiveness.

Results: Five studies (1,132 participants) met inclusion criteria. The intervention was associated with improved outcomes (RR, 0.68; 95% CI, 0.51-0.92; I²=42%) and better quality of life scores (standardized mean difference, -0.39; 95% CI, -0.61 to -0.18; I²=38%). No significant difference was observed in adverse event rates (RR, 0.94; 95% CI, 0.69-1.31; I²=45%).

Conclusions and Relevance: This ${studyType} suggests that interventions for ${researchTopic} in ${population} may be effective and safe, with modest benefits for quality of life. However, the quality of evidence is moderate, and more research is needed.`;

  const introductionContent = `${researchTopic} represents a significant healthcare challenge affecting ${population}. The prevalence ranges from 10% to 25% depending on geographic region and demographic factors. Despite advances in treatment approaches, optimal management strategies remain controversial.

Previous studies have reported conflicting results regarding the efficacy of interventions for ${researchTopic}. A 2018 review concluded that standard treatments showed limited long-term benefits, while more recent studies have suggested potential advantages for newer approaches. Clinical practice guidelines from major medical organizations provide varying recommendations, reflecting the uncertainty in the evidence base.

Given the continued controversy and the emergence of new evidence, we conducted a ${studyType} to evaluate the efficacy and safety of interventions for ${researchTopic} in ${population}. This analysis aims to synthesize the current evidence to inform clinical decision-making and identify areas for future research.`;

  const methodsContent = `This ${studyType} was conducted in accordance with the Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA) guidelines. The protocol was registered in PROSPERO (CRD42023XXXXX).

Data Sources and Searches
We searched PubMed, Cochrane Library, and EMBASE from January 2000 through December 2022. The search strategy included the following terms: "${researchTopic.toLowerCase()}", "intervention", "treatment", "${population}", and related keywords. We also manually searched the reference lists of included studies and relevant reviews.

Study Selection
Studies were eligible for inclusion if they (1) evaluated interventions for ${researchTopic}, (2) included ${population} as the primary population, (3) reported outcomes of interest, and (4) used appropriate study designs (randomized controlled trials or high-quality observational studies). Studies were excluded if they (1) included only non-${population} populations without separate reporting, (2) evaluated only non-standard interventions, (3) were not published in English, or (4) did not report outcomes of interest.

Data Extraction and Quality Assessment
Two reviewers independently extracted data using a standardized form. Discrepancies were resolved by consensus or by a third reviewer. The following information was extracted: study characteristics, participant demographics, intervention details, and outcomes. The risk of bias was assessed using the Cochrane Risk of Bias tool for randomized trials and the Newcastle-Ottawa Scale for observational studies.

Outcomes
Primary outcomes included efficacy measures specific to ${researchTopic} (e.g., symptom scores, disease progression) and adverse events. Secondary outcomes included quality of life measures, healthcare utilization, and cost-effectiveness.

Data Synthesis and Analysis
Random-effects meta-analysis was performed using Review Manager (RevMan) version 5.4. Risk ratios (RRs) with 95% confidence intervals (CIs) were calculated for dichotomous outcomes, and mean differences or standardized mean differences (SMDs) with 95% CIs for continuous outcomes. Heterogeneity was assessed using the I² statistic, with values of 25%, 50%, and 75% representing low, moderate, and high heterogeneity, respectively. Subgroup analyses were conducted based on intervention type and population characteristics. Publication bias was assessed using funnel plots and Egger test.`;

  const resultsContent = `Study Selection and Characteristics
The literature search identified 342 records, of which 15 full-text articles were assessed for eligibility. Five studies involving 1,132 participants met inclusion criteria. The studies were published between 2008 and 2021 and conducted in North America (n=2), Europe (n=2), and Asia (n=1). Sample sizes ranged from 98 to 328 participants. The mean age of participants ranged from 45.8 to 68.3 years. The most common comorbidities included hypertension (42%), diabetes (28%), and hyperlipidemia (35%).

All studies compared the intervention with standard care or placebo. The intervention regimens varied across studies but followed similar principles. All studies reported outcomes for efficacy and safety. Four studies reported quality of life measures and healthcare utilization.

Risk of Bias
Three studies were judged to have low risk of bias, one had some concerns, and one had high risk of bias. The main sources of bias were inadequate allocation concealment and incomplete outcome data.

Primary Outcomes
Efficacy: Five studies (1,132 participants) reported efficacy outcomes. The intervention was associated with significant improvements compared with standard care or placebo (RR, 0.68; 95% CI, 0.51-0.92; I²=42%). The absolute risk reduction was 15.2% (95% CI, 8.3%-22.1%), with a number needed to treat of 7.

Quality of Life: Four studies (804 participants) assessed quality of life using validated scales. Meta-analysis showed that the intervention was associated with better quality of life scores (SMD, -0.39; 95% CI, -0.61 to -0.18; I²=38%). The effect was more pronounced in studies using comprehensive intervention approaches (SMD, -0.52; 95% CI, -0.78 to -0.26) compared with limited approaches (SMD, -0.28; 95% CI, -0.49 to -0.07).

Adverse Events: Five studies (1,132 participants) reported adverse event rates. There was no significant difference in overall adverse event rates between intervention and control groups (RR, 0.94; 95% CI, 0.69-1.31; I²=45%). Subgroup analysis showed no significant difference in serious adverse events (RR, 0.92; 95% CI, 0.54-1.57) or minor adverse events (RR, 0.89; 95% CI, 0.61-1.33).

Secondary Outcomes
Healthcare Utilization: Four studies (804 participants) reported healthcare utilization. Participants receiving the intervention had 1.2 fewer healthcare visits per year than those in the control group (95% CI, 0.62-1.78; I²=51%).

Cost-effectiveness: Three studies (632 participants) reported cost-effectiveness data. The intervention was associated with an incremental cost-effectiveness ratio of $24,500 per quality-adjusted life-year, which is considered cost-effective by conventional standards.

Publication Bias
Visual inspection of funnel plots and Egger test (P=0.32) did not suggest publication bias for the primary outcomes.`;

  const discussionContent = `This ${studyType} of five studies involving 1,132 ${population} found that interventions for ${researchTopic} were associated with improved efficacy outcomes, better quality of life, and reduced healthcare utilization. The intervention appeared to be safe, with no significant increase in adverse events compared with standard care or placebo.

Our findings regarding efficacy are consistent with recent studies suggesting that targeted interventions may improve outcomes in ${population} with ${researchTopic}. The absolute risk reduction of 15.2% translates to a number needed to treat of 7, indicating a substantial clinical benefit. This effect was consistent across different populations and intervention approaches, suggesting broad applicability.

The effect of the intervention on quality of life was statistically significant and clinically meaningful. The standardized mean difference of -0.39 represents a moderate effect size according to Cohen's criteria. This improvement in quality of life is particularly important for ${population} with ${researchTopic}, as the condition often has substantial impacts on daily functioning and well-being.

The finding that the intervention did not significantly increase adverse events is reassuring for clinical implementation. Safety is a primary concern for any intervention, especially in ${population} who may have multiple comorbidities and be at higher risk for adverse effects.

The economic analysis suggesting cost-effectiveness adds another dimension to the evidence supporting the intervention. In an era of increasing healthcare costs and limited resources, interventions that provide good value for money are increasingly important for healthcare systems and payers.

Strengths of this ${studyType} include the focus on high-quality studies, the comprehensive search strategy, and the assessment of multiple clinically relevant outcomes. Limitations include the small number of included studies, the heterogeneity in intervention approaches and outcome measures, and the potential for bias in some of the included studies. Additionally, most studies did not report long-term outcomes beyond one year, limiting our ability to assess the durability of effects.

Our findings have important implications for clinical practice. The evidence suggests that interventions for ${researchTopic} in ${population} can be effective, safe, and cost-effective. However, the decision to implement specific interventions should be individualized based on patient characteristics, preferences, and local resources. For ${population} at high risk or with severe symptoms, more intensive interventions may be warranted.

Future research should focus on identifying which specific components of interventions are most effective, evaluating long-term outcomes, and investigating implementation strategies to promote uptake in diverse clinical settings. Additionally, studies should include more diverse populations to ensure generalizability of findings.`;

  const references = articleSummaries.map((summary, index) => {
    const authors = summary.title.split(':')[0] || `Author Group ${index + 1}`;
    return `${index + 1}. ${authors}. ${summary.title}. Journal of ${targetJournal} Research. 2022;${index + 1}(${index + 2}):${100 + index * 10}-${150 + index * 10}.`;
  });

  if (references.length < 5) {
    references.push(
      `${references.length + 1}. Smith J, Johnson A, Williams B. Current approaches to ${researchTopic} in ${population}. Journal of Medical Research. 2021;45(8):742-749.`,
      `${references.length + 2}. Brown R, Davis C, Miller M. Meta-analysis of interventions for ${researchTopic}. International Journal of Evidence-Based Healthcare. 2020;12(3):56-62.`,
      `${references.length + 3}. Garcia L, Martinez J, Rodriguez P. Systematic review of ${researchTopic} management. Clinical Research Reviews. 2019;30(3):782-789.`,
      `${references.length + 4}. Wilson T, Anderson K, Thompson S. Cost-effectiveness of interventions for ${researchTopic} in ${population}. Health Economics. 2018;17(8):742-748.`,
      `${references.length + 5}. Lee H, Kim S, Park J. Randomized trial of novel interventions for ${researchTopic}. New England Journal of Medicine. 2017;38(16):1542-1553.`
    );
  }

  const wordCount = abstractContent.split(' ').length + 
                   introductionContent.split(' ').length + 
                   methodsContent.split(' ').length + 
                   resultsContent.split(' ').length + 
                   discussionContent.split(' ').length + 
                   references.length * 15; // Approximate words per reference

  return {
    title,
    abstract: {
      title: "Abstract",
      content: abstractContent
    },
    introduction: {
      title: "Introduction",
      content: introductionContent
    },
    methods: {
      title: "Methods",
      content: methodsContent
    },
    results: {
      title: "Results",
      content: resultsContent
    },
    discussion: {
      title: "Discussion",
      content: discussionContent
    },
    references,
    word_count: wordCount
  };
}
