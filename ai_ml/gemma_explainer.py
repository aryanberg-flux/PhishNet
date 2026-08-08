import json
import os

from google import genai


MODEL_NAME = "gemma-4-26b-a4b-it"


def get_client():
    """
    Create the Google GenAI client.

    The API key must be provided through the GEMINI_API_KEY
    environment variable.
    """
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set."
        )

    return genai.Client(api_key=api_key)


def explain_analysis(
    email_text,
    prediction,
    rules,
    risk,
):
    """
    Generate an explanation for an already-computed PhishNet result.

    IMPORTANT:
    Gemma is an explanation engine only.
    It must never change the Logistic Regression prediction.
    """

    prompt = f"""
You are the explanation engine for PhishNet, a phishing-email
detection system.

IMPORTANT RULE:
The Logistic Regression classifier has already made the final
classification. You MUST NOT change, override, contradict, or
reclassify that prediction.

Your ONLY job is to explain why the existing classification was made.

Use ONLY the evidence supplied below.

EMAIL TEXT:
{email_text}

LOGISTIC REGRESSION RESULT:
{json.dumps(prediction, ensure_ascii=False)}

RULE ENGINE SIGNALS:
{json.dumps(rules, ensure_ascii=False)}

RISK ENGINE RESULT:
{json.dumps(risk, ensure_ascii=False)}

Return ONLY valid JSON in exactly this structure:

{{
  "summary": "A concise explanation of the classification.",
  "reasons": [
    "Reason 1",
    "Reason 2",
    "Reason 3"
  ]
}}

Requirements:
- Do not change the classifier label.
- Do not invent evidence.
- Do not claim a URL is malicious unless the supplied evidence
  indicates it is suspicious.
- Explain the existing prediction using the supplied signals.
- Keep the summary concise.
- Provide 2 to 5 clear reasons.
- Do not include markdown.
- Return JSON only.
"""

    client = get_client()

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    text = response.text.strip()

    try:
        explanation = json.loads(text)
    except json.JSONDecodeError:
        # Safe fallback if Gemma doesn't return perfect JSON.
        return {
            "summary": text,
            "reasons": [],
        }

    return {
        "summary": str(
            explanation.get("summary", "")
        ),
        "reasons": [
            str(reason)
            for reason in explanation.get("reasons", [])
        ],
    }


if __name__ == "__main__":
    test_prediction = {
        "label": "Phishing",
        "confidence": 99.94,
        "phishing_probability": 99.94,
        "legitimate_probability": 0.06,
    }

    test_rules = {
        "signals": [
            {
                "type": "urgency",
                "severity": "high",
                "score": 15,
                "message": (
                    "The message uses urgent or threatening language."
                ),
            },
            {
                "type": "credential_request",
                "severity": "critical",
                "score": 25,
                "message": (
                    "The message appears to request account credentials."
                ),
            },
        ]
    }

    test_risk = {
        "score": 83.96,
        "level": "CRITICAL",
        "method": "rule_plus_ml",
        "ml_available": True,
    }

    test_email = (
        "URGENT: Your bank account will be suspended. "
        "Click here immediately to verify your password "
        "and account details."
    )

    result = explain_analysis(
        test_email,
        test_prediction,
        test_rules,
        test_risk,
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))