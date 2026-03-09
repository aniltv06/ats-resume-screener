import json
import os
import google.generativeai as genai

from services.shared_prompt import SYSTEM_PROMPT, build_prompt


def analyze_resume(resume_text: str, job_description: str) -> dict:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not configured on this server")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config={"response_mime_type": "application/json"},
        system_instruction=SYSTEM_PROMPT,
    )
    response = model.generate_content(build_prompt(resume_text, job_description))
    return json.loads(response.text)
