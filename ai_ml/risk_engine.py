import math
from typing import Optional


# =========================================================
# CONFIGURATION
# =========================================================

RULE_WEIGHT = 0.40
ML_WEIGHT = 0.60


# =========================================================
# HELPERS
# =========================================================

def clamp_score(score):
    """Keep a risk score between 0 and 100."""

    try:
        score = float(score)
    except (TypeError, ValueError):
        return 0.0

    if not math.isfinite(score):
        return 0.0

    return max(0.0, min(100.0, score))


def get_risk_level(score):
    """Convert a numeric risk score into a risk level."""

    score = clamp_score(score)

    if score >= 75:
        return "CRITICAL"

    if score >= 50:
        return "HIGH"

    if score >= 25:
        return "MEDIUM"

    return "LOW"


def extract_ml_score(ml_result):
    """
    Extract phishing probability from the ML result.

    Supports probabilities represented either as:
        0.96
    or:
        96.0
    """

    if not isinstance(ml_result, dict):
        return None

    value = ml_result.get("phishing_probability")

    if value is None:
        prediction = ml_result.get("prediction")

        if isinstance(prediction, dict):
            value = prediction.get("phishing_probability")

    if value is None:
        return None

    try:
        value = float(value)
    except (TypeError, ValueError):
        return None

    if not math.isfinite(value):
        return None

    # ML models sometimes return probability as 0-1.
    if 0.0 <= value <= 1.0:
        value *= 100.0

    return clamp_score(value)


# =========================================================
# RISK CALCULATION
# =========================================================

def calculate_risk(
    rule_result,
    ml_result: Optional[dict] = None
):
    """
    Combine Rule Engine and ML model results.

    Rule Engine = 40%
    ML Model    = 60%

    If ML is unavailable, the Rule Engine score is used.

    Strong contextual rules are protected from being
    completely overridden by a conflicting ML prediction.
    """

    # -----------------------------------------------------
    # Validate Rule Engine result
    # -----------------------------------------------------

    if not isinstance(rule_result, dict):
        rule_result = {}

    rule_score = clamp_score(
        rule_result.get("score", 0)
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
            "score": round(
                final_score,
                2
            ),

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

    # -----------------------------------------------------
    # Contextual phishing protection
    # -----------------------------------------------------

    signals = rule_result.get(
        "signals",
        []
    )

    if not isinstance(signals, list):
        signals = []

    signal_types = {
        signal.get("type")
        for signal in signals
        if isinstance(signal, dict)
    }

    # Password-expiration + action link is strong
    # contextual evidence. Prevent the ML model from
    # completely overriding that evidence.
    if "password_expiration_link" in signal_types:

        final_score = max(
            final_score,
            rule_score
        )

    # -----------------------------------------------------
    # Clamp final score
    # -----------------------------------------------------

    final_score = clamp_score(
        final_score
    )

    # -----------------------------------------------------
    # Risk level
    # -----------------------------------------------------

    level = get_risk_level(
        final_score
    )

    # -----------------------------------------------------
    # Final result
    # -----------------------------------------------------

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
# EXPLANATION
# =========================================================

def build_explanation(
    rule_result,
    ml_result,
    risk_result
):
    """
    Build a human-readable explanation from the
    Rule Engine, ML model, and Risk Engine.
    """

    reasons = []

    if not isinstance(rule_result, dict):
        rule_result = {}

    signals = rule_result.get(
        "signals",
        []
    )

    if isinstance(signals, list):

        for signal in signals:

            if not isinstance(signal, dict):
                continue

            message = signal.get(
                "message"
            )

            if message:
                reasons.append(
                    message
                )

    if isinstance(ml_result, dict):

        phishing_probability = (
            extract_ml_score(
                ml_result
            )
        )

        if phishing_probability is not None:

            if phishing_probability >= 75:

                reasons.append(
                    "The machine learning model "
                    "identified a high phishing probability."
                )

            elif phishing_probability <= 25:

                reasons.append(
                    "The machine learning model "
                    "identified a high legitimate probability."
                )

    if not reasons:

        reasons.append(
            "No significant phishing indicators "
            "were detected."
        )

    level = (
        risk_result.get(
            "level",
            "LOW"
        )
        if isinstance(risk_result, dict)
        else "LOW"
    )

    score = (
        risk_result.get(
            "score",
            0
        )
        if isinstance(risk_result, dict)
        else 0
    )

    if level == "CRITICAL":

        summary = (
            "The message contains multiple high-risk "
            "indicators and should be treated as phishing."
        )

    elif level == "HIGH":

        summary = (
            "The message contains significant phishing "
            "indicators and should be treated with caution."
        )

    elif level == "MEDIUM":

        summary = (
            "The message contains suspicious indicators "
            "that require further verification."
        )

    else:

        summary = (
            "The message has a low overall risk score "
            "based on the available evidence."
        )

    return {
        "summary": summary,
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
    Run the complete Risk Engine pipeline.
    """

    risk_result = calculate_risk(
        rule_result,
        ml_result
    )

    explanation = build_explanation(
        rule_result,
        ml_result,
        risk_result
    )

    return {
        "risk": risk_result,
        "explanation": explanation
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    example_rules = {
        "score": 35,

        "risk_level": "MEDIUM",

        "signals": [
            {
                "type": "urgency",
                "severity": "high",
                "score": 15,
                "message": (
                    "The message uses urgent or "
                    "threatening language."
                )
            },
            {
                "type": "password_expiration_link",
                "severity": "high",
                "score": 20,
                "message": (
                    "The message combines password-expiration "
                    "language with a link requiring password action."
                )
            }
        ],

        "suspicious_urls": [],

        "signal_count": 2
    }

    fake_ml_result = {
        "label": "Legitimate",
        "phishing_probability": 0.20,
        "legitimate_probability": 0.80
    }

    result = evaluate(
        example_rules,
        fake_ml_result
    )

    import json

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )