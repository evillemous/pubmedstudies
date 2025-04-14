import os
import sys
import json
from dotenv import load_dotenv
from openai import OpenAI

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
print(f"API Key (first 5 chars): {api_key[:5]}...")

client = OpenAI(api_key=api_key)

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, are you working?"}
        ],
        max_tokens=50
    )
    print("OpenAI API test successful!")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"Error testing OpenAI API: {str(e)}")

print("\nTesting manuscript generation for pharyngeal reconstruction...")
try:
    from utils.openai.client import OpenAIClient
    
    openai_client = OpenAIClient()
    
    prompt = """
    Generate a brief outline for a meta-analysis comparing different types of pharyngeal reconstruction 
    following total laryngectomy, specifically comparing regional flaps versus free tissue transfer 
    looking at functional outcomes including speech and swallow. The study should stratify based on 
    history of radiation treatment and whether this is a salvage surgery or not.
    """
    
    response = openai_client.chat_completion(
        messages=[
            {"role": "system", "content": "You are a medical research assistant."},
            {"role": "user", "content": prompt}
        ],
        model="gpt-4o" if os.getenv("USE_GPT4O", "False").lower() == "true" else "gpt-4",
        temperature=0.4,
        max_tokens=500
    )
    
    print("Manuscript generation test successful!")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"Error testing manuscript generation: {str(e)}")
