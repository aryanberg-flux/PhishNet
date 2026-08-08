import re
from urllib.parse import urlparse


# =========================================================
# CONFIGURATION
# =========================================================

RULE_WEIGHTS = {
    "urgency": 15,
    "credential_request": 25,
    "otp_request": 25,
    "financial_request": 20,
    "suspicious_link": 20,
    "prize_scam": 20,
    "impersonation": 20,
    "attachment_request": 15,
    "social_engineering": 15,
}


# =========================================================
# PATTERNS
# =========================================================

URGENCY_PATTERNS = [
    r"\burgent\b",
    r"\bimmediately\b",
    r"\bact now\b",
    r"\baction required\b",
    r"\bwithin\s+\d+\s*(hour|hours|minute|minutes|day|days)\b",
    r"\baccount.*(suspend|terminate|disable|blocked)\b",
    r"\bverify.*immediately\b",
]


CREDENTIAL_PATTERNS = [
    r"\benter your password\b",
    r"\bprovide your password\b",
    r"\bconfirm your password\b",
    r"\bverify your password\b",
    r"\busername and password\b",
    r"\blog ?in\b",
    r"\bsign ?in\b",
    r"\bverify your account\b",
]


OTP_PATTERNS = [
    r"\botp\b",
    r"\bone[- ]time password\b",
    r"\bverification code\b",
    r"\bsecurity code\b",
    r"\bpasscode\b",
]


FINANCIAL_PATTERNS = [
    r"\bcredit card\b",
    r"\bdebit card\b",
    r"\bbank account\b",
    r"\bbank details\b",
    r"\baccount number\b",
    r"\bcard number\b",
    r"\bcvv\b",
    r"\bpayment\b",
    r"\brefund\b",
    r"\btransaction\b",
    r"\bupi\b",
]


PRIZE_PATTERNS = [
    r"\byou (have )?won\b",
    r"\bcongratulations\b",
    r"\bprize\b",
    r"\breward\b",
    r"\blottery\b",
    r"\bcash prize\b",
    r"\bfree money\b",
]


IMPERSONATION_PATTERNS = [
    r"\bgovernment\b",
    r"\bincome tax\b",
    r"\bpolice\b",
    r"\bcustoms\b",
    r"\bbank support\b",
    r"\bcustomer support\b",
    r"\bsecurity team\b",
    r"\badmin(istrator)?\b",
    r"\bmicrosoft support\b",
    r"\bgoogle support\b",
    r"\bapple support\b",
]


ATTACHMENT_PATTERNS = [
    r"\bopen the attachment\b",
    r"\bopen attached file\b",
    r"\bdownload the attachment\b",
    r"\bdownload this file\b",
    r"\battached invoice\b",
    r"\battached document\b",
]


SOCIAL_ENGINEERING_PATTERNS = [
    r"\bdo not tell anyone\b",
    r"\bkeep this confidential\b",
    r"\bsecret\b",
    r"\bdon't tell\b",
    r"\bdo not share\b",
    r"\bfinal warning\b",
    r"\blast chance\b",
]


# =========================================================
# HELPER
# =========================================================

def find_matches(text, patterns):
    """
    Return matched patterns from a list of regular expressions.
    """

    matches = []

    for pattern in patterns:

        if re.search(pattern, text, flags=re.IGNORECASE):
            matches.append(pattern)

    return matches


def extract_urls(text):
    """
    Extract URLs from text.
    """

    return re.findall(
        r"https?://[^\s<>\"]+",
        text,
        flags=re.IGNORECASE
    )


# =========================================================
# URL ANALYSIS
# =========================================================

def analyze_links(text):
    """
    Detect potentially suspicious URLs.

    This does NOT open or visit URLs.
    """

    urls = extract_urls(text)

    suspicious_urls = []

    suspicious_indicators = [
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "shorturl.at",
    ]

    for url in urls:

        try:

            parsed = urlparse(url)

            domain = parsed.netloc.lower()

            reasons = []

            # URL shortener
            if any(
                indicator in domain
                for indicator in suspicious_indicators
            ):
                reasons.append("URL shortener")

            # IP address instead of domain
            if re.match(
                r"^\d{1,3}(\.\d{1,3}){3}$",
                domain
            ):
                reasons.append("IP address used as domain")

            # Suspicious userinfo pattern
            if "@" in url:
                reasons.append(
                    "URL contains an @ symbol"
                )

            if reasons:

                suspicious_urls.append({
                    "url": url,
                    "domain": domain,
                    "reasons": reasons
                })

        except Exception:
            continue

    return suspicious_urls


# =========================================================
# MAIN RULE ENGINE
# =========================================================

def analyze_text(text):
    """
    Analyze text using deterministic phishing rules.

    Returns structured evidence.

    This function DOES NOT make the final phishing
    classification. The ML model and Risk Engine
    will be used alongside it.
    """

    if not isinstance(text, str):
        raise TypeError("text must be a string")

    text = text.strip()

    if not text:
        return {
            "score": 0,
            "signals": [],
            "suspicious_urls": []
        }

    signals = []

    # -----------------------------------------------------
    # Urgency
    # -----------------------------------------------------

    if find_matches(text, URGENCY_PATTERNS):

        signals.append({
            "type": "urgency",
            "severity": "high",
            "score": RULE_WEIGHTS["urgency"],
            "message": (
                "The message uses urgent or "
                "threatening language."
            )
        })

    # -----------------------------------------------------
    # Credentials
    # -----------------------------------------------------

    if find_matches(text, CREDENTIAL_PATTERNS):

        signals.append({
            "type": "credential_request",
            "severity": "critical",
            "score": RULE_WEIGHTS["credential_request"],
            "message": (
                "The message appears to request "
                "account credentials."
            )
        })

    # -----------------------------------------------------
    # OTP
    # -----------------------------------------------------

    if find_matches(text, OTP_PATTERNS):

        signals.append({
            "type": "otp_request",
            "severity": "critical",
            "score": RULE_WEIGHTS["otp_request"],
            "message": (
                "The message contains language "
                "related to OTP or verification codes."
            )
        })

    # -----------------------------------------------------
    # Financial
    # -----------------------------------------------------

    if find_matches(text, FINANCIAL_PATTERNS):

        signals.append({
            "type": "financial_request",
            "severity": "high",
            "score": RULE_WEIGHTS["financial_request"],
            "message": (
                "The message contains financial "
                "or payment-related requests."
            )
        })

    # -----------------------------------------------------
    # Prize
    # -----------------------------------------------------

    if find_matches(text, PRIZE_PATTERNS):

        signals.append({
            "type": "prize_scam",
            "severity": "high",
            "score": RULE_WEIGHTS["prize_scam"],
            "message": (
                "The message contains prize, "
                "lottery, or reward-related language."
            )
        })

    # -----------------------------------------------------
    # Impersonation
    # -----------------------------------------------------

    if find_matches(text, IMPERSONATION_PATTERNS):

        signals.append({
            "type": "impersonation",
            "severity": "medium",
            "score": RULE_WEIGHTS["impersonation"],
            "message": (
                "The message may be impersonating "
                "an organization or authority."
            )
        })

    # -----------------------------------------------------
    # Attachment
    # -----------------------------------------------------

    if find_matches(text, ATTACHMENT_PATTERNS):

        signals.append({
            "type": "attachment_request",
            "severity": "medium",
            "score": RULE_WEIGHTS["attachment_request"],
            "message": (
                "The message encourages the user "
                "to open or download an attachment."
            )
        })

    # -----------------------------------------------------
    # Social Engineering
    # -----------------------------------------------------

    if find_matches(text, SOCIAL_ENGINEERING_PATTERNS):

        signals.append({
            "type": "social_engineering",
            "severity": "high",
            "score": RULE_WEIGHTS["social_engineering"],
            "message": (
                "The message contains language "
                "designed to pressure or manipulate the user."
            )
        })

    # -----------------------------------------------------
    # Link Analysis
    # -----------------------------------------------------

    suspicious_urls = analyze_links(text)

    if suspicious_urls:

        signals.append({
            "type": "suspicious_link",
            "severity": "high",
            "score": RULE_WEIGHTS["suspicious_link"],
            "message": (
                "The message contains a potentially "
                "suspicious URL."
            )
        })

    # -----------------------------------------------------
    # Calculate Rule Score
    # -----------------------------------------------------

    raw_score = sum(
        signal["score"]
        for signal in signals
    )

    # Keep score between 0 and 100
    score = min(raw_score, 100)

    # -----------------------------------------------------
    # Risk Level
    # -----------------------------------------------------

    if score >= 75:
        risk_level = "CRITICAL"

    elif score >= 50:
        risk_level = "HIGH"

    elif score >= 25:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    # -----------------------------------------------------
    # Final result
    # -----------------------------------------------------

    return {
        "score": score,
        "risk_level": risk_level,
        "signals": signals,
        "suspicious_urls": suspicious_urls,
        "signal_count": len(signals)
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    test_message = """
    URGENT!

    Your bank account will be suspended within 24 hours.

    Verify your account immediately.
    Enter your password and OTP at:
    https://bit.ly/example

    Do not tell anyone.
    """

    result = analyze_text(test_message)

    import json

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )