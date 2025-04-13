import { useState } from 'react';
import { ResearchFormData } from '@/components/ResearchForm';
import { Manuscript } from '@/components/ManuscriptPreview';
import { parseResearchIdea, searchArticles, summarizeArticles, generateManuscript } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const BACKEND_TIMEOUT_MS = 120000; // Increase timeout to 120 seconds (2 minutes)

const DEMO_MANUSCRIPT: Manuscript = {
  title: "Meta-Analysis: Antibiotic Use After Tonsillectomy in Children",
  abstract: {
    title: "Abstract",
    content: "Background: Post-tonsillectomy antibiotic use remains controversial in pediatric patients. This meta-analysis evaluates the efficacy of prophylactic antibiotics in reducing morbidity after tonsillectomy in children.\n\nMethods: We conducted a systematic review and meta-analysis of randomized controlled trials. PubMed was searched for relevant studies published between 2000 and 2023. Studies were included if they compared antibiotic prophylaxis to placebo in pediatric tonsillectomy patients.\n\nResults: Five studies with 1,050 participants were included. Prophylactic antibiotics reduced the risk of post-tonsillectomy pain (standardized mean difference -0.53, 95% CI -0.71 to -0.35) and decreased time to return to normal diet (mean difference -0.87 days, 95% CI -1.17 to -0.57). No significant difference was found in post-tonsillectomy hemorrhage rates (risk ratio 0.84, 95% CI 0.67 to 1.04).\n\nConclusion: Evidence suggests modest benefits of antibiotic prophylaxis after pediatric tonsillectomy for pain reduction and earlier return to normal diet, but no significant effect on bleeding rates. Clinicians should weigh these benefits against concerns about antimicrobial resistance."
  },
  introduction: {
    title: "Introduction",
    content: "Tonsillectomy is one of the most common surgical procedures performed in children, with over 530,000 procedures performed annually in the United States alone. Despite its frequency, there remains significant practice variation in perioperative management, particularly regarding the use of prophylactic antibiotics.\n\nThe theoretical basis for antibiotic use after tonsillectomy includes reducing bacterial colonization at the surgical site, decreasing inflammation, and preventing secondary infections. However, concerns about antimicrobial resistance, potential adverse effects, and additional costs have led to questioning of this practice.\n\nClinical practice guidelines from the American Academy of Otolaryngology-Head and Neck Surgery Foundation recommend against routine perioperative antibiotic administration for pediatric tonsillectomy. Despite this recommendation, surveys indicate that approximately 60-70% of otolaryngologists continue to prescribe antibiotics after tonsillectomy.\n\nPrevious systematic reviews on this topic have yielded conflicting results, with some suggesting modest benefits in terms of reduced pain and earlier return to normal activities, while others found no significant advantages. These inconsistencies may be attributed to heterogeneity in study populations, antibiotic regimens, and outcome measures.\n\nThe purpose of this meta-analysis is to provide an updated and comprehensive assessment of the efficacy of prophylactic antibiotics in reducing morbidity after tonsillectomy in children, with a focus on clinically relevant outcomes including post-operative pain, time to return to normal diet, and hemorrhage rates."
  },
  methods: {
    title: "Methods",
    content: "This systematic review and meta-analysis was conducted in accordance with the Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA) guidelines.\n\nSearch Strategy\nWe searched PubMed, EMBASE, and the Cochrane Central Register of Controlled Trials for relevant studies published between January 1, 2000, and December 31, 2023. The search terms included combinations of 'tonsillectomy', 'adenotonsillectomy', 'antibiotic', 'antimicrobial', 'prophylaxis', 'children', and 'pediatric'. Reference lists of identified articles were also manually searched for additional relevant studies.\n\nInclusion and Exclusion Criteria\nStudies were included if they: (1) were randomized controlled trials; (2) compared antibiotic prophylaxis to placebo or no treatment; (3) included pediatric patients (≤18 years) undergoing tonsillectomy or adenotonsillectomy; and (4) reported at least one of the following outcomes: post-operative pain, time to return to normal diet, or post-tonsillectomy hemorrhage.\n\nStudies were excluded if they: (1) were non-randomized or observational studies; (2) included adult patients only; (3) compared different antibiotic regimens without a placebo or no-treatment group; or (4) were published in languages other than English.\n\nData Extraction and Quality Assessment\nTwo reviewers independently extracted data from eligible studies using a standardized form. Extracted information included study characteristics (author, year, country), patient demographics, antibiotic regimen, outcome measures, and results. The Cochrane Risk of Bias tool was used to assess the methodological quality of included studies.\n\nStatistical Analysis\nMeta-analysis was performed using a random-effects model due to anticipated heterogeneity among studies. For continuous outcomes (pain scores, time to return to normal diet), standardized mean differences (SMD) or mean differences (MD) with 95% confidence intervals (CI) were calculated. For dichotomous outcomes (hemorrhage rates), risk ratios (RR) with 95% CI were calculated.\n\nHeterogeneity was assessed using the I² statistic, with values of 25%, 50%, and 75% considered as low, moderate, and high heterogeneity, respectively. Publication bias was evaluated using funnel plots and Egger's test. Sensitivity analyses were conducted to assess the robustness of findings. All analyses were performed using R version 4.1.0 with the 'meta' package."
  },
  results: {
    title: "Results",
    content: "Study Selection\nThe initial search identified 247 potentially relevant articles. After removing duplicates and screening titles and abstracts, 32 full-text articles were assessed for eligibility. Of these, 5 randomized controlled trials met the inclusion criteria and were included in the meta-analysis.\n\nStudy Characteristics\nThe 5 included studies comprised a total of 1,050 pediatric patients (527 in the antibiotic group and 523 in the control group). The studies were published between 2001 and 2022 and were conducted in the United States (n=2), United Kingdom (n=1), Turkey (n=1), and Australia (n=1). The mean age of participants ranged from 5.7 to 8.3 years. The antibiotic regimens varied across studies, with amoxicillin being the most commonly used antibiotic (3 studies), followed by amoxicillin-clavulanate (1 study) and azithromycin (1 study). The duration of antibiotic treatment ranged from 5 to 7 days.\n\nRisk of Bias Assessment\nOverall, the methodological quality of the included studies was moderate to high. All studies reported adequate randomization methods, and most studies reported appropriate allocation concealment. Four studies were double-blinded, while one study was single-blinded. Loss to follow-up was generally low (<10%) across studies.\n\nPost-operative Pain\nAll 5 studies reported data on post-operative pain, although the pain assessment methods varied (visual analog scale, faces pain scale, or parental report). Meta-analysis showed that antibiotic prophylaxis significantly reduced post-operative pain compared to placebo or no treatment (SMD -0.53, 95% CI -0.71 to -0.35; p<0.001). Heterogeneity was moderate (I²=48%).\n\nTime to Return to Normal Diet\nFour studies reported data on time to return to normal diet. Meta-analysis showed that antibiotic prophylaxis significantly reduced the time to return to normal diet compared to placebo or no treatment (MD -0.87 days, 95% CI -1.17 to -0.57; p<0.001). Heterogeneity was low (I²=22%).\n\nPost-tonsillectomy Hemorrhage\nAll 5 studies reported data on post-tonsillectomy hemorrhage. Meta-analysis showed no significant difference in the risk of post-tonsillectomy hemorrhage between the antibiotic and control groups (RR 0.84, 95% CI 0.67 to 1.04; p=0.11). Heterogeneity was low (I²=15%).\n\nPublication Bias\nFunnel plots and Egger's test did not suggest significant publication bias for any of the outcomes (p>0.05).\n\nSensitivity Analysis\nSensitivity analyses excluding each study one at a time did not significantly alter the main findings, indicating the robustness of the results."
  },
  discussion: {
    title: "Discussion",
    content: "This meta-analysis of 5 randomized controlled trials involving 1,050 pediatric patients found that prophylactic antibiotics after tonsillectomy were associated with modest but statistically significant reductions in post-operative pain and time to return to normal diet. However, no significant effect was observed on post-tonsillectomy hemorrhage rates.\n\nOur findings regarding pain reduction are consistent with previous meta-analyses by Dhiwakar et al. and Fedorowicz et al., who also reported significant reductions in post-operative pain with antibiotic prophylaxis. The mechanism by which antibiotics reduce pain may involve decreased bacterial colonization at the surgical site, reduced local inflammation, or prevention of secondary infections. The clinical significance of the observed pain reduction (SMD -0.53) can be considered moderate and potentially meaningful for pediatric patients.\n\nSimilarly, the finding that antibiotic prophylaxis reduced the time to return to normal diet by approximately 0.87 days is clinically relevant, as earlier resumption of normal diet can prevent dehydration and malnutrition, which are common concerns after tonsillectomy in children. This finding aligns with previous studies suggesting that antibiotics may facilitate faster recovery after tonsillectomy.\n\nThe lack of significant effect on post-tonsillectomy hemorrhage rates is consistent with most previous studies and meta-analyses. This suggests that bacterial infection may not play a major role in the pathogenesis of post-tonsillectomy bleeding, which is more likely influenced by surgical technique, hemostasis methods, and patient factors.\n\nStrengths and Limitations\nStrengths of this meta-analysis include the inclusion of only randomized controlled trials, comprehensive search strategy, rigorous methodological assessment, and analysis of clinically relevant outcomes. Additionally, the included studies had relatively low risk of bias and low heterogeneity for most outcomes.\n\nHowever, several limitations should be acknowledged. First, the number of included studies was relatively small, which may limit the generalizability of our findings. Second, there was variability in antibiotic regimens, surgical techniques, and outcome assessment methods across studies, which could influence the results. Third, none of the included studies specifically assessed antimicrobial resistance or adverse effects of antibiotics, which are important considerations in antibiotic stewardship. Fourth, long-term outcomes were not evaluated in most studies.\n\nClinical Implications and Future Research\nThe findings of this meta-analysis suggest that prophylactic antibiotics after tonsillectomy in children may provide modest benefits in terms of reduced pain and earlier return to normal diet. However, these benefits must be weighed against potential risks, including antimicrobial resistance, adverse effects, and additional costs.\n\nClinicians should consider individual patient factors, such as age, comorbidities, and risk factors for complications, when deciding whether to prescribe antibiotics after tonsillectomy. For high-risk patients, such as those with cardiac valvular disease or immunocompromise, antibiotic prophylaxis may be more strongly indicated.\n\nFuture research should focus on identifying specific patient subgroups who may benefit most from antibiotic prophylaxis, evaluating the optimal antibiotic regimen (type, dose, and duration), and assessing long-term outcomes and adverse effects. Additionally, cost-effectiveness analyses would provide valuable information for clinical decision-making and policy development."
  },
  references: [
    "1. Dhiwakar M, Clement WA, Supriya M, McKerrow W. Antibiotics to reduce post-tonsillectomy morbidity. Cochrane Database Syst Rev. 2012;12:CD005607.",
    "2. Fedorowicz Z, Al-Muharraqi MA, Nasser M, Al-Harthy N. Antibiotics for post-tonsillectomy morbidity: a systematic review of randomized controlled trials. Eur Arch Otorhinolaryngol. 2011;268(8):1061-1070.",
    "3. Guerra MM, Garcia E, Pilan RR, Rapoport PB, Campanholo CB, Martinelli EO. Antibiotic use in post-adenotonsillectomy morbidity: a randomized prospective study. Braz J Otorhinolaryngol. 2008;74(3):337-341.",
    "4. Grandis JR, Johnson JT, Vickers RM, et al. The efficacy of perioperative antibiotic therapy on recovery following tonsillectomy in adults: randomized double-blind placebo-controlled trial. Otolaryngol Head Neck Surg. 1992;106(2):137-142.",
    "5. Colreavy MP, Nanan D, Benamer M, et al. Antibiotic prophylaxis post-tonsillectomy: is it of benefit? Int J Pediatr Otorhinolaryngol. 1999;50(1):15-22."
  ],
  word_count: 2850
};

export function useManuscriptGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(true); // Enable backend API calls by default
  const [formData, setFormData] = useState<ResearchFormData | null>(null);
  const { toast } = useToast();

  const generateFromResearchIdea = async (data: ResearchFormData) => {
    try {
      setIsLoading(true);
      setManuscript(null);
      setFormData(data);
      
      const isExampleQuery = false;
      
      let timeoutId: NodeJS.Timeout | null = null;
      let timeoutTriggered = false;
      
      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          console.log(`Backend timeout after ${BACKEND_TIMEOUT_MS}ms`);
          timeoutTriggered = true;
          
          toast({
            title: 'Backend processing taking longer than expected',
            description: 'Your manuscript is being generated but is taking longer than expected. Complex research topics with many articles may take up to 60 seconds to process. Please wait for completion or try a more specific query.',
            variant: 'default',
          });
          
          resolve(null);
        }, BACKEND_TIMEOUT_MS);
      });
      
      try {
        setCurrentStep('Parsing research idea...');
        console.log('Submitting form data:', data);
        
        const parsedIdeaPromise = parseResearchIdea(data);
        const parsedIdea = await Promise.race([parsedIdeaPromise, timeoutPromise]);
        
        if (timeoutTriggered) {
          if (isExampleQuery) {
            return DEMO_MANUSCRIPT;
          }
          return null;
        }
        
        console.log('Parsed research idea:', parsedIdea);
        
        setCurrentStep('Searching for relevant articles...');
        const articlesPromise = searchArticles(parsedIdea);
        const articles = await Promise.race([articlesPromise, timeoutPromise]);
        
        if (timeoutTriggered) {
          if (isExampleQuery) {
            return DEMO_MANUSCRIPT;
          }
          return null;
        }
        
        if (!articles || articles.length === 0) {
          toast({
            title: 'No relevant articles found',
            description: 'We couldn\'t find any relevant articles for your research topic in PubMed. Try broadening your search terms, checking for alternative terminology, or using a more established research area.',
            variant: 'destructive',
          });
          return null;
        }
        
        setCurrentStep('Analyzing and summarizing articles...');
        const summariesPromise = summarizeArticles(articles);
        const summaries = await Promise.race([summariesPromise, timeoutPromise]);
        
        if (timeoutTriggered) {
          if (isExampleQuery) {
            return DEMO_MANUSCRIPT;
          }
          return null;
        }
        
        setCurrentStep('Generating manuscript...');
        
        if (!summaries || summaries.length === 0) {
          toast({
            title: 'Article summarization failed',
            description: 'We found articles but couldn\'t summarize them properly. This may be due to complex medical content or server limitations. Try a more specific research topic or check your internet connection.',
            variant: 'destructive',
          });
          return null;
        }
        
        const researchRequest = {
          research_idea: data.researchIdea,
          study_type: data.studyType || undefined,
          population: data.population || undefined,
          date_range: data.startYear && data.endYear 
            ? [parseInt(data.startYear), parseInt(data.endYear)] 
            : undefined,
          outcomes: data.outcomes ? data.outcomes.split(',').map(o => o.trim()) : undefined,
          target_journal: data.targetJournal || undefined,
        };
        
        const requestData = {
          request: researchRequest,
          parsed_idea: parsedIdea,
          article_summaries: summaries
        };
        
        const manuscriptPromise = generateManuscript(requestData);
        const generatedManuscript = await Promise.race([manuscriptPromise, timeoutPromise]);
        
        if (timeoutTriggered) {
          if (isExampleQuery) {
            return DEMO_MANUSCRIPT;
          }
          return null;
        }
        
        if (timeoutId) clearTimeout(timeoutId);
        
        setManuscript(generatedManuscript);
        setBackendAvailable(true);
        
        toast({
          title: 'Manuscript generated successfully',
          description: 'Your research manuscript has been generated using GPT-4o and PubMed data. You can now review, edit, and export it in your preferred format.',
          variant: 'default',
        });
        
        return generatedManuscript;
      } catch (apiError) {
        console.error('API error:', apiError);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const errorMessage = apiError instanceof TypeError && apiError.message === 'Failed to fetch'
          ? 'Network error: Unable to connect to the backend service. This could be due to CORS configuration or the backend being unavailable.'
          : 'The backend is currently unavailable.';
        
        {
          toast({
            title: 'Backend connection issue detected',
            description: `${errorMessage} This may be due to high server load or network issues. Please try again in a few moments with a more specific query.`,
            variant: 'destructive',
          });
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error generating manuscript:', error);
      toast({
        title: 'Error generating manuscript',
        description: 'We encountered an unexpected error while generating your manuscript. This could be due to server load, complex research topic, or temporary API limitations. Try again with a more specific query.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const interactWithAI = async (command: string) => {
    if (!manuscript) {
      toast({
        title: 'No manuscript available',
        description: 'Please generate a manuscript first before using the AI assistant.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setCurrentStep('AI interaction...');

    try {
      const { interactWithManuscript } = await import('../lib/aiInteraction');
      
      const response = await interactWithManuscript(
        manuscript,
        command,
        formData || undefined
      );

      if (response.success) {
        setManuscript(response.updated_manuscript);
        toast({
          title: 'Manuscript updated',
          description: response.explanation,
        });
      } else {
        toast({
          title: 'AI interaction issue',
          description: response.explanation,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in AI interaction:', error);
      toast({
        title: 'Error updating manuscript',
        description: 'There was an error processing your request. Please try again with a simpler command.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  return {
    isLoading,
    manuscript,
    currentStep,
    backendAvailable,
    generateFromResearchIdea,
    interactWithAI,
  };
}
