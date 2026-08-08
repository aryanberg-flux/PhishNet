from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


# =========================================================
# CONFIGURATION
# =========================================================

MAX_TEXT_LENGTH = 50_000

ALLOWED_IMAGE_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}


# =========================================================
# HELPERS
# =========================================================

def error_response(message, status_code=400):
    return jsonify({
        "success": False,
        "error": message
    }), status_code


def allowed_image(filename):
    if not filename or "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return extension in ALLOWED_IMAGE_EXTENSIONS


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health", methods=["GET"])
def health_check():

    return jsonify({
        "success": True,
        "service": "Phisnet Backend",
        "status": "running"
    })


# =========================================================
# TEXT ANALYSIS
# =========================================================

@app.route("/api/analyze/text", methods=["POST"])
def analyze_text():

    data = request.get_json(silent=True)

    if not data:
        return error_response(
            "Request body must contain JSON."
        )

    text = data.get("text", "")

    if not isinstance(text, str):
        return error_response(
            "The text field must be a string."
        )

    # -----------------------------------------------------
    # Normalize text
    # -----------------------------------------------------

    try:
        from ai_ml.text_normalizer import normalize_text

        text = normalize_text(text)

    except ImportError as error:

        print("TEXT NORMALIZER ERROR:", error)

        return error_response(
            "Text normalizer module not found.",
            500
        )

    if not text:
        return error_response(
            "Please provide a message to analyze."
        )

    if len(text) > MAX_TEXT_LENGTH:
        return error_response(
            f"Message is too long. Maximum length is "
            f"{MAX_TEXT_LENGTH} characters."
        )

    # -----------------------------------------------------
    # Analysis
    # -----------------------------------------------------

    analysis = analyze_message(text)

    return jsonify({
        "success": True,
        "source": "text",
        "extracted_text": text,
        "analysis": analysis
    })


# =========================================================
# IMAGE / SCREENSHOT ANALYSIS
# =========================================================

@app.route("/api/analyze/image", methods=["POST"])
def analyze_image():

    image_file = request.files.get("image")

    if image_file is None:
        return error_response(
            "No image was uploaded. "
            "Use the field name 'image'."
        )

    if not image_file.filename:
        return error_response(
            "The uploaded image has no filename."
        )

    if not allowed_image(image_file.filename):
        return error_response(
            "Unsupported image format. "
            "Use PNG, JPG, JPEG, or WEBP."
        )

    try:

        # -------------------------------------------------
        # OCR
        # -------------------------------------------------

        from ai_ml.ocr import extract_text

        extracted_text = extract_text(image_file)

        if not extracted_text:
            return error_response(
                "No text could be extracted from the image.",
                422
            )

        # -------------------------------------------------
        # Normalize OCR output
        # -------------------------------------------------

        from ai_ml.text_normalizer import normalize_text

        extracted_text = normalize_text(
            extracted_text
        )

        if not extracted_text:
            return error_response(
                "No readable text was found in the image.",
                422
            )

        # -------------------------------------------------
        # Analysis
        # -------------------------------------------------

        analysis = analyze_message(
            extracted_text
        )

        return jsonify({
            "success": True,
            "source": "image",
            "extracted_text": extracted_text,
            "analysis": analysis
        })

    except ImportError as error:

        print("MODULE ERROR:", error)

        return error_response(
            "Required AI/ML module was not found.",
            500
        )

    except Exception as error:

        print("IMAGE ANALYSIS ERROR:", error)

        return error_response(
            "Unable to process the uploaded image.",
            500
        )


# =========================================================
# COMMON ANALYSIS PIPELINE
# =========================================================

def analyze_message(text):
    """
    Complete analysis pipeline.

    Current pipeline:

        Text
          ↓
        Rule Engine
          ↓
        Risk Engine
          ↓
        Final result

    ML is intentionally not connected yet.
    """

    try:

        # -------------------------------------------------
        # Rule Engine
        # -------------------------------------------------

        from ai_ml.rule_engine import analyze_text

        rule_result = analyze_text(text)

        # -------------------------------------------------
        # Risk Engine
        # -------------------------------------------------

        from ai_ml.risk_engine import evaluate

        # Aryan's ML model will be connected here later.
        # For now, Risk Engine operates in rule-only mode.
        ml_result = None

        risk_result = evaluate(
            rule_result,
            ml_result
        )

        # -------------------------------------------------
        # Return combined result
        # -------------------------------------------------

        return {
            "prediction": {
                "label": "pending_ml_model",
                "confidence": None,
                "phishing_probability": None,
                "legitimate_probability": None
            },

            "rules": rule_result,

            "risk": risk_result["risk"],

            "explanation": risk_result["explanation"],

            "recommended_actions": [
                "Do not click suspicious links.",
                "Do not provide passwords or OTPs.",
                "Verify the sender through an official channel."
            ]
        }

    except Exception as error:

        print("ANALYSIS ERROR:", error)

        return {
            "prediction": {
                "label": "analysis_error",
                "confidence": None,
                "phishing_probability": None,
                "legitimate_probability": None
            },

            "rules": {
                "score": 0,
                "risk_level": "UNKNOWN",
                "signals": [],
                "suspicious_urls": [],
                "signal_count": 0
            },

            "risk": {
                "score": 0,
                "level": "UNKNOWN",
                "method": "error",
                "ml_available": False
            },

            "explanation": {
                "summary": "Unable to complete message analysis.",
                "reasons": [],
                "risk_level": "UNKNOWN",
                "risk_score": 0
            },

            "recommended_actions": []
        }
# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):

    return jsonify({
        "success": False,
        "error": "API endpoint not found."
    }), 404


@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({
        "success": False,
        "error": "Internal server error."
    }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )