import json
import os
import urllib.error
import urllib.request
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().with_name(".env"), override=True)


GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def review_cleanup_images(before_image: str, after_image: str, description: str = "", landmark: str = "") -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {
            "status": "unavailable",
            "confidence": 0.0,
            "summary": "AI review is not configured on the backend yet.",
        }

    model = os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
    prompt = (
        "Compare the two waste-spot photos. "
        "The first is the before image and the second is the after-cleanup image. "
        "Decide if the after image shows a real cleanup of the same location. "
        "Return a valid JSON object with keys status, confidence, and summary only. "
        "Use status=approved if the same place is shown and the waste is clearly reduced or removed. "
        "Use status=rejected if the images do not match, the cleanup is not credible, or the waste is not improved. "
        "Use a confidence between 0 and 1. "
        f"Context description: {description or 'None'}. "
        f"Landmark: {landmark or 'None'}."
    )

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": before_image,
                            "detail": "high",
                        },
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": after_image,
                            "detail": "high",
                        },
                    },
                ],
            }
        ],
        "response_format": {
            "type": "json_object",
        },
    }

    request = urllib.request.Request(
        GROQ_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return {
            "status": "unavailable",
            "confidence": 0.0,
            "summary": f"AI review is temporarily unavailable ({exc.code}). Please try again.",
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "confidence": 0.0,
            "summary": "AI review is temporarily unavailable. Please try again.",
        }

    output_text = ""
    choices = raw.get("choices") or []
    if choices:
        message = choices[0].get("message") or {}
        content = message.get("content")
        if isinstance(content, str):
            output_text = content.strip()
        elif isinstance(content, list):
            text_parts = []
            for item in content:
                if item.get("type") == "text" and item.get("text"):
                    text_parts.append(item["text"])
            output_text = "".join(text_parts).strip()

    try:
        parsed = json.loads(output_text or "{}")
    except json.JSONDecodeError:
        parsed = {}

    status = parsed.get("status", "unavailable")
    if status not in {"approved", "rejected"}:
        status = "unavailable"

    try:
        confidence = float(parsed.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0

    summary = str(parsed.get("summary") or "AI verification did not return a usable result.").strip()
    return {
        "status": status,
        "confidence": max(0.0, min(confidence, 1.0)),
        "summary": summary,
    }
