# PhishNet - API Documentation

## 1. Overview

PhishNet uses a Flask-based backend to provide analysis APIs for the React frontend.

The backend is implemented in:

```text
backend/app.py

The API supports:

Backend health checking
Text-based phishing analysis
Screenshot/image-based phishing analysis
2. Base URL
Local Development
http://127.0.0.1:5000

The frontend currently communicates with the local Flask backend during development.

For production deployment, the frontend API base URL should be changed to the deployed backend URL.

3. API Endpoints
Method	Endpoint	Purpose
GET	/	Backend home/status
GET	/api/health	Backend health check
POST	/api/analyze/text	Analyze suspicious text
POST	/api/analyze/image	Analyze screenshot/image
4. GET /
Purpose

Provides a basic response from the PhishNet backend.

Request
GET /
Example
GET http://127.0.0.1:5000/
Response

The endpoint returns a basic backend status/response.

5. GET /api/health
Purpose

Checks whether the PhishNet backend is available.

Request
GET /api/health
Example
GET http://127.0.0.1:5000/api/health
Use Case

The frontend or developer can use this endpoint to verify that the Flask backend is running before performing an analysis.

6. POST /api/analyze/text
Purpose

Analyzes a suspicious text message using the PhishNet detection pipeline.

Request
POST /api/analyze/text
Content-Type: application/json
Input

The request contains the text that should be analyzed.

Example structure:

{
  "text": "Your account will be suspended. Verify your account immediately."
}
Processing Flow
Client
  |
  v
/api/analyze/text
  |
  v
Backend
  |
  v
Text Processing
  |
  +------------------+
  |                  |
  v                  v
Rule Engine      ML Predictor
  |                  |
  +--------+---------+
           |
           v
      Risk Engine
           |
           v
    AI Explanation
           |
           v
    Analysis Result
Response

The endpoint returns a structured JSON analysis result.

The result is used by the React frontend to display:

Prediction
Risk information
Findings
Analysis details
Additional response actions
7. POST /api/analyze/image
Purpose

Analyzes a screenshot or image containing potentially suspicious content.

Request
POST /api/analyze/image

The image is submitted to the backend for processing.

Processing Flow
Client
  |
  v
/api/analyze/image
  |
  v
Image Processing
  |
  v
OCR
  |
  v
Extracted Text
  |
  v
Text Analysis
  |
  +------------------+
  |                  |
  v                  v
Rule Engine      ML Predictor
  |                  |
  +--------+---------+
           |
           v
      Risk Engine
           |
           v
    Analysis Result
Use Case

This endpoint allows users to analyze phishing content when the original message is available as a screenshot or image rather than selectable text.

8. Analysis Pipeline

Both analysis endpoints ultimately connect to the PhishNet analysis pipeline.

                  User Input
                      |
             +--------+--------+
             |                 |
             v                 v
         Text Input        Screenshot
                               |
                               v
                              OCR
                               |
             +-----------------+
             |
             v
       Text Processing
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
9. Backend Functions

The main backend functions associated with the API are:

Function	Purpose
home()	Handles /
health()	Handles /api/health
analyze_message()	Performs message analysis
analyze_text_route()	Handles text analysis requests
analyze_image_route()	Handles image analysis requests
not_found()	Handles missing routes
file_too_large()	Handles oversized uploads
internal_server_error()	Handles unexpected server errors
10. Error Handling

The backend includes dedicated handlers for:

404 - Not Found

Handled by:

not_found(error)
File Too Large

Handled by:

file_too_large(error)

This protects the application from oversized uploads.

Internal Server Error

Handled by:

internal_server_error(error)

This provides centralized handling for unexpected backend errors.

11. Frontend Integration

The React frontend communicates with the backend using HTTP requests.

The frontend API base is configured in:

src/App.jsx

During local development, the application uses:

http://127.0.0.1:5000

The frontend calls:

/api/analyze/text

for text analysis and:

/api/analyze/image

for screenshot/image analysis.

12. API Architecture
                    React Frontend
                          |
             +------------+------------+
             |                         |
             v                         v
      POST /api/analyze/text    POST /api/analyze/image
             |                         |
             +------------+------------+
                          |
                          v
                    Flask Backend
                          |
                          v
                  Analysis Pipeline
                          |
              +-----------+-----------+
              |                       |
              v                       v
        Rule Engine              ML Predictor
              |                       |
              +-----------+-----------+
                          |
                          v
                     Risk Engine
                          |
                          v
                  Analysis Result
                          |
                          v
                   React Dashboard
13. API Security Considerations

The API is designed for phishing-content analysis and should be deployed with appropriate production security controls.

Recommended production considerations include:

HTTPS
Restricted CORS origins
Input validation
Upload size limits
Secure backend configuration
Appropriate server-side logging
Protection of model and server resources

The local development configuration should not be treated as the final production configuration.

14. API Summary

PhishNet currently exposes four primary routes:

GET  /
GET  /api/health
POST /api/analyze/text
POST /api/analyze/image

The two analysis endpoints form the core API of the application.

They allow PhishNet to support both:

Text -> Analysis

and:

Screenshot -> OCR -> Analysis

while returning structured results to the React dashboard.


### Save it

Press:

**Ctrl + S**

### Then verify

In the VS Code terminal:

```powershell
Select-String -Path docs\API.md -Pattern '^# |^## '