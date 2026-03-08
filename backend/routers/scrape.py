from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from services.document_parser import extract_text
from services.web_scraper import scrape_job_description

router = APIRouter()


class ScrapeRequest(BaseModel):
    url: str


@router.post("/scrape-url")
async def scrape_url(request: ScrapeRequest):
    try:
        text = await scrape_job_description(request.url)
        return {"job_description": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape URL: {e}")


@router.post("/parse-file")
async def parse_file(file: UploadFile = File(...)):
    supported = {".pdf", ".docx"}
    ext = ""
    if file.filename:
        for s in supported:
            if file.filename.lower().endswith(s):
                ext = s
                break
    if not ext:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported",
        )
    try:
        file_bytes = await file.read()
        text = extract_text(file.filename, file_bytes)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {e}")
