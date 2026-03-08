from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.claude_service import analyze_resume

router = APIRouter()


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required")
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")
    try:
        result = analyze_resume(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
