import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileDown, FileText, File } from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ErrorBar,
  ScatterChart,
  Scatter
} from 'recharts';
import { AIInteraction } from './AIInteraction';
import type { ResearchFormData } from './ResearchForm';

interface ManuscriptSection {
  title: string;
  content: string;
}

interface Figure {
  id: string;
  title: string;
  caption: string;
  type: 'chart' | 'image' | 'table';
  data: any; // For charts: chart data, for images: base64 string, for tables: table data
}

export interface Manuscript {
  title: string;
  abstract: ManuscriptSection;
  introduction: ManuscriptSection;
  methods: ManuscriptSection;
  results: ManuscriptSection;
  discussion: ManuscriptSection;
  references: string[];
  word_count: number;
  figures?: Figure[];
  tables?: {
    id: string;
    title: string;
    caption: string;
    headers: string[];
    rows: string[][];
  }[];
}

interface ManuscriptPreviewProps {
  manuscript: Manuscript | null;
  onDownload: (format: 'docx' | 'pdf' | 'markdown') => void;
  isDownloading: boolean;
  onAIInteract?: (command: string) => Promise<void>;
  isAIInteracting?: boolean;
  originalFormData?: ResearchFormData | null;
}

export function ManuscriptPreview({ 
  manuscript, 
  onDownload, 
  isDownloading,
  onAIInteract,
  isAIInteracting = false,
  originalFormData
}: ManuscriptPreviewProps) {
  const [activeTab, setActiveTab] = useState('abstract');
  const manuscriptRef = useRef<HTMLDivElement>(null);
  
  const renderChart = (figure: any) => {
    if (!figure || !figure.data) return null;
    
    const { data } = figure;
    
    switch (data.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.keys.map((key: string) => (
                <Bar key={key} dataKey={key} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={data.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.keys.map((key: string) => (
                <Line key={key} type="monotone" dataKey={key} stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.series}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label
              >
                {data.series.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
        
      case 'forest':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart
              layout="vertical"
              data={data.studies}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[
                  Math.min(...data.studies.map((s: any) => s.ci_lower || 0)) * 0.8,
                  Math.max(...data.studies.map((s: any) => s.ci_upper || 2)) * 1.2
                ]} 
              />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(_, __, props: any) => {
                const study = props.payload;
                return [`${study.effect.toFixed(2)} (${study.ci_lower.toFixed(2)}-${study.ci_upper.toFixed(2)})`, 'Effect Size'];
              }} />
              <Legend />
              <Bar 
                dataKey="effect" 
                fill="#8884d8"
                shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return (
                    <g>
                      <line 
                        x1={x - width/2} 
                        x2={x + width/2} 
                        y1={y + height/2} 
                        y2={y + height/2} 
                        stroke="#000" 
                        strokeWidth={2} 
                      />
                      <rect 
                        x={x - 4} 
                        y={y} 
                        width={8} 
                        height={height} 
                        fill="#8884d8" 
                      />
                    </g>
                  );
                }}
              >
                {data.studies.map((study: any, index: number) => (
                  <ErrorBar 
                    key={`error-${index}`}
                    dataKey="effect" 
                    width={4} 
                    strokeWidth={2}
                    stroke="#000" 
                    direction="x"
                    data={[{
                      x: study.effect,
                      error: [study.effect - study.ci_lower, study.ci_upper - study.effect]
                    }]}
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        );
        
      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="effect" 
                name="Effect Size" 
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <YAxis 
                type="number" 
                dataKey="se" 
                name="Standard Error" 
                domain={[0, 'dataMax + 0.2']}
                reversed 
              />
              <Tooltip 
                formatter={(value: any, name: any) => {
                  if (name === 'Standard Error') return [value.toFixed(2), name];
                  return [value.toFixed(2), 'Effect Size'];
                }}
                labelFormatter={() => 'Study'}
              />
              <Scatter 
                name="Studies" 
                data={data.studies} 
                fill="#8884d8"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="flex justify-center items-center h-64 bg-gray-100 rounded">
            <p className="text-gray-500">Chart preview not available</p>
          </div>
        );
    }
  };
  
  const handleCitationClick = (refNumber: string) => {
    setActiveTab('references');
    
    setTimeout(() => {
      const refElement = document.getElementById(`reference-${refNumber}`);
      if (refElement) {
        refElement.scrollIntoView({ behavior: 'smooth' });
        refElement.classList.add('highlight-reference');
        
        setTimeout(() => {
          refElement.classList.remove('highlight-reference');
        }, 2000);
      }
    }, 100);
  };
  
  useEffect(() => {
    const handleCitationClickEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.refNumber) {
        handleCitationClick(customEvent.detail.refNumber);
      }
    };
    
    const currentRef = manuscriptRef.current;
    if (currentRef) {
      currentRef.addEventListener('citationClick', handleCitationClickEvent);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('citationClick', handleCitationClickEvent);
      }
    };
  }, []);

  if (!manuscript) {
    return (
      <Card className="w-full h-full flex items-center justify-center min-h-96">
        <CardContent className="text-center p-6">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Enter your research idea and click "Generate Manuscript" to see the preview here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <style>
        {`
          sup.citation {
            font-size: 0.75em;
            vertical-align: super;
            line-height: 0;
            position: relative;
            color: #0066cc;
            cursor: pointer;
            font-weight: bold;
            padding: 0 1px;
          }
          sup.citation:hover {
            text-decoration: underline;
          }
          .reference-item {
            transition: background-color 0.3s ease;
          }
          .highlight-reference {
            background-color: rgba(255, 255, 0, 0.3);
            padding: 2px 4px;
            border-radius: 2px;
          }
          .manuscript-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          .manuscript-table th, .manuscript-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .manuscript-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .manuscript-table caption {
            caption-side: bottom;
            font-style: italic;
            margin-top: 0.5rem;
            text-align: left;
          }
          .figure-container {
            margin: 1.5rem 0;
            text-align: center;
          }
          .figure-caption {
            font-style: italic;
            margin-top: 0.5rem;
            text-align: center;
          }
          .figure-title {
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
        `}
      </style>
      <Card className="w-full manuscript-preview-container" ref={manuscriptRef}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{manuscript.title}</CardTitle>
              <CardDescription>
                Word Count: {manuscript.word_count} words
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownload('markdown')}
                disabled={isDownloading || isAIInteracting}
              >
                <FileText className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownload('docx')}
                disabled={isDownloading || isAIInteracting}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Word
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownload('pdf')}
                disabled={isDownloading || isAIInteracting}
              >
                <File className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-4">
              <TabsTrigger value="abstract">Abstract</TabsTrigger>
              <TabsTrigger value="introduction">Introduction</TabsTrigger>
              <TabsTrigger value="methods">Methods</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="figures">Figures</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>
            
            <TabsContent value="abstract" className="mt-0">
              <ManuscriptSectionContent 
                title={manuscript.abstract.title} 
                content={manuscript.abstract.content} 
              />
            </TabsContent>
            
            <TabsContent value="introduction" className="mt-0">
              <ManuscriptSectionContent 
                title={manuscript.introduction.title} 
                content={manuscript.introduction.content} 
              />
            </TabsContent>
            
            <TabsContent value="methods" className="mt-0">
              <ManuscriptSectionContent 
                title={manuscript.methods.title} 
                content={manuscript.methods.content} 
              />
            </TabsContent>
            
            <TabsContent value="results" className="mt-0">
              <ManuscriptSectionContent 
                title={manuscript.results.title} 
                content={manuscript.results.content} 
              />
              {manuscript.tables && manuscript.tables.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Tables</h3>
                  {manuscript.tables.map((table, index) => (
                    <div key={table.id || index} className="mb-6">
                      <table className="manuscript-table">
                        <caption>{table.caption}</caption>
                        <thead>
                          <tr>
                            {table.headers.map((header, i) => (
                              <th key={i}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-sm text-center mt-1">Table {index + 1}: {table.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="discussion" className="mt-0">
              <ManuscriptSectionContent 
                title={manuscript.discussion.title} 
                content={manuscript.discussion.content} 
              />
            </TabsContent>
            
            <TabsContent value="figures" className="mt-0">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Figures and Charts</h2>
                {manuscript.figures && manuscript.figures.length > 0 ? (
                  manuscript.figures.map((figure, index) => (
                    <div key={figure.id || index} className="figure-container">
                      <p className="figure-title">Figure {index + 1}: {figure.title}</p>
                      {figure.type === 'image' && (
                        <img 
                          src={typeof figure.data === 'string' ? figure.data : ''}
                          alt={figure.title}
                          className="mx-auto max-w-full"
                        />
                      )}
                      {figure.type === 'chart' && (
                        <div className="flex justify-center items-center w-full">
                          {renderChart(figure)}
                        </div>
                      )}
                      <p className="figure-caption">{figure.caption}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded">
                    <p className="text-gray-500">No figures available for this manuscript.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="references" className="mt-0">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">References</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  {manuscript.references.map((reference, index) => (
                    <li 
                      key={index} 
                      id={`reference-${index + 1}`} 
                      className="text-sm reference-item"
                    >
                      {reference}
                    </li>
                  ))}
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {onAIInteract && (
        <AIInteraction
          manuscript={manuscript}
          onManuscriptUpdate={() => {}}
          originalFormData={originalFormData || undefined}
          isLoading={isAIInteracting}
          onInteract={onAIInteract}
        />
      )}
    </>
  );
}

function ManuscriptSectionContent({ 
  title, 
  content 
}: { 
  title: string; 
  content: string;
}) {
  const formatContentWithCitations = (text: string) => {
    return text.replace(/(\[\d+\]|\(\d+\)|[¹²³⁴⁵⁶⁷⁸⁹⁰]+)/g, (match) => {
      const num = match.replace(/[\[\]\(\)¹²³⁴⁵⁶⁷⁸⁹⁰]/g, (char) => {
        const superscriptMap: Record<string, string> = {
          '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5',
          '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁰': '0'
        };
        return superscriptMap[char] || char;
      }).replace(/[\[\]\(\)]/g, ''); // Remove brackets or parentheses
      
      return `<sup class="citation" data-ref="${num}">${num}</sup>`;
    });
  };

  const handleCitationClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('citation')) {
      const refNumber = target.getAttribute('data-ref');
      if (refNumber) {
        const manuscriptPreview = document.querySelector('.manuscript-preview-container');
        if (manuscriptPreview && manuscriptPreview.dispatchEvent) {
          manuscriptPreview.dispatchEvent(
            new CustomEvent('citationClick', { detail: { refNumber } })
          );
        }
      }
    }
  };

  const processContent = (content: string) => {
    const withCitations = formatContentWithCitations(content);
    
    return withCitations;
  };

  return (
    <div className="prose max-w-none" onClick={handleCitationClick}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="whitespace-pre-line">
        {content.split('\n\n').map((paragraph, index) => (
          <p 
            key={index} 
            className="mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(paragraph) 
            }}
          />
        ))}
      </div>
    </div>
  );
}
