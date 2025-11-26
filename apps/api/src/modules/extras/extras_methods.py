import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException
from opengraph import OpenGraph


def fetch_url_metadata(url: str) -> dict:
    """Fetch metadata from a URL using OpenGraph or fallback to HTML parsing."""
    try:
        # Try OpenGraph first
        og = OpenGraph(url=url)
        if og.title or og.description or og.image:
            return {
                "title": og.title,
                "description": og.description,
                "image_url": og.image,
            }
    except Exception:
        pass  # Fall back to HTML parsing

    # Fallback to HTML parsing
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        title = soup.find("title")
        title = title.get_text().strip() if title else None

        description = None
        desc_tag = soup.find("meta", attrs={"name": "description"}) or soup.find(
            "meta", attrs={"property": "og:description"}
        )
        if desc_tag and desc_tag.get("content"):
            description = str(desc_tag["content"]).strip()

        image_url = None
        img_tag = soup.find("meta", attrs={"property": "og:image"})
        if img_tag and img_tag.get("content"):
            image_url = str(img_tag["content"]).strip()

        return {"title": title, "description": description, "image_url": image_url}
    except requests.RequestException:
        raise HTTPException(
            status_code=400, detail="Unable to fetch metadata from the URL"
        )
