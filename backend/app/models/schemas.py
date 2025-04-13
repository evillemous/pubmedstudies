from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    """Schema for research manuscript generation request."""
    research_idea: str = Field(..., description="Natural language research idea")
    study_type: Optional[str] = Field(None, description="Type of study (systematic review, meta-analysis, etc.)")
    population: Optional[str] = Field(None, description="Target population (adults, pediatrics, elderly)")
    date_range: Optional[tuple[int, int]] = Field(None, description="Date range for studies (start_year, end_year)")
    outcomes: Optional[List[str]] = Field(None, description="Outcomes of interest")
    target_journal: Optional[str] = Field(None, description="Target journal for formatting")


class ParsedResearchIdea(BaseModel):
    """Schema for parsed research idea."""
    research_topic: str
    population: Optional[str] = None
    study_type: Optional[str] = None
    target_journal: Optional[str] = None
    search_terms: List[str]


class Article(BaseModel):
    """Schema for a PubMed article."""
    pmid: str
    title: str
    authors: List[str]
    journal: str
    publication_date: str
    abstract: str
    url: str


class ArticleSummary(BaseModel):
    """Schema for summarized article."""
    pmid: str
    title: str
    key_findings: str
    relevance_score: float


class ManuscriptSection(BaseModel):
    """Schema for a section of the manuscript."""
    title: str
    content: str


class Manuscript(BaseModel):
    """Schema for the complete manuscript."""
    title: str
    abstract: ManuscriptSection
    introduction: ManuscriptSection
    methods: ManuscriptSection
    results: ManuscriptSection
    discussion: ManuscriptSection
    references: List[str]
    word_count: int
    
class GenerateManuscriptRequest(BaseModel):
    """Request to generate a manuscript."""
    request: ResearchRequest
    parsed_idea: ParsedResearchIdea
    article_summaries: List[ArticleSummary]

class ExportRequest(BaseModel):
    """Request to export a manuscript."""
    manuscript: Manuscript
    format: Literal["docx", "pdf", "markdown"]
