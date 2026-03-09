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


def build_prompt(resume_text: str, job_description: str) -> str:
    return USER_PROMPT_TEMPLATE.format(
        resume_text=resume_text,
        job_description=job_description,
    )
