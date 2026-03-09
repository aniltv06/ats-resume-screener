import json
import os
from openai import OpenAI

from services.shared_prompt import SYSTEM_PROMPT, build_prompt


def analyze_resume(resume_text: str, job_description: str) -> dict:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured on this server")
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(resume_text, job_description)},
        ],
    )
    return json.loads(response.choices[0].message.content)
