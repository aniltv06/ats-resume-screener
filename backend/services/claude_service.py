import json
import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = (
    "You are an expert ATS resume screener. Analyze the provided resume against the "
    "job description and return a JSON object only (no markdown, no code fences)."
)

USER_PROMPT_TEMPLATE = """RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return this exact JSON structure:
{{
  "ats_score": <0-100 integer>,
  "matched_keywords": ["keyword1", ...],
  "missing_keywords": ["keyword1", ...],
  "skill_gaps": ["gap description", ...],
  "suggestions": ["actionable improvement", ...],
  "summary": "1-2 sentence overall assessment"
}}"""


def analyze_resume(resume_text: str, job_description: str) -> dict:
    prompt = USER_PROMPT_TEMPLATE.format(
        resume_text=resume_text,
        job_description=job_description,
    )
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    # Strip accidental markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)
