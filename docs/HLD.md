# PhishNet - High-Level Design (HLD)

## 1. Overview

PhishNet is an AI-powered phishing detection, risk assessment, and incident-response web application.

It helps users analyze suspicious emails, messages, and screenshots, identify phishing indicators, understand why content is suspicious, and receive actionable guidance if they have already interacted with a suspicious message.

The system follows three core objectives:

**DETECT -> UNDERSTAND -> RESPOND**

## 2. Problem

Phishing messages increasingly imitate legitimate communication such as:

- University notifications
- Password-expiration alerts
- Banking and KYC messages
- OTP and verification requests
- Payment and UPI requests
- Job offers
- Suspicious downloads
- SMS and WhatsApp messages

Users often cannot determine whether such messages are legitimate without technical knowledge.

PhishNet addresses this problem by combining automated analysis with understandable explanations and post-incident guidance.

## 3. High-Level Architecture

```text
USER
 |
 v
React Frontend
 |
 | HTTP / JSON
 v
Flask Backend
 |
 +------------------+
 |                  |
 v                  v
Text Input       Screenshot
                    |
                    v
                   OCR
                    |
                    v
             Extracted Text
                    |
                    v
           Text Normalization
                    |
          +---------+---------+
          |                   |
          v                   v
      Rule Engine        ML Predictor
          |                   |
          +---------+---------+
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
4. Main Components
Frontend

The frontend is built using React and provides the main PhishNet dashboard.

Major components include:

App.jsx
Scanner.jsx
AnalysisCard.jsx
IncidentResponsePanel.jsx
DnaPanel.jsx
ReportPanel.jsx
SessionHistory.jsx
TrendingScams.jsx
IndiaHeatmap.jsx
Header.jsx
Backend

The backend is implemented using Python and Flask.

Main entry point:

backend/app.py

The backend receives analysis requests, coordinates the analysis pipeline, and returns structured results to the frontend.

AI/ML Layer

The AI/ML components are located in:

ai_ml/

Major modules include:

rule_engine.py
predictor.py
risk_engine.py
ocr.py
text_normalizer.py
gemma_explainer.py
5. Analysis Pipeline
Text Analysis
User enters suspicious text
          |
          v
     React Scanner
          |
          v
    Flask Backend
          |
          v
 Text Normalization
          |
     +----+----+
     |         |
     v         v
Rule Engine  ML Predictor
     |         |
     +----+----+
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
Screenshot Analysis
User uploads screenshot
          |
          v
     React Scanner
          |
          v
    Flask Backend
          |
          v
          OCR
          |
          v
    Extracted Text
          |
          v
 Text Analysis Pipeline
          |
          v
    Risk Assessment
          |
          v
    React Dashboard
6. Rule-Based Detection

The Rule Engine identifies phishing indicators and suspicious patterns.

Examples include:

Urgent language
Credential requests
OTP and verification language
Financial and payment indicators
Suspicious URLs
Password-expiration patterns
Multiple suspicious signals appearing together

The rule engine provides explainable findings that contribute to the overall risk assessment.

7. Machine Learning Detection

PhishNet uses a trained machine-learning phishing classifier.

The prediction flow is:

Input Text
    |
    v
Vectorization
    |
    v
Trained ML Model
    |
    v
Prediction

The model and vectorizer are stored in the ai_ml directory.

Machine-learning predictions are combined with rule-based signals rather than being used as the only detection mechanism.

8. Risk Engine

The Risk Engine combines the available detection signals into a final risk assessment.

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
Final Risk Assessment

The resulting assessment is presented to the user through the dashboard.

9. Explainability

PhishNet is designed to provide more than a simple phishing or legitimate classification.

The application presents relevant findings and analysis information so users can understand why content may be suspicious.

The explanation component is implemented through:

ai_ml/gemma_explainer.py
10. Incident Response

A major PhishNet feature is the "Already Clicked?" workflow.

Users can select scenarios such as:

I clicked the link
I entered my password
I entered OTP, PIN, card or UPI details
I downloaded or installed something
I'm not sure what happened

The system then provides appropriate next-step guidance.

The workflow becomes:

Detect
  |
Understand
  |
Determine Exposure
  |
Provide Response Guidance
11. Dashboard Features
                         PhishNet
                            |
        +-------------------+-------------------+
        |                   |                   |
        v                   v                   v
     Scanner          Analysis Card          Header
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
          DNA Panel    Report Panel   Incident Response

        +-----------------------------------------+
        |                                         |
        v                                         v
 Session History                         Threat Visualization
                                                |
                                      +---------+---------+
                                      |                   |
                                      v                   v
                               Trending Scams      India Heatmap
12. Technology Stack
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
AI/ML
Rule-based phishing detection
Machine-learning classification
Risk scoring
OCR
Text normalization
AI-assisted explanation
13. Design Principles
Multi-Signal Detection

Combine rule-based indicators and machine-learning predictions.

Explainability

Provide understandable reasons behind security assessments.

User-Centric Security

Present security information in a format accessible to non-technical users.

Detection Plus Response

Provide guidance even when the user has already interacted with suspicious content.

Modular Architecture

Keep frontend, backend, and AI/ML components separated so individual modules can be improved independently.

14. Summary

PhishNet combines a modern cybersecurity dashboard with a multi-stage phishing analysis pipeline.

The system accepts text or screenshots, processes the input, identifies suspicious indicators using rules and machine learning, calculates risk, provides explanations, and offers incident-response guidance.

DETECT
   |
   v
Analyze Text / Screenshot
   |
   v
Rules + ML + OCR
   |
   v
UNDERSTAND
   |
   v
Risk + Findings + Explanation
   |
   v
RESPOND
   |
   v
Incident Response Guidance

PhishNet - Detect. Understand. Respond.


**4. Press `Ctrl + S`.**

That's all.

### Important

The actual content goes into:

**VS Code → `docs` → `HLD.md`**

Not into the terminal.

The **terminal is only for checking it**.

After saving, open the VS Code terminal and run:

```powershell
Select-String -Path docs\HLD.md -Pattern '^# |^## '