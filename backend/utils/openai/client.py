import os
import openai
from typing import Dict, Any, Optional, Iterator
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    openai.api_key = api_key
else:
    print("WARNING: OPENAI_API_KEY is not set in the environment variables.")

class OpenAIClient:
    """
    A client for interacting with the OpenAI API with error handling and fallbacks.
    Memory-optimized for deployment environments.
    """
    
    def __init__(self):
        """Initialize the OpenAI client with API key validation."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.is_configured = bool(self.api_key)
        
        if not self.is_configured:
            print("WARNING: OpenAI API key is not configured. Some features will not work.")
    
    def validate_api_key(self) -> bool:
        """
        Validate that the API key is set and working.
        
        Returns:
            bool: True if the API key is valid, False otherwise
        """
        if not self.api_key:
            return False
            
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": "Hello"}
                ],
                max_tokens=5
            )
            return True
        except Exception as e:
            print(f"Error validating OpenAI API key: {str(e)}")
            return False
    
    def chat_completion(
        self,
        messages: list,
        model: str = "gpt-3.5-turbo",  # Use gpt-3.5-turbo by default to reduce memory usage
        temperature: float = 0.7,
        max_tokens: Optional[int] = 2000,  # Add default max_tokens to limit response size
        response_format: Optional[Dict[str, Any]] = None,
        stream: bool = False  # Add streaming option
    ) -> Dict[str, Any]:
        """
        Make a chat completion request to the OpenAI API with error handling.
        
        Args:
            messages: List of message objects
            model: Model to use for completion
            temperature: Sampling temperature
            max_tokens: Maximum number of tokens to generate
            response_format: Format for the response (e.g., {"type": "json_object"})
            
        Returns:
            Dict: The API response
            
        Raises:
            ValueError: If the API key is not configured
            Exception: If the API request fails
        """
        if not self.is_configured:
            raise ValueError("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.")
            
        try:
            params = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "stream": stream
            }
            
            if max_tokens:
                params["max_tokens"] = max_tokens
                
            if response_format:
                params["response_format"] = response_format
                
            response = openai.chat.completions.create(**params)
            
            return response
            
        except openai.APIError as e:
            print(f"OpenAI API error: {str(e)}")
            raise
            
        except openai.RateLimitError as e:
            print(f"OpenAI API rate limit exceeded: {str(e)}")
            raise
            
        except openai.APIConnectionError as e:
            print(f"OpenAI API connection error: {str(e)}")
            raise
            
        except Exception as e:
            print(f"Unexpected error with OpenAI API: {str(e)}")
            raise
            
    def stream_chat_completion(
        self,
        messages: list,
        model: str = "gpt-3.5-turbo",  # Use gpt-3.5-turbo by default to reduce memory usage
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None
    ) -> Iterator[Dict[str, Any]]:
        """
        Stream a chat completion request to the OpenAI API with error handling.
        This uses much less memory than the non-streaming version.
        
        Args:
            messages: List of message objects
            model: Model to use for completion
            temperature: Sampling temperature
            max_tokens: Maximum number of tokens to generate
            response_format: Format for the response (e.g., {"type": "json_object"})
            
        Returns:
            Iterator[Dict]: Stream of API response chunks
            
        Raises:
            ValueError: If the API key is not configured
            Exception: If the API request fails
        """
        if not self.is_configured:
            raise ValueError("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.")
            
        try:
            params = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "stream": True  # Enable streaming
            }
            
            if max_tokens:
                params["max_tokens"] = max_tokens
                
            if response_format:
                params["response_format"] = response_format
                
            return openai.chat.completions.create(**params)
            
        except openai.APIError as e:
            print(f"OpenAI API error: {str(e)}")
            raise
            
        except openai.RateLimitError as e:
            print(f"OpenAI API rate limit exceeded: {str(e)}")
            raise
            
        except openai.APIConnectionError as e:
            print(f"OpenAI API connection error: {str(e)}")
            raise
            
        except Exception as e:
            print(f"Unexpected error with OpenAI API: {str(e)}")
            raise
