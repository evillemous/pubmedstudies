import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { Manuscript } from './ManuscriptPreview';
import { ResearchFormData } from './ResearchForm';
import { useToast } from '@/components/ui/use-toast';

interface AIInteractionProps {
  manuscript: Manuscript;
  onManuscriptUpdate: (updatedManuscript: Manuscript) => void;
  originalFormData?: ResearchFormData;
  isLoading: boolean;
  onInteract: (command: string) => Promise<void>;
}

export function AIInteraction({ 
  manuscript, 
  onManuscriptUpdate, 
  originalFormData, 
  isLoading,
  onInteract
}: AIInteractionProps) {
  const [command, setCommand] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim()) {
      toast({
        title: 'Command required',
        description: 'Please enter a command to interact with the AI.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await onInteract(command);
      setCommand('');
    } catch (error) {
      console.error('Error in AI interaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your command. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Manuscript Assistant
        </CardTitle>
        <CardDescription>
          Ask the AI to modify or enhance your manuscript. For example, "add more information about radiation treatments" or "expand the discussion section".
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Enter your command here..."
            className="min-h-24 resize-none"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading || !command.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Send Command'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
