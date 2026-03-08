import httpx
from bs4 import BeautifulSoup


async def scrape_job_description(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove script / style noise
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()

    # Try common job-posting containers first
    for selector in [
        "div[class*='job-description']",
        "div[class*='description']",
        "div[class*='posting']",
        "section[class*='job']",
        "article",
        "main",
    ]:
        container = soup.select_one(selector)
        if container:
            text = container.get_text(separator="\n", strip=True)
            if len(text) > 200:
                return text

    # Fallback: full body text
    return soup.get_text(separator="\n", strip=True)
