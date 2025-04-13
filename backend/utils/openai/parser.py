import os
import openai
from typing import List, Optional
from dotenv import load_dotenv

from app.models.schemas import ParsedResearchIdea

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def expand_research_idea(research_idea: str) -> str:
    """
    Expand a simple research idea into a more comprehensive research question
    using OpenAI's GPT-4o mini model.
    
    Args:
        research_idea: The initial research idea
        
    Returns:
        str: Expanded and improved research question
    """
    prompt = f"""
    You are a medical research expert. Expand and improve the following research idea into a more comprehensive, 
    well-structured research question with clear objectives and scope:
    
    Research Idea: {research_idea}
    
    Your expanded research question should:
    1. Clearly define the primary and secondary outcomes
    2. Specify the population of interest with inclusion/exclusion criteria
    3. Identify the intervention and comparison groups if applicable
    4. Consider potential confounding variables
    5. Suggest an appropriate study design
    
    Provide only the expanded research question without additional commentary.
    """
    
    try:
        if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY").startswith("sk-dummy"):
            print("Using mock response for expand_research_idea due to missing or dummy API key")
            if "tonsillectomy" in research_idea.lower():
                return "Conduct a meta-analysis evaluating the efficacy and safety of prophylactic antibiotics following tonsillectomy in pediatric patients (ages 2-18), measuring outcomes of post-operative infection rates, pain scores, bleeding events, and hospital readmission rates, while accounting for antibiotic type, duration, and surgical technique as potential moderating variables."
            else:
                return research_idea
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical research expert that helps formulate comprehensive research questions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        expanded_idea = response.choices[0].message.content.strip()
        return expanded_idea
        
    except Exception as e:
        print(f"Error expanding research idea with OpenAI: {str(e)}")
        return research_idea

def parse_research_idea(
    research_idea: str,
    study_type: Optional[str] = None,
    population: Optional[str] = None,
    target_journal: Optional[str] = None
) -> ParsedResearchIdea:
    """
    Parse a natural language research idea into structured components
    using OpenAI's GPT model. First expands the research idea for better results.
    
    Args:
        research_idea: The natural language research idea
        study_type: Optional study type specification
        population: Optional population specification
        target_journal: Optional target journal for formatting
        
    Returns:
        ParsedResearchIdea: Structured research idea components
    """
    expanded_idea = expand_research_idea(research_idea)
    
    prompt = f"""
    Parse the following medical research idea into structured components:
    
    Research Idea: {expanded_idea}
    
    Additional Information:
    """
    
    if study_type:
        prompt += f"Study Type: {study_type}\n"
    if population:
        prompt += f"Population: {population}\n"
    if target_journal:
        prompt += f"Target Journal: {target_journal}\n"
        
    prompt += """
    Please extract the following components:
    1. Research Topic: The main subject of the research
    2. Population: The target population (e.g., adults, pediatrics, elderly)
    3. Study Type: The type of study (e.g., systematic review, meta-analysis, scoping review)
    4. Search Terms: A list of 5-10 key terms that would be used to search medical databases
    
    Format your response as a JSON object with the following structure:
    {
        "research_topic": "...",
        "population": "...",
        "study_type": "...",
        "target_journal": "...",
        "search_terms": ["term1", "term2", ...]
    }
    """
    
    try:
        if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY").startswith("sk-dummy"):
            print("Using mock response for parse_research_idea due to missing or dummy API key")
            if "tonsillectomy" in research_idea.lower():
                return ParsedResearchIdea(
                    research_topic="Antibiotic use after tonsillectomy in children",
                    population=population or "pediatric",
                    study_type=study_type or "meta-analysis",
                    target_journal=target_journal or "JAMA",
                    search_terms=["tonsillectomy", "antibiotics", "children", "post-operative", 
                                 "pediatric", "infection", "prophylaxis", "randomized controlled trial", 
                                 "systematic review", "meta-analysis"]
                )
            else:
                return ParsedResearchIdea(
                    research_topic=research_idea,
                    population=population or "Not specified",
                    study_type=study_type or "meta-analysis",
                    target_journal=target_journal or "JAMA",
                    search_terms=["term1", "term2", "term3", "term4", "term5"]
                )
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a medical research assistant that helps parse research ideas into structured components. Return your response as a valid JSON object."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        
        result = response.choices[0].message.content
        
        import json
        parsed_data = json.loads(result)
        
        return ParsedResearchIdea(
            research_topic=parsed_data["research_topic"],
            population=parsed_data.get("population"),
            study_type=parsed_data.get("study_type"),
            target_journal=parsed_data.get("target_journal"),
            search_terms=parsed_data["search_terms"]
        )
        
    except Exception as e:
        print(f"Error parsing research idea with OpenAI: {str(e)}")
        return ParsedResearchIdea(
            research_topic=research_idea,
            population=population or "Not specified",
            study_type=study_type or "meta-analysis",
            target_journal=target_journal or "JAMA",
            search_terms=["fallback", "term1", "term2", "term3", "term4"]
        )
