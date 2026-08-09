# PhishNet

### AI-Powered Phishing Detection, Risk Assessment & Incident Response

PhishNet is a cybersecurity platform designed to help users detect suspicious phishing content, understand why it is risky, and take appropriate action after potential exposure.

The platform supports both **text-based** and **screenshot-based** phishing analysis and combines rule-based detection, machine-learning prediction, risk assessment, and explainable results in a single dashboard.

> **Detect. Understand. Respond.**

---

## Problem Statement

Phishing attacks increasingly imitate legitimate communication such as:

- Banking and KYC messages
- OTP and verification requests
- Password reset alerts
- Payment and UPI requests
- Job offers
- University notifications
- Suspicious downloads
- SMS and messaging-app scams

Many users cannot confidently determine whether such content is legitimate.

Traditional phishing detection tools may identify a threat but often do not explain the reasoning or provide meaningful guidance after the user has already interacted with the suspicious content.

PhishNet addresses this gap by combining:

**Phishing Detection + Risk Assessment + Explainability + Incident Response**

---

# Key Features

## 1. AI-Powered Phishing Detection

PhishNet combines multiple detection mechanisms to analyze suspicious content.

The system uses:

- Rule-based phishing detection
- Machine-learning classification
- Risk scoring
- Contextual analysis

---

## 2. Text Analysis

Users can directly enter suspicious messages into the scanner.

```text
Suspicious Text
      |
      v
Text Processing
      |
      +----------------+
      |                |
      v                v
 Rule Engine       ML Predictor
      |                |
      +-------+--------+
              |
              v
         Risk Engine
              |
              v
        Final Analysis
3. Screenshot Analysis

Users can analyze suspicious content available as an image or screenshot.

The screenshot is processed through OCR before entering the phishing analysis pipeline.

Screenshot
    |
    v
OCR
    |
    v
Extracted Text
    |
    v
Rule + ML Analysis
    |
    v
Risk Assessment
4. Risk Assessment

The Risk Engine combines analysis signals to produce an overall assessment.

Rule-Based Signals
        +
ML Prediction
        +
Contextual Signals
        |
        v
   Risk Engine
        |
        v
Risk Assessment

The result is presented through the dashboard in a user-friendly format.

5. Explainable Analysis

PhishNet is designed to provide more than a simple:

PHISHING

or:

SAFE

classification.

The dashboard provides findings and analysis information that help users understand why content may be suspicious.

6. Incident Response

PhishNet includes an "Already Clicked?" workflow.

Users can select what happened to them:

I clicked the link
I entered my password
I entered OTP, PIN, card or UPI details
I downloaded or installed something
I'm not sure what happened

The system then provides appropriate next-step guidance.

This extends the security workflow from:

Detect

to:

Detect
   |
Understand
   |
Respond
7. Analysis Report

The Report Panel provides a structured view of the analysis findings and relevant analysis information.

8. Analysis DNA / Fingerprint

The DNA Panel provides additional analysis fingerprint information associated with an analyzed result.

9. Session History

PhishNet provides session history so users can review previous analysis results during their application session.

10. Threat Visualization
India Heatmap

The dashboard includes an India-focused geographic threat visualization showing configured threat hotspots.

Trending Scams

The dashboard also provides a view of configured scam and threat trends.

System Architecture
                         USER
                           |
                           v
                  React Frontend
                           |
                     HTTP / JSON
                           |
                           v
                   Flask Backend
                           |
             +-------------+-------------+
             |                           |
             v                           v
        Text Input                  Screenshot
                                         |
                                         v
                                        OCR
                                         |
                                         v
                                  Extracted Text
                                         |
             +---------------------------+
             |
             v
      Text Normalization
             |
       +-----+-----+
       |           |
       v           v
  Rule Engine   ML Predictor
       |           |
       +-----+-----+
             |
             v
        Risk Engine
             |
             v
      AI Explanation
             |
             v
      Analysis Result
             |
             v
       React Dashboard
             |
             v
      Incident Response
Technology Stack
Frontend
React
Vite
Tailwind CSS
React Leaflet
Lucide React
Backend
Python
Flask
Flask-CORS
AI / ML
Rule-based phishing detection
Machine-learning phishing classification
Risk assessment
OCR
Text normalization
AI-assisted explanation
Project Structure
PhishNet/
|
+-- ai_ml/
|   +-- gemma_explainer.py
|   +-- ocr.py
|   +-- phishing_model.pkl
|   +-- predictor.py
|   +-- risk_engine.py
|   +-- rule_engine.py
|   +-- supplemental_training.csv
|   +-- text_normalizer.py
|   +-- train_model.py
|   +-- vectorizer.pkl
|
+-- backend/
|   +-- app.py
|
+-- src/
|   +-- components/
|   |   +-- AnalysisCard.jsx
|   |   +-- DnaPanel.jsx
|   |   +-- Header.jsx
|   |   +-- IncidentResponsePanel.jsx
|   |   +-- IndiaHeatmap.jsx
|   |   +-- ReportPanel.jsx
|   |   +-- Scanner.jsx
|   |   +-- SessionHistory.jsx
|   |   +-- TrendingScams.jsx
|   |
|   +-- data/
|   +-- i18n/
|   +-- lib/
|   +-- theme/
|   +-- App.jsx
|   +-- index.css
|   +-- main.jsx
|
+-- public/
|
+-- docs/
|   +-- HLD.md
|   +-- LLD.md
|   +-- API.md
|   +-- SETUP.md
|   +-- FEATURES.md
|
+-- package.json
+-- package-lock.json
+-- vite.config.js
+-- tailwind.config.js
+-- postcss.config.js
+-- index.html
API

The Flask backend currently exposes:

Method	Endpoint	Purpose
GET	/	Backend status
GET	/api/health	Health check
POST	/api/analyze/text	Analyze suspicious text
POST	/api/analyze/image	Analyze screenshot/image

Detailed API documentation is available in:

docs/API.md
Local Installation
Prerequisites

Install:

Git
Python 3.x
Node.js
npm

Verify:

git --version
python --version
node --version
npm --version
Clone the Repository
git clone <YOUR_PUBLIC_GITHUB_REPOSITORY_URL>
cd PhishNet
Frontend Setup

Install Node dependencies:

npm install

Start the development server:

npm run dev

Vite will display the local URL in the terminal.

Typically:

http://localhost:5173
Backend Setup

The backend entry point is:

backend/app.py

Start the backend using:

python -m backend.app

The backend runs locally at:

http://127.0.0.1:5000
Running the Complete Application

PhishNet requires both the frontend and backend during local development.

Terminal 1 - Backend
python -m backend.app
Terminal 2 - Frontend
npm install
npm run dev

Then open the Vite URL displayed in Terminal 2.

Backend Health Check

Once the backend is running, open:

http://127.0.0.1:5000/api/health

This verifies that the Flask backend is available.

Build for Production

Create a production frontend build:

npm run build

A successful build generates:

dist/
Development Validation

Python syntax can be checked using:

python -m py_compile backend\app.py ai_ml\rule_engine.py ai_ml\risk_engine.py

Backend import validation:

python -c "from backend.app import app; print('BACKEND IMPORT OK')"

Frontend production build:

npm run build
Documentation

Detailed project documentation is available in the docs/ directory.

Document	Description
HLD.md	High-Level System Design
LLD.md	Low-Level Implementation Design
API.md	Backend API Documentation
SETUP.md	Installation and Setup Guide
FEATURES.md	Feature Breakdown
Security Approach

PhishNet follows a multi-layer approach to phishing detection.

Input
  |
  v
Preprocessing
  |
  +----------------+
  |                |
  v                v
Rules             ML
  |                |
  +-------+--------+
          |
          v
      Risk Engine
          |
          v
    Explainability
          |
          v
  Incident Response

The goal is not only to identify suspicious content, but also to help users understand the threat and respond appropriately.

Future Scope

Potential future improvements include:

Production cloud deployment
Improved model training and evaluation
Larger phishing datasets
Real-time threat intelligence integration
Browser extension support
Email client integration
Automated URL reputation analysis
Advanced behavioral detection
Enterprise security dashboards
Centralized analytics and monitoring
Project Philosophy

PhishNet is built around a simple principle:

Security tools should not only detect threats. They should help people understand and respond to them.

PhishNet - Detect. Understand. Respond.