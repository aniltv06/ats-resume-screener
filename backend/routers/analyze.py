from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal

from services import claude_service, openai_service, gemini_service

router = APIRouter()

PROVIDERS = {
    "claude": claude_service.analyze_resume,
    "openai": openai_service.analyze_resume,
    "gemini": gemini_service.analyze_resume,
}


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    provider: Literal["claude", "openai", "gemini"] = "claude"


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required")
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")
    try:
        result = PROVIDERS[request.provider](request.resume_text, request.job_description)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
