from typing import Optional


# =========================================================
# CONFIGURATION
# =========================================================

# How much each component contributes to the final score.
#
# Rule Engine:
#   40%
#
# ML Model:
#   60%
#
# These weights can be changed later after testing Aryan's
# model performance.
RULE_WEIGHT = 0.40
ML_WEIGHT = 0.60


# =========================================================
# HELPERS
# =========================================================

def clamp_score(score):
    """
    Keep a score between 0 and 100.
    """

    try:
        score = float(score)
    except (TypeError, ValueError):
        return 0.0

    return max(0.0, min(score, 100.0))


def probability_to_score(probability):
    """
    Convert an ML phishing probability such as:

        0.95 -> 95
        0.72 -> 72

    If the model already provides a 0-100 score,
    use that directly instead.
    """

    try:
        probability = float(probability)
    except (TypeError, ValueError):
        return None

    # Probability format: 0.0 - 1.0
    if 0.0 <= probability <= 1.0:
        return probability * 100

    # Already percentage format: 0 - 100
    if 0.0 <= probability <= 100.0:
        return probability

    return None


def get_risk_level(score):
    """
    Convert final numerical score into a risk level.
    """

    if score >= 75:
        return "CRITICAL"

    if score >= 50:
        return "HIGH"

    if score >= 25:
        return "MEDIUM"

    return "LOW"


# =========================================================
# ML SCORE EXTRACTION
# =========================================================

def extract_ml_score(ml_result):
    """
    Extract phishing probability from Aryan's ML model result.

    Supported formats:

    {
        "phishing_probability": 0.94
    }

    OR:

    {
        "phishing_probability": 94
    }

    OR:

    {
        "score": 94
    }

    Returns None if an ML result is not available.
    """

    if not isinstance(ml_result, dict):
        return None

    # Preferred field
    probability = ml_result.get(
        "phishing_probability"
    )

    score = probability_to_score(
        probability
    )

    if score is not None:
        return clamp_score(score)

    # Fallback
    model_score = ml_result.get(
        "score"
    )

    if model_score is not None:
        return clamp_score(model_score)

    return None


# =========================================================
# RISK ENGINE
# =========================================================

def calculate_risk(
    rule_result,
    ml_result: Optional[dict] = None
):
    """
    Combine Rule Engine and ML model results.

    Current design:

        Rule Engine = 40%
        ML Model    = 60%

    If ML is not available yet, the Rule Engine is used
    temporarily so the backend continues to work.

    Parameters
    ----------
    rule_result : dict
        Output from ai_ml.rule_engine.analyze_text()

    ml_result : dict or None
        Output from Aryan's ML model.

    Returns
    -------
    dict
        Final structured risk result.
    """

    # -----------------------------------------------------
    # Validate Rule Engine result
    # -----------------------------------------------------

    if not isinstance(rule_result, dict):
        rule_result = {}

    rule_score = clamp_score(
        rule_result.get(
            "score",
            0
        )
    )

    # -----------------------------------------------------
    # Get ML score
    # -----------------------------------------------------

    ml_score = extract_ml_score(
        ml_result
    )

    # -----------------------------------------------------
    # ML unavailable
    # -----------------------------------------------------

    if ml_score is None:

        final_score = rule_score

        level = get_risk_level(
            final_score
        )

        return {
            "score": round(final_score, 2),
            "level": level,

            "method": "rule_only",

            "components": {
                "rule_score": round(
                    rule_score,
                    2
                ),

                "ml_score": None,

                "rule_weight": RULE_WEIGHT,

                "ml_weight": ML_WEIGHT
            },

            "ml_available": False
        }

    # -----------------------------------------------------
    # ML available
    # -----------------------------------------------------

    final_score = (
        rule_score * RULE_WEIGHT
        +
        ml_score * ML_WEIGHT
    )

    final_score = clamp_score(
        final_score
    )

    level = get_risk_level(
        final_score
    )

    return {
        "score": round(
            final_score,
            2
        ),

        "level": level,

        "method": "rule_plus_ml",

        "components": {
            "rule_score": round(
                rule_score,
                2
            ),

            "ml_score": round(
                ml_score,
                2
            ),

            "rule_weight": RULE_WEIGHT,

            "ml_weight": ML_WEIGHT
        },

        "ml_available": True
    }


# =========================================================
# BUILD FINAL EXPLANATION
# =========================================================

def build_risk_explanation(
    risk_result,
    rule_result
):
    """
    Create a structured explanation for the frontend.

    This is not the final Gemma explanation.
    Gemma will later make the explanation more natural.
    """

    reasons = []

    if isinstance(rule_result, dict):

        signals = rule_result.get(
            "signals",
            []
        )

        for signal in signals:

            message = signal.get(
                "message"
            )

            if message:
                reasons.append(
                    message
                )

    score = risk_result.get(
        "score",
        0
    )

    level = risk_result.get(
        "level",
        "UNKNOWN"
    )

    return {
        "summary": (
            f"Current risk assessment: "
            f"{level} ({score}/100)."
        ),

        "reasons": reasons,

        "risk_level": level,

        "risk_score": score
    }


# =========================================================
# COMPLETE ANALYSIS
# =========================================================

def evaluate(
    rule_result,
    ml_result=None
):
    """
    Complete Risk Engine operation.

    This function is the main function that Flask will call.
    """

    risk_result = calculate_risk(
        rule_result,
        ml_result
    )

    explanation = build_risk_explanation(
        risk_result,
        rule_result
    )

    return {
        "risk": risk_result,
        "explanation": explanation
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    import json

    # -----------------------------------------------------
    # Fake Rule Engine result
    # -----------------------------------------------------

    example_rules = {
        "score": 80,

        "risk_level": "CRITICAL",

        "signals": [
            {
                "type": "urgency",
                "severity": "high",
                "score": 15,
                "message": (
                    "The message uses urgent "
                    "or threatening language."
                )
            },

            {
                "type": "suspicious_link",
                "severity": "high",
                "score": 20,
                "message": (
                    "The message contains a "
                    "potentially suspicious URL."
                )
            }
        ]
    }

    # -----------------------------------------------------
    # Test 1: Rule Engine only
    # -----------------------------------------------------

    print("\n========== RULE ONLY ==========\n")

    result = evaluate(
        example_rules
    )

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )

    # -----------------------------------------------------
    # Test 2: Rule + fake ML result
    # -----------------------------------------------------

    print("\n========== RULE + ML ==========\n")

    fake_ml_result = {
        "label": "phishing",
        "phishing_probability": 0.90,
        "legitimate_probability": 0.10
    }

    result = evaluate(
        example_rules,
        fake_ml_result
    )

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )