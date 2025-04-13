import sys
import os
from dotenv import load_dotenv
load_dotenv()

sys.path.append('.')
from utils.openai.client import OpenAIClient
from utils.manuscript.generator import generate_comprehensive_manuscript

# Define the research request
research_request = {
    'research_idea': 'Performance a meta analysis comparing different types of pharyngeal reconstruction following total laryngectomy specifically comparing regional flops versus free tissue transfer looking at functional outcomes including speech and swallow speech endpoints should be defined as ChatGPT defines it swallow endpoints should also be determined by ChatGPT you are here now be comprehensive and thorough and remember the study should also stratify based on history of radiation treatment and whether this is a salvage surgery or not',
    'study_type': 'Meta-analysis',
    'population': None,
    'date_range': None,
    'outcomes': None,
    'target_journal': None
}

# Generate the manuscript
try:
    client = OpenAIClient()
    manuscript = generate_comprehensive_manuscript(
        client=client,
        research_request=research_request,
        include_visualizations=True,
        stratify_by=['radiation_history', 'salvage_surgery']
    )
    
    # Print manuscript title and sections
    print(f'Title: {manuscript["title"]}')
    print('\n=== ABSTRACT ===')
    print(manuscript['abstract']['content'])
    print('\n=== INTRODUCTION ===')
    print(manuscript['introduction']['content'][:500] + '...')
    print('\n=== METHODS ===')
    print(manuscript['methods']['content'][:500] + '...')
    print('\n=== RESULTS ===')
    print(manuscript['results']['content'][:500] + '...')
    print('\n=== DISCUSSION ===')
    print(manuscript['discussion']['content'][:500] + '...')
    print(f'\n=== REFERENCES ({len(manuscript["references"])}) ===')
    for i, ref in enumerate(manuscript['references'][:5]):
        print(f'{i+1}. {ref}')
    print('...')
    
    if 'tables' in manuscript and manuscript['tables']:
        print(f'\n=== TABLES ({len(manuscript["tables"])}) ===')
        for table in manuscript['tables']:
            print(f'Table: {table["title"]}')
    
    if 'figures' in manuscript and manuscript['figures']:
        print(f'\n=== FIGURES ({len(manuscript["figures"])}) ===')
        for figure in manuscript['figures']:
            print(f'Figure: {figure["title"]}')
            
    print('\nManuscript generation successful!')
except Exception as e:
    print(f'Error generating manuscript: {str(e)}')
