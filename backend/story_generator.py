import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatOpenAI(model_name="gpt-4", temperature=0.7)

def generate_storyboard(prompt: str, num_panels: int = 3):
    template = ChatPromptTemplate.from_template("""
    Generate a storyboard in {num_panels} panels based on this idea: "{prompt}".
    For each panel, include:
    - Panel number
    - Scene description
    - Characters involved
    - Dialogue
    Respond as a JSON array.
    """)
    
    full_prompt = template.format_messages(prompt=prompt, num_panels=num_panels)
    response = llm(full_prompt)
    return response.content
