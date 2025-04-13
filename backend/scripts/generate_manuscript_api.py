import requests
import json
import time
import sys

# Backend API URL
API_URL = "https://app-doufonzs.fly.dev"

def generate_manuscript():
    print("Sending request to backend API...")
    
    # Prepare the research request
    research_request = {
        "research_idea": "Performance a meta analysis comparing different types of pharyngeal reconstruction following total laryngectomy specifically comparing regional flaps versus free tissue transfer looking at functional outcomes including speech and swallow speech endpoints should be defined as ChatGPT defines it swallow endpoints should also be determined by ChatGPT you are here now be comprehensive and thorough and remember the study should also stratify based on history of radiation treatment and whether this is a salvage surgery or not",
        "study_type": "meta-analysis",
        "population": "adults",
        "target_journal": "JAMA Otolaryngology"
    }
    
    try:
        # Step 1: Parse the research idea
        print("Step 1: Parsing research idea...")
        parse_response = requests.post(
            f"{API_URL}/api/research/parse",
            json=research_request,
            timeout=120
        )
        
        if not parse_response.ok:
            print(f"Error parsing research idea: {parse_response.status_code}")
            print(parse_response.text)
            return None
        
        parsed_idea = parse_response.json()
        print("Research idea parsed successfully.")
        
        # Step 2: Search for articles
        print("Step 2: Searching for articles...")
        search_response = requests.post(
            f"{API_URL}/api/research/search",
            json=parsed_idea,
            timeout=180
        )
        
        if not search_response.ok:
            print(f"Error searching for articles: {search_response.status_code}")
            print(search_response.text)
            return None
        
        articles = search_response.json()
        print(f"Found {len(articles)} articles.")
        
        # Step 3: Summarize articles
        print("Step 3: Summarizing articles...")
        summarize_response = requests.post(
            f"{API_URL}/api/research/summarize",
            json=articles,
            timeout=300
        )
        
        if not summarize_response.ok:
            print(f"Error summarizing articles: {summarize_response.status_code}")
            print(summarize_response.text)
            return None
        
        summaries = summarize_response.json()
        print(f"Summarized {len(summaries)} articles.")
        
        # Step 4: Generate manuscript
        print("Step 4: Generating manuscript...")
        generate_request = {
            "request": research_request,
            "parsed_idea": parsed_idea,
            "article_summaries": summaries
        }
        
        generate_response = requests.post(
            f"{API_URL}/api/research/generate",
            json=generate_request,
            timeout=600  # 10 minutes timeout for manuscript generation
        )
        
        if not generate_response.ok:
            print(f"Error generating manuscript: {generate_response.status_code}")
            print(generate_response.text)
            return None
        
        manuscript = generate_response.json()
        print("Manuscript generated successfully!")
        
        # Save the manuscript to a file
        with open("pharyngeal_reconstruction_manuscript.json", "w") as f:
            json.dump(manuscript, f, indent=2)
        
        print("Manuscript saved to pharyngeal_reconstruction_manuscript.json")
        
        # Print a summary of the manuscript
        print("\n=== MANUSCRIPT GENERATED SUCCESSFULLY ===")
        print(f"Title: {manuscript['title']}")
        print(f"Word count: {manuscript['word_count']}")
        print(f"References: {len(manuscript['references'])}")
        
        if 'tables' in manuscript and manuscript['tables']:
            print(f"Tables: {len(manuscript['tables'])}")
        
        if 'figures' in manuscript and manuscript['figures']:
            print(f"Figures: {len(manuscript['figures'])}")
        
        return manuscript
    
    except requests.exceptions.Timeout:
        print("Request timed out. The server took too long to respond.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        return None
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("Starting manuscript generation via API...")
    manuscript = generate_manuscript()
    
    if manuscript:
        print("Manuscript generation completed successfully.")
        sys.exit(0)
    else:
        print("Manuscript generation failed.")
        sys.exit(1)
