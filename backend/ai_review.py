import json
import os
import urllib.error
import urllib.request


OPENAI_API_URL = "https://api.openai.com/v1/responses"


def review_cleanup_images(before_image: str, after_image: str, description: str = "", landmark: str = "") -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "status": "unavailable",
            "confidence": 0.0,
            "summary": "AI verification is not configured. Add OPENAI_API_KEY to enable cleanup validation.",
        }

    model = os.getenv("OPENAI_VISION_MODEL", "gpt-4.1-mini")
    prompt = (
        "Compare the two waste-spot photos. "
        "The first is the before image and the second is the after-cleanup image. "
        "Decide if the after image shows a real cleanup of the same location. "
        "Return JSON with keys status, confidence, and summary. "
        "Use status=approved if the same place is shown and the waste is clearly reduced or removed. "
        "Use status=rejected if the images do not match, the cleanup is not credible, or the waste is not improved. "
        "Use a confidence between 0 and 1. "
        f"Context description: {description or 'None'}. "
        f"Landmark: {landmark or 'None'}."
    )

    payload = {
        "model": model,
        "input": [
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {"type": "input_image", "image_url": before_image, "detail": "high"},
                    {"type": "input_image", "image_url": after_image, "detail": "high"},
                ],
            }
        ],
        "text": {
            "format": {
                "type": "json_object"
            }
        },
    }

    request = urllib.request.Request(
        OPENAI_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            details = exc.read().decode("utf-8")
        except Exception:
            details = str(exc)
        return {
            "status": "unavailable",
            "confidence": 0.0,
            "summary": f"AI verification request failed: {details[:300]}",
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "confidence": 0.0,
            "summary": f"AI verification request failed: {exc}",
        }

    output_text = (raw.get("output_text") or "").strip()
    if not output_text and raw.get("output"):
        for item in raw["output"]:
            if item.get("type") != "message":
                continue
            for content in item.get("content", []):
                if content.get("type") == "output_text":
                    output_text = content.get("text", "").strip()
                    break
            if output_text:
                break

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
