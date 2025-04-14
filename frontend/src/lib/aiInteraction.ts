import { Manuscript } from '@/components/ManuscriptPreview';
import { ResearchFormData } from '@/components/ResearchForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AIInteractionRequest {
  manuscript: Manuscript;
  user_command: string;
  research_context?: {
    research_idea: string;
    study_type?: string;
    population?: string;
    target_journal?: string;
  };
}

interface AIInteractionResponse {
  updated_manuscript: Manuscript;
  explanation: string;
  success: boolean;
}

export async function interactWithManuscript(
  manuscript: Manuscript,
  userCommand: string,
  originalFormData?: ResearchFormData
): Promise<AIInteractionResponse> {
  try {
    if (!API_URL || API_URL === 'undefined') {
      console.error('API_URL is not configured properly');
      throw new Error('Backend API URL is not configured properly');
    }
    
    console.log(`Sending AI interaction request to ${API_URL}/api/research/ai-interaction`);
    
    const requestBody: AIInteractionRequest = {
      manuscript,
      user_command: userCommand,
    };
    
    if (originalFormData) {
      requestBody.research_context = {
        research_idea: originalFormData.researchIdea,
        study_type: originalFormData.studyType || undefined,
        population: originalFormData.population || undefined,
        target_journal: originalFormData.targetJournal || undefined,
      };
    }
    
    try {
      console.log('Making first attempt to interact with AI');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${API_URL}/api/research/ai-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to interact with AI');
        } catch (parseError) {
          const errorText = await response.text().catch(() => 'Failed to interact with AI');
          throw new Error(errorText || 'Failed to interact with AI');
        }
      }
      
      return await response.json();
    } catch (firstAttemptError) {
      console.warn('First attempt failed, retrying AI interaction:', firstAttemptError);
      
      console.log('Making second attempt to interact with AI');
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), 60000); // 60 second timeout for retry
      
      const response = await fetch(`${API_URL}/api/research/ai-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: retryController.signal,
      });
      
      clearTimeout(retryTimeoutId);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to interact with AI');
        } catch (parseError) {
          const errorText = await response.text().catch(() => 'Failed to interact with AI');
          throw new Error(errorText || 'Failed to interact with AI');
        }
      }
      
      return await response.json();
    }
  } catch (error: any) {
    console.error('Error in AI interaction after retry:', error);
    
    return {
      updated_manuscript: manuscript,
      explanation: `We encountered an issue processing your request: ${error?.message || 'Unknown error'}. The manuscript remains unchanged. Please try again with a simpler command or check your connection.`,
      success: false
    };
  }
}
