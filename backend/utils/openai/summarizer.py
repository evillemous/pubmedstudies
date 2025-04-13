import os
import openai
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

from app.models.schemas import Article, ArticleSummary

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize_articles(articles: List[Article]) -> List[ArticleSummary]:
    """
    Summarize the abstracts of articles using OpenAI's GPT model to extract key outcomes.
    
    Args:
        articles: List of articles to summarize
        
    Returns:
        List[ArticleSummary]: List of article summaries with key findings and relevance scores
    """
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY").startswith("sk-dummy"):
        print("Using mock response for summarize_articles due to missing or dummy API key")
        summaries = []
        for article in articles:
            if "tonsillectomy" in article.title.lower() or "tonsillectomy" in article.abstract.lower():
                relevance = 9.0
            else:
                relevance = 6.0
                
            key_findings = f"This study found that {article.abstract.split('Conclusion:')[-1].strip()}" if "Conclusion:" in article.abstract else "Key findings extracted from the abstract."
                
            summary = ArticleSummary(
                pmid=article.pmid,
                title=article.title,
                key_findings=key_findings,
                relevance_score=relevance
            )
            
            summaries.append(summary)
            
        return summaries
    
    summaries = []
    
    for article in articles:
        try:
            if not article.abstract or article.abstract == "No abstract available":
                print(f"Skipping article {article.pmid} - No abstract available")
                continue
                
            study_data = extract_study_data(article)
            
            if "relevance_score" not in study_data or study_data["relevance_score"] is None or not isinstance(study_data["relevance_score"], (int, float)):
                study_data["relevance_score"] = 5.0
                
            summary = ArticleSummary(
                pmid=article.pmid,
                title=article.title,
                key_findings=study_data["key_findings"],
                relevance_score=float(study_data["relevance_score"])
            )
            
            summaries.append(summary)
            
        except Exception as e:
            print(f"Error summarizing article {article.pmid}: {str(e)}")
            summary = ArticleSummary(
                pmid=article.pmid,
                title=article.title if hasattr(article, 'title') else "Unknown Title",
                key_findings="Unable to extract key findings from this article.",
                relevance_score=5.0
            )
            summaries.append(summary)
            continue
            
    return summaries

def extract_study_data(article: Article) -> Dict[str, Any]:
    """
    Extract structured data from an article abstract using OpenAI's GPT model.
    
    Args:
        article: Article to extract data from
        
    Returns:
        Dict: Structured data extracted from the article
    """
    prompt = f"""
    Extract key information from the following medical research article:
    
    Title: {article.title}
    Authors: {', '.join(article.authors)}
    Journal: {article.journal}
    Publication Date: {article.publication_date}
    
    Abstract:
    {article.abstract}
    
    Please extract the following information in JSON format:
    1. study_name: The name of the study (usually first author et al., year)
    2. study_design: The design of the study (e.g., RCT, cohort, case-control)
    3. population: Description of the study population
    4. n_total: Total number of participants (if available)
    5. n_treatment: Number in treatment group (if available)
    6. n_control: Number in control group (if available)
    7. intervention: Description of the intervention (if applicable)
    8. control: Description of the control (if applicable)
    9. outcome_measure: Primary outcome measure
    10. effect_type: Type of effect (e.g., odds ratio, risk ratio, mean difference)
    11. effect_size: Numeric value of the effect size (if available)
    12. ci_lower: Lower bound of confidence interval (if available)
    13. ci_upper: Upper bound of confidence interval (if available)
    14. p_value: P-value for the primary outcome (if available)
    15. key_findings: Brief summary of the key findings (1-2 sentences)
    16. relevance_score: A score from 0-10 indicating how relevant this study is to a meta-analysis (10 being most relevant)
    
    If any information is not available, use null for numeric values and "Not reported" for text values.
    
    Format your response as a JSON object.
    """
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a medical research assistant that extracts structured data from research abstracts. Return your response as a valid JSON object."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        
        result = response.choices[0].message.content
        
        study_data = json.loads(result)
        
        required_fields = [
            "study_name", "study_design", "population", "n_total", 
            "n_treatment", "n_control", "intervention", "control", 
            "outcome_measure", "effect_type", "effect_size", 
            "ci_lower", "ci_upper", "p_value", "key_findings", "relevance_score"
        ]
        
        for field in required_fields:
            if field not in study_data:
                if field == "relevance_score":
                    study_data[field] = 5.0  # Default relevance score
                elif field in ["n_total", "n_treatment", "n_control", "effect_size", "ci_lower", "ci_upper", "p_value"]:
                    study_data[field] = None
                else:
                    study_data[field] = "Not reported"
            elif field == "relevance_score" and (study_data[field] is None or not isinstance(study_data[field], (int, float))):
                study_data[field] = 5.0  # Default relevance score if not a number
        
        return study_data
        
    except Exception as e:
        print(f"Error extracting study data with OpenAI: {str(e)}")
        raise
