from typing import List, Optional, Literal, Dict, Any
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


class TableData(BaseModel):
    """Schema for a table in a manuscript."""
    id: str = Field(..., description="Unique identifier for the table")
    title: str = Field(..., description="Title of the table")
    caption: str = Field(..., description="Caption or description of the table")
    headers: List[str] = Field(..., description="Column headers")
    rows: List[List[str]] = Field(..., description="Table data as rows of string values")

class FigureData(BaseModel):
    """Schema for a figure in a manuscript."""
    id: str = Field(..., description="Unique identifier for the figure")
    title: str = Field(..., description="Title of the figure")
    caption: str = Field(..., description="Caption or description of the figure")
    type: Literal["chart", "image", "diagram"] = Field(..., description="Type of figure")
    subtype: Optional[str] = Field(None, description="Subtype of figure (bar, line, etc.)")
    data: Dict[str, Any] = Field(..., description="Figure data (format depends on type)")

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
    figures: Optional[List[FigureData]] = None
    tables: Optional[List[TableData]] = None
    
class GenerateManuscriptRequest(BaseModel):
    """Request to generate a manuscript."""
    request: ResearchRequest
    parsed_idea: ParsedResearchIdea
    article_summaries: List[ArticleSummary]

class ExportRequest(BaseModel):
    """Request to export a manuscript."""
    manuscript: Manuscript
    format: Literal["docx", "pdf", "markdown"]

class AIInteractionRequest(BaseModel):
    """Request for AI interaction with a manuscript."""
    manuscript: Manuscript
    user_command: str = Field(..., description="Natural language command to modify or query the manuscript")
    research_context: Optional[ResearchRequest] = Field(None, description="Original research request for context")
    
class AIInteractionResponse(BaseModel):
    """Response from AI interaction with a manuscript."""
    updated_manuscript: Manuscript
    explanation: str = Field(..., description="Explanation of changes made to the manuscript")
    success: bool = Field(..., description="Whether the interaction was successful")
