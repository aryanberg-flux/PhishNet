# PhishNet - Low-Level Design

## 1. Purpose

This document describes the detailed implementation of PhishNet, including the frontend components, Flask backend, AI/ML modules, analysis pipeline, risk evaluation, and incident-response workflow.

The LLD explains how the individual modules interact to transform user input into a phishing assessment and actionable response.

---

## 2. System Flow

The complete analysis process is:

```text
User
 |
 v
React Frontend
 |
 v
Scanner
 |
 v
Flask Backend
 |
 +----------------------+
 |                      |
 v                      v
Text Input          Screenshot
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
             +----------+----------+
             |                     |
             v                     v
        Rule Engine          ML Predictor
             |                     |
             +----------+----------+
                        |
                        v
                   Risk Engine
                        |
                        v
                 AI Explanation
                        |
                        v
                 Final Result
                        |
                        v
                 React Dashboard
                        |
                        v
                Incident Response
3. Frontend Architecture

The frontend is implemented using React and is located in:

src/

The main application entry point is:

src/App.jsx
Main Frontend Components
Component	Responsibility
App.jsx	Main application orchestration
Scanner.jsx	Text and screenshot input
AnalysisCard.jsx	Displays analysis results
IncidentResponsePanel.jsx	Provides post-incident guidance
DnaPanel.jsx	Displays analysis fingerprint information
ReportPanel.jsx	Displays analysis report
SessionHistory.jsx	Displays previous analysis sessions
TrendingScams.jsx	Displays scam trend information
IndiaHeatmap.jsx	Displays geographic threat visualization
Header.jsx	Application header
4. Scanner Flow

The Scanner component is responsible for receiving user input.

The user can provide suspicious content as text or as a screenshot.

Text Input
User enters message
        |
        v
Scanner.jsx
        |
        v
Backend text endpoint
        |
        v
Analysis pipeline
Screenshot Input
User selects screenshot
        |
        v
Scanner.jsx
        |
        v
Backend image endpoint
        |
        v
OCR
        |
        v
Extracted text
        |
        v
Analysis pipeline
5. Backend Architecture

The backend is implemented using Python and Flask.

Main file:

backend/app.py

The backend acts as the API and orchestration layer.

Its responsibilities include:

Receiving frontend requests
Validating input
Processing text analysis
Processing image analysis
Calling AI/ML modules
Combining analysis results
Returning structured JSON responses
6. Backend Request Flow

The backend receives an analysis request from the frontend.

React Frontend
      |
      | HTTP Request
      v
backend/app.py
      |
      v
Input Processing
      |
      v
AI/ML Pipeline
      |
      v
Structured Result
      |
      | JSON Response
      v
React Frontend
7. AI/ML Architecture

The AI/ML modules are located inside:

ai_ml/

The major modules are:

ai_ml/
 |
 +-- rule_engine.py
 |
 +-- predictor.py
 |
 +-- risk_engine.py
 |
 +-- ocr.py
 |
 +-- text_normalizer.py
 |
 +-- gemma_explainer.py
 |
 +-- phishing_model.pkl
 |
 +-- vectorizer.pkl

Each module performs a specific stage of the analysis process.

8. Text Normalization

File:

ai_ml/text_normalizer.py

The text normalizer prepares incoming text for analysis.

The purpose is to create a consistent representation of the submitted content before it reaches the detection modules.

Raw Text
   |
   v
Text Normalization
   |
   v
Normalized Text
   |
   +----------------+
   |                |
   v                v
Rule Engine     ML Predictor
9. Rule Engine

File:

ai_ml/rule_engine.py

The Rule Engine performs deterministic phishing analysis.

It identifies suspicious patterns and indicators within the submitted content.

Examples include:

Urgent language
Credential requests
OTP requests
Verification requests
Financial/payment indicators
Suspicious URLs
Password-related warnings
Multiple suspicious indicators

The rule engine produces findings that contribute to the final risk assessment.

10. Machine Learning Predictor

Files:

ai_ml/predictor.py
ai_ml/phishing_model.pkl
ai_ml/vectorizer.pkl

The predictor performs machine-learning-based phishing classification.

The basic flow is:

Input Text
    |
    v
Vectorizer
    |
    v
Feature Representation
    |
    v
Trained Phishing Model
    |
    v
ML Prediction

The trained model and vectorizer are stored as project assets.

The ML prediction is used together with rule-based analysis.

11. Risk Engine

File:

ai_ml/risk_engine.py

The Risk Engine combines information from the different detection mechanisms.

Conceptually:

             Rule Findings
                   |
                   v
              +---------+
              |         |
ML Prediction |  Risk   |
------------->| Engine  |
              |         |
Context ------>|         |
              +----+----+
                   |
                   v
            Risk Assessment

The risk assessment is then returned to the frontend for presentation.

12. OCR Processing

File:

ai_ml/ocr.py

OCR allows screenshots to be analyzed by converting visual content into text.

The flow is:

Screenshot
    |
    v
OCR Processing
    |
    v
Extracted Text
    |
    v
Text Normalization
    |
    v
Rule Engine + ML Predictor

This allows PhishNet to analyze suspicious content even when the original message is only available as an image.

13. AI Explanation

File:

ai_ml/gemma_explainer.py

The explanation layer is designed to make analysis understandable to users.

Instead of only displaying a classification, the system can provide contextual information about suspicious indicators and the analysis.

Conceptually:

Analysis Signals
       |
       v
AI Explanation Layer
       |
       v
Human-Readable Explanation
14. Analysis Result

After processing, the backend returns a structured analysis result.

The frontend uses this result to populate the dashboard.

AI/ML Pipeline
      |
      v
Analysis Result
      |
      +------------------+
      |                  |
      v                  v
Prediction           Findings
      |                  |
      +---------+--------+
                |
                v
          Risk Information
                |
                v
          React Dashboard
15. Analysis Card

File:

src/components/AnalysisCard.jsx

The Analysis Card presents the main analysis result.

It can display:

Detection verdict
Risk information
Findings
Analysis information
Available actions

The Analysis Card also provides access to:

DNA/Fingerprint information
Report generation/view
Incident response
16. DNA Panel

File:

src/components/DnaPanel.jsx

The DNA Panel presents analysis fingerprint information associated with the result.

It provides additional analysis details that can help users inspect characteristics of the analyzed content.

17. Report Panel

File:

src/components/ReportPanel.jsx

The Report Panel presents the analysis in a report-oriented format.

It provides users with relevant findings and analysis information in a structured view.

18. Incident Response Panel

File:

src/components/IncidentResponsePanel.jsx

The Incident Response Panel is designed for users who may already have interacted with suspicious content.

The available scenarios include:

I clicked the link
I entered my password
I entered OTP, PIN, card or UPI details
I downloaded or installed something
I'm not sure what happened

The selected scenario determines the recommended response actions.

Incident Response Flow
Analysis Result
      |
      v
"Already Clicked?"
      |
      v
Incident Response Panel
      |
      v
User selects situation
      |
      v
Scenario-specific guidance
19. Session History

File:

src/components/SessionHistory.jsx

Session History allows users to review previous analysis sessions maintained by the application.

It provides continuity when multiple suspicious messages are analyzed during a session.

20. Threat Visualization

PhishNet includes dashboard visualization features.

India Heatmap

File:

src/components/IndiaHeatmap.jsx

The heatmap provides a geographic representation of configured threat hotspots.

Trending Scams

File:

src/components/TrendingScams.jsx

The component displays configured scam and threat trend information.

These features provide additional context alongside individual phishing analysis.

21. End-to-End Text Analysis

The complete text-analysis flow is:

                   USER
                     |
                     v
                Scanner.jsx
                     |
                     v
            Flask Text Endpoint
                     |
                     v
             Text Normalizer
                     |
             +-------+-------+
             |               |
             v               v
        Rule Engine      ML Predictor
             |               |
             +-------+-------+
                     |
                     v
                Risk Engine
                     |
                     v
             AI Explanation
                     |
                     v
              Final Result
                     |
                     v
             AnalysisCard
                     |
        +------------+-------------+
        |            |             |
        v            v             v
     DNA Panel   Report Panel   Incident Response
22. End-to-End Screenshot Analysis
                   USER
                     |
                     v
              Screenshot Upload
                     |
                     v
                Scanner.jsx
                     |
                     v
            Flask Image Endpoint
                     |
                     v
                    OCR
                     |
                     v
              Extracted Text
                     |
                     v
              Text Normalizer
                     |
             +-------+-------+
             |               |
             v               v
        Rule Engine      ML Predictor
             |               |
             +-------+-------+
                     |
                     v
                Risk Engine
                     |
                     v
              Final Result
                     |
                     v
             React Dashboard
23. Module Interaction

The major module relationships are:

Frontend
   |
   v
Backend
   |
   +----------------------+
   |          |           |
   v          v           v
 OCR     Text Normalizer  Predictor
              |             |
              v             |
         Rule Engine        |
              |             |
              +------+------+
                     |
                     v
                Risk Engine
                     |
                     v
              AI Explanation
                     |
                     v
                Frontend
24. Error Handling

The backend is responsible for validating requests and returning appropriate responses.

The frontend handles failed analysis requests and presents the corresponding application state to the user.

The application also provides a backend health/status mechanism for checking backend availability.

25. Security-Oriented Design

PhishNet is designed around several security principles:

Least Exposure

User-submitted content should only be processed for the requested analysis workflow.

Explainable Detection

Users should understand why content has been identified as suspicious.

Multi-Signal Analysis

The system combines multiple analysis signals instead of depending entirely on a single classifier.

Safe Incident Guidance

Post-incident guidance focuses on reducing further exposure and directing users toward appropriate actions.

26. Module Responsibility Summary
Module	Responsibility
backend/app.py	API and analysis orchestration
rule_engine.py	Rule-based phishing detection
predictor.py	Machine-learning prediction
risk_engine.py	Risk assessment
text_normalizer.py	Text preprocessing
ocr.py	Screenshot text extraction
gemma_explainer.py	AI-assisted explanation
Scanner.jsx	User input
AnalysisCard.jsx	Analysis presentation
DnaPanel.jsx	Analysis fingerprint
ReportPanel.jsx	Report presentation
IncidentResponsePanel.jsx	Post-incident guidance
SessionHistory.jsx	Session history
IndiaHeatmap.jsx	Geographic visualization
TrendingScams.jsx	Scam trend visualization
27. Summary

PhishNet uses a modular frontend, backend, and AI/ML architecture.

The detailed implementation flow is:

INPUT
  |
  v
OCR / TEXT PROCESSING
  |
  v
RULE ENGINE + ML PREDICTOR
  |
  v
RISK ENGINE
  |
  v
AI EXPLANATION
  |
  v
ANALYSIS RESULT
  |
  v
INCIDENT RESPONSE