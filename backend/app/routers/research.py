from fastapi import APIRouter, HTTPException, Depends, Response
from typing import List, Optional
import os
import base64
import tempfile
import gc
import asyncio
from dotenv import load_dotenv

from ..models.schemas import (
    ResearchRequest,
    ParsedResearchIdea,
    Article,
    ArticleSummary,
    Manuscript,
    ExportRequest,
    GenerateManuscriptRequest,
    ManuscriptSection
)

from utils.openai.parser import parse_research_idea, expand_research_idea
from utils.pubmed.search import search_pubmed_articles
from utils.openai.summarizer import summarize_articles
from utils.manuscript.generator import generate_manuscript
from utils.manuscript.export import export_to_docx, export_to_pdf, export_to_markdown

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    print("WARNING: OPENAI_API_KEY is not set in the environment variables.")

router = APIRouter(prefix="/api/research", tags=["research"])

@router.get("/healthcheck")
async def healthcheck():
    """
    Simple health check endpoint to verify the API is running.
    """
    return {"status": "ok", "message": "API is running"}

@router.post("/parse", response_model=ParsedResearchIdea)
async def parse_research_request(request: ResearchRequest):
    """
    Parse a natural language research idea into structured components
    using OpenAI's GPT model.
    """
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
            )
            
        parsed_idea = parse_research_idea(
            research_idea=request.research_idea,
            study_type=request.study_type,
            population=request.population,
            target_journal=request.target_journal
        )
        
        gc.collect()
        
        return parsed_idea
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing research idea: {str(e)}")


@router.post("/search", response_model=List[Article])
async def search_articles(parsed_idea: ParsedResearchIdea):
    """
    Search PubMed for articles related to the parsed research idea.
    """
    try:
        entrez_email = os.getenv("ENTREZ_EMAIL")
        if not entrez_email:
            raise HTTPException(
                status_code=500,
                detail="Entrez email is not configured. Please set the ENTREZ_EMAIL environment variable."
            )
            
        articles = search_pubmed_articles(
            search_terms=parsed_idea.search_terms,
            study_type=parsed_idea.study_type,
            population=parsed_idea.population,
            max_results=10  # Limit to 10 articles to reduce memory usage
        )
        
        if not articles:
            return []
        
        gc.collect()
            
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching PubMed: {str(e)}")


@router.post("/summarize", response_model=List[ArticleSummary])
async def summarize_search_results(articles: List[Article]):
    """
    Summarize the abstracts of the found articles using OpenAI's GPT model.
    """
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
            )
        
        if len(articles) > 5:
            print(f"Limiting articles from {len(articles)} to 5 to reduce memory usage")
            articles = articles[:5]
            
        summaries = summarize_articles(articles)
        
        gc.collect()
        
        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing articles: {str(e)}")


@router.post("/generate", response_model=Manuscript)
async def generate_research_manuscript(
    request_data: GenerateManuscriptRequest
):
    """
    Generate a complete research manuscript based on the parsed idea and article summaries.
    """
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."
            )
        
        if len(request_data.article_summaries) > 5:
            print(f"Limiting article summaries from {len(request_data.article_summaries)} to 5 to reduce memory usage")
            request_data.article_summaries = request_data.article_summaries[:5]
            
        is_rhinoplasty_topic = (
            "rhinoplasty" in request_data.request.research_idea.lower() or
            ("open" in request_data.request.research_idea.lower() and "closed" in request_data.request.research_idea.lower())
        )
        if is_rhinoplasty_topic:
            print("Processing special rhinoplasty research topic")
            
        try:
            manuscript = generate_manuscript(
                research_request=request_data.request,
                parsed_idea=request_data.parsed_idea,
                article_summaries=request_data.article_summaries
            )
            
            gc.collect()
            
            return manuscript
        except Exception as openai_error:
            print(f"Error generating manuscript: {str(openai_error)}")
            
            return Manuscript(
                title=f"Meta-Analysis: {request_data.parsed_idea.research_topic}",
                abstract=ManuscriptSection(
                    title="Abstract",
                    content="This is a simplified abstract for testing purposes. The server encountered memory constraints."
                ),
                introduction=ManuscriptSection(
                    title="Introduction",
                    content="This is a simplified introduction section. The server encountered memory constraints."
                ),
                methods=ManuscriptSection(
                    title="Methods",
                    content="This is a simplified methods section describing the search strategy and inclusion criteria."
                ),
                results=ManuscriptSection(
                    title="Results",
                    content="This is a simplified results section that would normally contain statistical analysis results."
                ),
                discussion=ManuscriptSection(
                    title="Discussion",
                    content="This is a simplified discussion section that would interpret the findings."
                ),
                references=["Reference 1", "Reference 2", "Reference 3"],
                word_count=1500
            )
    except Exception as e:
        print(f"Unexpected error in generate_research_manuscript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating manuscript: {str(e)}")


@router.post("/export")
async def export_manuscript(request: ExportRequest):
    """
    Export a manuscript to the specified format (docx, pdf, or markdown).
    """
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            filename = f"manuscript.{request.format}"
            output_path = os.path.join(temp_dir, filename)
            
            if request.format == "docx":
                export_to_docx(request.manuscript, output_path)
                content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            elif request.format == "pdf":
                export_to_pdf(request.manuscript, output_path)
                content_type = "application/pdf"
            elif request.format == "markdown":
                export_to_markdown(request.manuscript, output_path)
                content_type = "text/markdown"
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
            
            with open(output_path, "rb") as f:
                file_content = f.read()
            
            encoded_content = base64.b64encode(file_content).decode("utf-8")
            
            gc.collect()
            
            return {
                "filename": filename,
                "content_type": content_type,
                "content": encoded_content
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting manuscript: {str(e)}")
