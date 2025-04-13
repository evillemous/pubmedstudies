import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, FileText, File } from 'lucide-react';

interface ManuscriptSection {
  title: string;
  content: string;
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
}

interface ManuscriptPreviewProps {
  manuscript: Manuscript | null;
  onDownload: (format: 'docx' | 'pdf' | 'markdown') => void;
  isDownloading: boolean;
}

export function ManuscriptPreview({ manuscript, onDownload, isDownloading }: ManuscriptPreviewProps) {
  const [activeTab, setActiveTab] = useState('abstract');

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
    <Card className="w-full">
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
              disabled={isDownloading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Markdown
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDownload('docx')}
              disabled={isDownloading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Word
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDownload('pdf')}
              disabled={isDownloading}
            >
              <File className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="abstract">Abstract</TabsTrigger>
            <TabsTrigger value="introduction">Introduction</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
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
          </TabsContent>
          
          <TabsContent value="discussion" className="mt-0">
            <ManuscriptSectionContent 
              title={manuscript.discussion.title} 
              content={manuscript.discussion.content} 
            />
          </TabsContent>
          
          <TabsContent value="references" className="mt-0">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">References</h2>
              <ol className="list-decimal pl-5 space-y-2">
                {manuscript.references.map((reference, index) => (
                  <li key={index} className="text-sm">{reference}</li>
                ))}
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ManuscriptSectionContent({ title, content }: { title: string; content: string }) {
  return (
    <div className="prose max-w-none">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="whitespace-pre-line">
        {content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
