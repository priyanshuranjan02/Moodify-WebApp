from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
import torch
from flask_cors import CORS
import os
import csv
import io
from datetime import datetime

# ====================== FIREBASE SETUP ======================
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("backend/moodify-firebase-key.json")   # <-- MAKE SURE NAME MATCHES
firebase_admin.initialize_app(cred)
db = firestore.client()

# ====================== FLASK APP ==========================
app = Flask(__name__)
CORS(app)

# ====================== LOAD MODEL =========================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "model")

config = AutoConfig.from_pretrained(MODEL_PATH, local_files_only=True)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH, config=config, local_files_only=True
)
model.eval()

print("🔥 Model loaded successfully!")


# ====================== PREDICTION LOGIC ====================
def predict_sentiment(text: str):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        output = model(**tokens)
        probs = torch.softmax(output.logits, dim=1)

    predicted = torch.argmax(probs).item()
    confidence = float(probs[0][predicted].item())

    label_map = {
        0: "Very Negative",
        1: "Negative",
        2: "Neutral",
        3: "Positive",
        4: "Very Positive",
    }

    return {
        "sentiment": label_map[predicted],
        "confidence": round(confidence, 4),
    }


# ====================== SINGLE TEXT PREDICTION ====================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("text", "")

    if text.strip() == "":
        return jsonify({"error": "No text provided"}), 400

    result = predict_sentiment(text)

    # SAVE INTO FIRESTORE
    db.collection("sentiments").add({
        "text": text,
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "timestamp": datetime.utcnow()
    })

    return jsonify(result)


# ====================== CSV PREDICTION ====================
@app.route("/predict/csv", methods=["POST"])
def predict_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    import csv
    import io

    # Read CSV content
    content = file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    # Detect which column contains the review text
    headers = [h.strip().lower() for h in reader.fieldnames]

    possible_columns = ["review", "reviews", "text", "content", "comment", "message"]
    review_column = None

    for col in headers:
        if col in possible_columns:
            review_column = col
            break

    # If still not found, fallback to 2nd column (most common case)
    if not review_column:
        review_column = headers[1]  # column at index 1 normally contains review text

    results = {
        "very_positive": 0,
        "positive": 0,
        "neutral": 0,
        "negative": 0,
        "very_negative": 0,
        "total": 0
    }

    # Process each row
    for row in reader:
        text = row.get(review_column)
        if not text or text.strip() == "":
            continue

        pred = predict_sentiment(text)
        sentiment = pred["sentiment"]
        confidence = pred["confidence"]

        # Save every row in Firebase
        db.collection("sentiments").add({
            "text": text,
            "sentiment": sentiment,
            "confidence": confidence,
            "timestamp": datetime.utcnow()
        })

        results["total"] += 1

        if sentiment == "Very Positive":
            results["very_positive"] += 1
        elif sentiment == "Positive":
            results["positive"] += 1
        elif sentiment == "Neutral":
            results["neutral"] += 1
        elif sentiment == "Negative":
            results["negative"] += 1
        elif sentiment == "Very Negative":
            results["very_negative"] += 1

    return jsonify(results)


# ====================== GET HISTORY (FOR FRONTEND) ====================
@app.route("/history", methods=["GET"])
def get_history():
    docs = db.collection("sentiments") \
        .order_by("timestamp", direction=firestore.Query.DESCENDING) \
        .limit(200) \
        .stream()

    history = []
    for doc in docs:
        d = doc.to_dict()
        history.append({
            "text": d.get("text", ""),
            "sentiment": d.get("sentiment", ""),
            "confidence": d.get("confidence", 0),
            "timestamp": d.get("timestamp").isoformat() if d.get("timestamp") else ""
        })

    return jsonify(history)


# ====================== GET STATS ====================
@app.route("/stats", methods=["GET"])
def get_stats():
    docs = db.collection("sentiments").stream()

    total = 0
    positive = 0
    negative = 0
    neutral = 0

    for doc in docs:
        s = doc.to_dict().get("sentiment", "")

        total += 1
        if "Positive" in s:
            positive += 1
        elif "Negative" in s:
            negative += 1
        else:
            neutral += 1

    return jsonify({
        "total": total,
        "positive": positive,
        "negative": negative,
        "neutral": neutral
    })

# ====================== ROOT ====================
@app.route("/")
def home():
    return "🔥 Moodify Backend with Firebase Running!"


# ====================== RUN APP ====================
if __name__ == "__main__":
    app.run(port=5000, debug=True)