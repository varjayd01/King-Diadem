# core/llm_genai.py

from google import genai

client = genai.Client(api_key="YOUR_API_KEY")

def ask_ai(prompt):
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    return response.text
