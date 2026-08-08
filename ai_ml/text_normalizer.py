import re


def normalize_text(text):
    """
    Clean OCR and pasted text before it reaches
    the Rule Engine.
    """

    if not isinstance(text, str):
        return ""

    # -------------------------------------------------
    # Normalize line endings
    # -------------------------------------------------

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # -------------------------------------------------
    # Convert Markdown-style links
    #
    # [https://example.com](https://example.com)
    #
    # into:
    #
    # https://example.com
    # -------------------------------------------------

    text = re.sub(
        r"\[[^\]]*(https?://[^\]\s]+)[^\]]*\]\([^)]*\)",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # -------------------------------------------------
    # Remove brackets immediately around URLs
    # -------------------------------------------------

    text = re.sub(
        r"\[\s*(https?://)",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"(https?://[^\s\]]+)\]",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # -------------------------------------------------
    # Clean common OCR/Markdown artifacts around URLs
    # -------------------------------------------------

    text = re.sub(
        r"\]\s*\(",
        " ",
        text
    )

    # -------------------------------------------------
    # Join a URL that was split across a newline
    #
    # https://example.com/
    # verify
    #
    # -> https://example.com/verify
    # -------------------------------------------------

    text = re.sub(
        r"(https?://[^\s]+)\s*\n\s*([A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+)",
        r"\1\2",
        text,
        flags=re.IGNORECASE
    )

    # -------------------------------------------------
    # Remove whitespace accidentally inserted into
    # obvious URL structures.
    # -------------------------------------------------

    text = re.sub(
        r"(https?://[^\s]+)\s+(?=[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+\b)",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # -------------------------------------------------
    # Collapse repeated spaces
    # -------------------------------------------------

    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    # -------------------------------------------------
    # Remove excessive blank lines
    # -------------------------------------------------

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    # -------------------------------------------------
    # Strip whitespace from each line
    # -------------------------------------------------

    lines = [
        line.strip()
        for line in text.split("\n")
    ]

    text = "\n".join(lines)

    return text.strip()