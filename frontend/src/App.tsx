import { useState } from 'react';
import { ResearchForm, ResearchFormData } from './components/ResearchForm';
import { ManuscriptPreview } from './components/ManuscriptPreview';
import { AIInteraction } from './components/AIInteraction';
import { exportManuscript } from './lib/api';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useManuscriptGeneration } from './hooks/useManuscriptGeneration';

function App() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const {
    isLoading,
    manuscript,
    currentStep,
    generateFromResearchIdea,
    interactWithAI
  } = useManuscriptGeneration();

  const handleSubmit = async (formData: ResearchFormData) => {
    try {
      await generateFromResearchIdea(formData);
    } catch (error) {
      console.error('Error generating manuscript:', error);
      toast({
        title: 'Error generating manuscript',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
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
              <>
                <ManuscriptPreview 
                  manuscript={manuscript} 
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
                {manuscript && (
                  <AIInteraction
                    manuscript={manuscript}
                    onManuscriptUpdate={() => {
                    }}
                    originalFormData={undefined}
                    isLoading={isDownloading}
                    onInteract={async (command) => {
                      try {
                        setIsDownloading(true);
                        await interactWithAI(command);
                      } catch (error) {
                        console.error('Error in AI interaction:', error);
                        toast({
                          title: 'Error updating manuscript',
                          description: error instanceof Error ? error.message : 'An unknown error occurred',
                          variant: 'destructive',
                        });
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
