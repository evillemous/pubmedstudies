import { useState } from 'react';
import { ResearchForm, ResearchFormData } from '@/components/ResearchForm';
import { ManuscriptPreview, Manuscript } from '@/components/ManuscriptPreview';
import { parseResearchIdea, searchArticles, summarizeArticles, generateManuscript, exportManuscript } from '@/lib/api';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: ResearchFormData) => {
    try {
      setIsLoading(true);
      setManuscript(null);
      
      setCurrentStep('Parsing research idea...');
      const parsedIdea = await parseResearchIdea(formData);
      
      setCurrentStep('Searching for relevant articles...');
      const articles = await searchArticles(parsedIdea);
      
      if (articles.length === 0) {
        toast({
          title: 'No articles found',
          description: 'No relevant articles were found for your research idea. Please try a different query.',
          variant: 'destructive',
        });
        setIsLoading(false);
        setCurrentStep(null);
        return;
      }
      
      setCurrentStep('Analyzing and summarizing articles...');
      const summaries = await summarizeArticles(articles);
      
      setCurrentStep('Generating manuscript...');
      const request = {
        research_idea: formData.researchIdea,
        study_type: formData.studyType || undefined,
        population: formData.population || undefined,
        date_range: formData.startYear && formData.endYear 
          ? [parseInt(formData.startYear), parseInt(formData.endYear)] 
          : undefined,
        outcomes: formData.outcomes ? formData.outcomes.split(',').map(o => o.trim()) : undefined,
        target_journal: formData.targetJournal || undefined,
      };
      
      const generatedManuscript = await generateManuscript({
        request: request,
        parsed_idea: parsedIdea,
        article_summaries: summaries
      });
      setManuscript(generatedManuscript);
      
      toast({
        title: 'Manuscript generated successfully',
        description: 'Your research manuscript has been generated and is ready for review.',
      });
    } catch (error) {
      console.error('Error generating manuscript:', error);
      toast({
        title: 'Error generating manuscript',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const downloadFileFromBase64 = (base64Content: string, filename: string, contentType: string) => {
    const byteCharacters = atob(base64Content);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleDownload = async (format: 'docx' | 'pdf' | 'markdown') => {
    if (!manuscript) return;
    
    try {
      setIsDownloading(true);
      
      const result = await exportManuscript(manuscript, format);
      
      downloadFileFromBase64(
        result.content,
        result.filename,
        result.content_type
      );
      
      toast({
        title: 'Download successful',
        description: `Your manuscript has been downloaded in ${format.toUpperCase()} format.`,
      });
    } catch (error) {
      console.error('Error downloading manuscript:', error);
      toast({
        title: 'Error downloading manuscript',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Medical Research Manuscript Generator
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
            <ResearchForm onSubmit={handleSubmit} isLoading={isLoading} />
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">{currentStep}</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few minutes depending on the complexity of your research idea.
                </p>
              </div>
            )}
            
            {!isLoading && (
              <ManuscriptPreview 
                manuscript={manuscript} 
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
            )}
          </div>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
