import sys
import os
from dotenv import load_dotenv
load_dotenv()

sys.path.append('.')
from utils.openai.client import OpenAIClient
from utils.manuscript.generator import generate_manuscript
from utils.openai.parser import parse_research_idea
from utils.pubmed.search import search_pubmed_articles
from utils.openai.summarizer import summarize_articles
from app.models.schemas import ResearchRequest, ParsedResearchIdea, ArticleSummary
from utils.statistics.meta_analysis import MetaAnalysis

# Define the research request
research_idea = """
Performance a meta analysis comparing different types of pharyngeal reconstruction following total laryngectomy specifically comparing regional flops versus free tissue transfer looking at functional outcomes including speech and swallow speech endpoints should be defined as ChatGPT defines it swallow endpoints should also be determined by ChatGPT you are here now be comprehensive and thorough and remember the study should also stratify based on history of radiation treatment and whether this is a salvage surgery or not
"""

research_request = ResearchRequest(
    research_idea=research_idea,
    study_type="Meta-analysis",
    population=None,
    date_range=None,
    outcomes=None,
    target_journal="JAMA"
)

try:
    # Initialize OpenAI client
    client = OpenAIClient()
    
    print("1. Parsing research idea...")
    # Parse the research idea
    parsed_idea = parse_research_idea(client, research_request)
    
    # Add stratification terms to search
    parsed_idea.search_terms.extend([
        "radiation therapy", "radiotherapy", "radiation treatment", 
        "salvage surgery", "primary surgery", "secondary surgery"
    ])
    
    print("2. Searching for articles...")
    # Search for articles
    articles = search_pubmed_articles(
        search_terms=parsed_idea.search_terms,
        study_type=research_request.study_type,
        population=research_request.population,
        date_range=research_request.date_range,
        max_results=20  # Increase for more comprehensive analysis
    )
    
    if not articles:
        print("No articles found. Using mock data.")
        # Create mock articles for testing
        articles = []
    
    print(f"Found {len(articles)} articles.")
    
    print("3. Summarizing articles...")
    # Summarize articles
    article_summaries = summarize_articles(client, articles, parsed_idea)
    
    print("4. Generating manuscript...")
    # Generate manuscript with stratification
    manuscript = generate_manuscript(
        research_request=research_request,
        parsed_idea=parsed_idea,
        article_summaries=article_summaries
    )
    
    # Print manuscript sections
    print("\n=== MANUSCRIPT GENERATED SUCCESSFULLY ===")
    print(f"Title: {manuscript.title}")
    print("\n=== ABSTRACT ===")
    print(manuscript.abstract.content)
    print("\n=== INTRODUCTION ===")
    print(manuscript.introduction.content[:500] + "...")
    print("\n=== METHODS ===")
    print(manuscript.methods.content[:500] + "...")
    print("\n=== RESULTS ===")
    print(manuscript.results.content[:500] + "...")
    print("\n=== DISCUSSION ===")
    print(manuscript.discussion.content[:500] + "...")
    print(f"\n=== REFERENCES ({len(manuscript.references)}) ===")
    for i, ref in enumerate(manuscript.references[:5]):
        print(f"{i+1}. {ref}")
    print("...")
    
    if manuscript.tables:
        print(f"\n=== TABLES ({len(manuscript.tables)}) ===")
        for table in manuscript.tables:
            print(f"Table: {table.title}")
    
    if manuscript.figures:
        print(f"\n=== FIGURES ({len(manuscript.figures)}) ===")
        for figure in manuscript.figures:
            print(f"Figure: {figure.title}")
    
    print(f"\nWord count: {manuscript.word_count}")
    print("\nManuscript generation successful!")
    
except Exception as e:
    print(f"Error generating manuscript: {str(e)}")
    import traceback
    traceback.print_exc()
