from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import tempfile


# ============================================================
# APP CONFIGURATION
# ============================================================

app = Flask(__name__)
CORS(app)

# Maximum upload size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# ============================================================
# AI / ML IMPORTS
# ============================================================

from ai_ml.rule_engine import analyze_text as analyze_rules
from ai_ml.risk_engine import evaluate
from ai_ml.predictor import predict_text


# ============================================================
# ROOT / HEALTH CHECK
# ============================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "service": "Phisnet Backend",
        "status": "running"
    }), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "service": "Phisnet Backend",
        "status": "running",
        "components": {
            "rule_engine": True,
            "ml_model": True,
            "risk_engine": True,
            "ocr": True
        }
    }), 200


# ============================================================
# COMPLETE ANALYSIS PIPELINE
# ============================================================

def analyze_message(text):
    """
    Complete PhishNet analysis pipeline.

    Text
      |
      v
    Rule Engine
      |
      +--------------------+
      |                    |
      v                    v
    Rule Score         ML Predictor
      |                    |
      |                    v
      |               ML Prediction
      |                    |
      +---------+----------+
                |
                v
           Risk Engine
                |
                v
          Final Result
    """

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if not isinstance(text, str):
        raise ValueError("Text must be a string.")

    text = text.strip()

    if not text:
        raise ValueError("Text cannot be empty.")

    # --------------------------------------------------------
    # 1. RULE ENGINE
    # --------------------------------------------------------

    rule_result = analyze_rules(text)

    # --------------------------------------------------------
    # 2. ML MODEL
    # --------------------------------------------------------

    # IMPORTANT:
    # Do NOT set ml_result to None.
    #
    # predict_text() loads Aryan's trained model and vectorizer
    # and returns:
    #
    # {
    #     "label": "...",
    #     "confidence": ...,
    #     "phishing_probability": ...,
    #     "legitimate_probability": ...
    # }

    ml_result = predict_text(text)

    # --------------------------------------------------------
    # Validate ML response
    # --------------------------------------------------------

    if not isinstance(ml_result, dict):
        raise ValueError(
            "ML predictor returned an invalid response."
        )

    required_ml_fields = [
        "label",
        "confidence",
        "phishing_probability",
        "legitimate_probability"
    ]

    missing_fields = [
        field
        for field in required_ml_fields
        if field not in ml_result
    ]

    if missing_fields:
        raise ValueError(
            "ML predictor response is missing fields: "
            + ", ".join(missing_fields)
        )

    # --------------------------------------------------------
    # 3. RISK ENGINE
    # --------------------------------------------------------

    risk_result = evaluate(
        rule_result,
        ml_result
    )

    # --------------------------------------------------------
    # 4. FINAL RESPONSE
    # --------------------------------------------------------

    return {
        "prediction": ml_result,

        "rules": rule_result,

        "risk": risk_result["risk"],

        "explanation": risk_result["explanation"],

        "recommended_actions": [
            "Do not click suspicious links.",
            "Do not provide passwords or OTPs.",
            "Verify the sender through an official channel."
        ]
    }


# ============================================================
# TEXT ANALYSIS
# ============================================================

@app.route("/api/analyze/text", methods=["POST"])
def analyze_text_route():

    try:

        # ----------------------------------------------------
        # Read JSON
        # ----------------------------------------------------

        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "success": False,
                "error": "JSON request body is required."
            }), 400

        # ----------------------------------------------------
        # Get text
        # ----------------------------------------------------

        text = data.get("text")

        if not isinstance(text, str):
            return jsonify({
                "success": False,
                "error": "Missing 'text' field."
            }), 400

        text = text.strip()

        if not text:
            return jsonify({
                "success": False,
                "error": "Text cannot be empty."
            }), 400

        # ----------------------------------------------------
        # Run complete pipeline
        # ----------------------------------------------------

        analysis = analyze_message(text)

        # ----------------------------------------------------
        # Return response
        # ----------------------------------------------------

        return jsonify({
            "success": True,
            "source": "text",
            "extracted_text": text,
            "analysis": analysis
        }), 200

    except Exception as error:

        print("TEXT ANALYSIS ERROR:", repr(error))

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# ============================================================
# IMAGE / OCR ANALYSIS
# ============================================================

@app.route("/api/analyze/image", methods=["POST"])
def analyze_image_route():

    temporary_file = None

    try:

        # ----------------------------------------------------
        # Check image upload
        # ----------------------------------------------------

        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file supplied."
            }), 400

        image = request.files["image"]

        if image.filename is None or image.filename == "":
            return jsonify({
                "success": False,
                "error": "No image selected."
            }), 400

        # ----------------------------------------------------
        # Create temporary image file
        # ----------------------------------------------------

        extension = os.path.splitext(image.filename)[1]

        if not extension:
            extension = ".png"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            image.save(temp_file.name)
            temporary_file = temp_file.name

        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        from ai_ml.ocr import extract_text

        extracted_text = extract_text(temporary_file)

        if not isinstance(extracted_text, str):
            extracted_text = str(extracted_text)

        extracted_text = extracted_text.strip()

        if not extracted_text:
            return jsonify({
                "success": False,
                "source": "image",
                "extracted_text": "",
                "error": "OCR could not extract text."
            }), 422

        # ----------------------------------------------------
        # Run complete Rule + ML + Risk pipeline
        # ----------------------------------------------------

        analysis = analyze_message(extracted_text)

        # ----------------------------------------------------
        # Return response
        # ----------------------------------------------------

        return jsonify({
            "success": True,
            "source": "image",
            "extracted_text": extracted_text,
            "analysis": analysis
        }), 200

    except Exception as error:

        print("IMAGE ANALYSIS ERROR:", repr(error))

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500

    finally:

        # ----------------------------------------------------
        # Remove temporary file
        # ----------------------------------------------------

        if temporary_file and os.path.exists(temporary_file):

            try:
                os.remove(temporary_file)

            except Exception as cleanup_error:
                print(
                    "TEMP FILE CLEANUP ERROR:",
                    repr(cleanup_error)
                )


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "success": False,
        "error": "API endpoint not found."
    }), 404


@app.errorhandler(413)
def file_too_large(error):

    return jsonify({
        "success": False,
        "error": "File too large. Maximum size is 10 MB."
    }), 413


@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({
        "success": False,
        "error": "Internal server error."
    }), 500


# ============================================================
# START FLASK
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("PHISHNET BACKEND")
    print("=" * 60)
    print("Rule Engine : ENABLED")
    print("ML Model    : ENABLED")
    print("Risk Engine : ENABLED")
    print("OCR         : ENABLED")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )