# 🎭 Moodify — AI-Powered Sentiment Analysis WebApp

Moodify is a full-stack sentiment analysis web application that analyzes user reviews and classifies them into **Positive, Neutral, or Negative** sentiments using a custom-trained **Bidirectional LSTM (BiLSTM)** neural network.

The application supports both **individual review analysis** and **batch CSV analysis**, while storing prediction history in **Firebase Firestore** for analytics and historical tracking.

🌐 **Live Demo:** https://moodifyweb.vercel.app/

---

## ✨ Features

- 🧠 **Custom BiLSTM Sentiment Model**
  - Custom-trained Bidirectional LSTM neural network
  - PyTorch-based inference
  - Sentiment classification with confidence scores

- ✍️ **Single Review Analysis**
  - Enter a review or any text
  - Get instant sentiment prediction
  - View prediction confidence

- 📊 **CSV Batch Analysis**
  - Upload a CSV containing review data
  - Automatically detects supported text columns
  - Analyze multiple reviews at once
  - View Positive / Neutral / Negative breakdown

- 📈 **Analytics Dashboard**
  - Total reviews analyzed
  - Positive reviews
  - Neutral reviews
  - Negative reviews
  - Live statistics fetched from the backend

- 🕒 **Prediction History**
  - Stores analyzed reviews in Firebase Firestore
  - Displays previous predictions
  - Shows sentiment, confidence, and timestamps

- 🔥 **Firebase Integration**
  - Firestore for persistent prediction history
  - Authenticated backend communication with Firebase

- 🌐 **Full-Stack Deployment**
  - Frontend deployed on Vercel
  - Backend deployed on Render
  - Firebase Firestore used as the database

- 🎨 **Modern Responsive UI**
  - React + TypeScript
  - Tailwind CSS
  - Responsive design
  - Light / Dark theme support

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │          User           │
                         │   Review / CSV Upload   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     React Frontend      │
                         │    Vite + TypeScript    │
                         │       Tailwind CSS      │
                         └────────────┬────────────┘
                                      │
                              HTTPS REST API
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      Flask Backend      │
                         │       Python + Flask    │
                         └────────────┬────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                ┌─────────────────┐      ┌─────────────────┐
                │ Custom BiLSTM   │      │ Firebase        │
                │ PyTorch Model   │      │ Firestore       │
                └────────┬────────┘      └────────┬────────┘
                         │                         │
                         ▼                         ▼
                Sentiment +             History + Statistics
                Confidence
```

### Application Flow

```text
User
 │
 ├── Enter Review ───────────────┐
 │                               │
 └── Upload CSV ─────────────────┤
                                 ▼
                        React Frontend
                                 │
                                 ▼
                         Flask REST API
                                 │
                                 ▼
                     Custom BiLSTM Model
                                 │
                                 ▼
                  Sentiment + Confidence
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                     ▼                       ▼
              Frontend Result        Firebase Firestore
                                             │
                                   ┌─────────┴─────────┐
                                   ▼                   ▼
                               History             Statistics
```

---

## 🧠 Machine Learning Model

Moodify uses a custom-trained **Bidirectional LSTM (BiLSTM)** neural network for sentiment classification.

### Model Architecture

```text
Input Text
    │
    ▼
Text Cleaning
    │
    ▼
Tokenization
    │
    ▼
Vocabulary Mapping
    │
    ▼
Padding / Truncation
    │
    ▼
Embedding Layer
    │
    ▼
Bidirectional LSTM
    │
    ▼
Forward + Backward Hidden States
    │
    ▼
Concatenation
    │
    ▼
Dropout
    │
    ▼
Fully Connected Layer
    │
    ▼
5-Class Prediction
    │
    ▼
Moodify Sentiment Mapping
    │
    ▼
Positive / Neutral / Negative
```

### Model Pipeline

The backend performs the following steps for every prediction:

1. Receives the input review.
2. Converts text to lowercase.
3. Removes unsupported characters.
4. Splits the text into tokens.
5. Maps tokens to vocabulary indices.
6. Truncates sequences to the configured maximum length.
7. Pads shorter sequences.
8. Passes the sequence through the embedding layer.
9. Processes the sequence using the Bidirectional LSTM.
10. Combines the final forward and backward hidden states.
11. Applies dropout.
12. Passes the representation through the fully connected layer.
13. Applies Softmax to obtain class probabilities.
14. Selects the class with the highest probability.
15. Maps the internal model class to a Moodify sentiment.
16. Returns the sentiment and confidence score.

### Model Files

The trained model and its supporting configuration are stored inside the backend:

```text
backend/
├── moodify_bilstm_final.pt
├── moodify_model_config.json
└── moodify_vocab.json
```

### Sentiment Mapping

The model internally supports five sentiment classes and maps them to the three user-facing Moodify categories.

```text
5-Class Model
     │
     ├── Very Positive ──┐
     ├── Positive ───────┤
     │                   ├──► Positive
     ├── Neutral ────────┤
     │                   ├──► Neutral
     ├── Negative ───────┤
     └── Very Negative ──┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| Lucide Icons | Interface icons |
| Radix UI | UI primitives |
| Fetch API | Backend communication |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend development |
| Flask | REST API |
| Flask-CORS | Cross-origin communication |
| PyTorch | Machine learning inference |
| Google Authentication | Firebase authentication |
| Firestore REST API | Database operations |

### Deployment & Database

| Technology | Purpose |
|---|---|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Firebase Firestore | Persistent data storage |
| GitHub | Source code management |

---

## 📁 Project Structure

```text
Moodify-WebApp/
│
├── backend/
│   ├── app.py
│   ├── moodify_bilstm_final.pt
│   ├── moodify_model_config.json
│   ├── moodify_vocab.json
│   ├── requirements.txt
│   ├── render.yaml
│   └── .gitignore
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── sentiment/
│   │   └── ui/
│   │
│   ├── hooks/
│   │   └── useSentimentAnalysis.ts
│   │
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── Dashboard.tsx
│   │   ├── History.tsx
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔌 Backend API

The Flask backend provides REST APIs for sentiment analysis, CSV processing, prediction history, statistics, and health monitoring.

### 1. Health Check

```http
GET /health
```

Returns the backend and model status.

Example response:

```json
{
  "status": "healthy",
  "model": "Moodify Custom BiLSTM",
  "model_loaded": true
}
```

---

### 2. Single Review Prediction

```http
POST /predict
```

Request:

```json
{
  "text": "I absolutely love this product!"
}
```

Response:

```json
{
  "sentiment": "Positive",
  "confidence": 0.7162
}
```

---

### 3. CSV Batch Prediction

```http
POST /predict/csv
```

The uploaded CSV should contain one of the following supported text columns:

```text
review
text
content
comment
```

Example:

```csv
review
I absolutely love this product!
The product is okay, nothing special.
This product is terrible.
Great quality and excellent service.
```

Example response:

```json
{
  "positive": 2,
  "neutral": 1,
  "negative": 1,
  "total": 4
}
```

---

### 4. Prediction History

```http
GET /history
```

Returns recently analyzed reviews with:

- Review text
- Sentiment
- Confidence
- Timestamp

The backend retrieves prediction records from Firebase Firestore and returns them to the frontend.

---

### 5. Statistics

```http
GET /stats
```

Returns aggregated sentiment statistics.

Example response:

```json
{
  "positive": 144,
  "neutral": 24,
  "negative": 102,
  "total": 300
}
```

---

## 🖥️ Frontend Pages

Moodify currently contains the following major pages:

### Analyze

The main page where users can:

- Enter a review for sentiment analysis.
- View the prediction result.
- Upload CSV files for batch analysis.
- View recent analysis information.

### Dashboard

Provides analytics based on data stored in Firestore.

Displays:

- Total reviews
- Positive reviews
- Neutral reviews
- Negative reviews

### History

Displays previously analyzed reviews with:

- Review text
- Sentiment
- Confidence
- Timestamp

### About

Provides information about:

- Moodify
- Project purpose
- Technology stack
- Custom BiLSTM model
- Development team

---

## 📊 CSV Analysis

Moodify supports batch sentiment analysis through CSV uploads.

The backend automatically searches for the first supported text column:

```text
review
text
content
comment
```

Column matching is case-insensitive.

For example, the following are supported:

```text
review
Review
REVIEW
text
Text
TEXT
```

Empty rows are skipped automatically.

The API returns:

```json
{
  "positive": 0,
  "neutral": 0,
  "negative": 0,
  "total": 0
}
```

The frontend then converts these values into a visual sentiment summary.

---

## 🔥 Firebase Firestore

Moodify uses Firebase Firestore to persist prediction data.

Each prediction can contain:

```text
text
sentiment
confidence
timestamp
source
```

The `source` field identifies whether the prediction originated from:

```text
text
```

or:

```text
csv
```

### Firestore Flow

```text
Prediction Request
       │
       ▼
Flask Backend
       │
       ├── Run BiLSTM
       │
       ▼
Sentiment Result
       │
       ▼
Firebase Authentication
       │
       ▼
Firestore REST API
       │
       ▼
sentiments Collection
```

---

## 🚀 Running Locally

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3
- Git
- Firebase project with Firestore enabled

---

### 1. Clone the Repository

```bash
git clone https://github.com/priyanshuranjan02/Moodify-WebApp.git
cd Moodify-WebApp
```

---

### 2. Frontend Setup

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the local backend URL:

```env
VITE_API_URL=http://127.0.0.1:5001
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:8080
```

---

### 3. Backend Setup

Open another terminal and move into the backend:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on macOS / Linux:

```bash
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configure your Firebase service-account credentials locally.

The credential file should be named:

```text
moodify-firebase-key.json
```

and placed inside:

```text
backend/
```

> ⚠️ The Firebase service-account key is intentionally excluded from Git and must never be committed to a public repository.

Start the backend:

```bash
python app.py
```

The backend runs locally on:

```text
http://127.0.0.1:5001
```

---

## 🧪 Testing

### Test Positive Sentiment

Enter:

```text
I absolutely love this product!
```

Expected sentiment:

```text
Positive
```

### Test Neutral Sentiment

Enter:

```text
The product is okay, nothing special.
```

### Test Negative Sentiment

Enter:

```text
This is the worst product I have ever bought.
```

Expected sentiment:

```text
Negative
```

### Test CSV Analysis

Create a file such as:

```csv
review
I absolutely love this product!
The product is okay, nothing special.
This product is terrible.
Great quality and excellent service.
I am extremely disappointed.
```

Upload it through the **Batch Analysis** section.

---

## 🌐 Deployment

### Frontend — Vercel

Moodify's React frontend is deployed on Vercel.

🌐 **Live Application:**

https://moodifyweb.vercel.app/

The production frontend communicates with the Render backend using:

```env
VITE_API_URL=https://moodify-webapp-kgym.onrender.com
```

---

### Backend — Render

The Flask backend is deployed on Render.

🌐 **Backend URL:**

https://moodify-webapp-kgym.onrender.com/

The backend handles:

- Model inference
- CSV processing
- Firebase authentication
- Firestore writes
- History retrieval
- Statistics

---

### Database — Firebase

Firebase Firestore is used to store sentiment predictions.

Each prediction contains information such as:

```text
text
sentiment
confidence
timestamp
source
```

---

## 🔐 Security

Sensitive Firebase credentials are intentionally excluded from the repository.

The backend `.gitignore` contains:

```gitignore
__pycache__/
*.pyc
.env

# Firebase credentials
moodify-firebase-key.json

# Local testing
test_firebase.py
test.csv
.DS_Store
```

Never expose Firebase service-account credentials in:

- GitHub repositories
- Frontend source code
- Client-side JavaScript
- Public `.env` files
- Screenshots
- Documentation

For production deployment, Firebase credentials should be provided through secure environment variables or secret management.

---

## 📊 Project Capabilities

| Capability | Status |
|---|---|
| Single Review Analysis | ✅ |
| Custom BiLSTM Model | ✅ |
| PyTorch Inference | ✅ |
| Confidence Score | ✅ |
| CSV Batch Analysis | ✅ |
| Positive / Neutral / Negative Classification | ✅ |
| Firebase Firestore Integration | ✅ |
| Prediction History | ✅ |
| Dashboard Statistics | ✅ |
| REST API | ✅ |
| Responsive UI | ✅ |
| Dark / Light Theme | ✅ |
| Vercel Deployment | ✅ |
| Render Deployment | ✅ |

---

## 🔮 Future Improvements

Potential improvements include:

- 📌 Improve model accuracy and confidence calibration
- 📌 Train on larger and more diverse datasets
- 📌 Add sentiment trend visualizations
- 📌 Add advanced history filtering
- 📌 Add user authentication
- 📌 Add personalized dashboards
- 📌 Add multilingual sentiment analysis
- 📌 Add sentiment trends over time
- 📌 Add export functionality for analysis results
- 📌 Add automated model evaluation and monitoring
- 📌 Build an automated model retraining pipeline

---

## 👨‍💻 Author

### Priyanshu Ranjan

**B.Tech Computer Science — Artificial Intelligence & Machine Learning**

GitHub:

https://github.com/priyanshuranjan02

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is developed for educational, academic, and project demonstration purposes.
