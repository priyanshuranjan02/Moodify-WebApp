from flask import Flask, request, jsonify
from flask_cors import CORS

import torch
import torch.nn as nn

import json
import csv
import io
import os
import re
import requests

from datetime import datetime, timezone

from google.oauth2 import service_account
from google.auth.transport.requests import Request


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "moodify_bilstm_final.pt"
)

VOCAB_PATH = os.path.join(
    BASE_DIR,
    "moodify_vocab.json"
)

CONFIG_PATH = os.path.join(
    BASE_DIR,
    "moodify_model_config.json"
)

FIREBASE_KEY_PATH = os.path.join(
    BASE_DIR,
    "moodify-firebase-key.json"
)


# ============================================================
# FIREBASE CONFIGURATION
# ============================================================

FIREBASE_PROJECT_ID = None

if os.path.exists(FIREBASE_KEY_PATH):

    with open(
        FIREBASE_KEY_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        firebase_config = json.load(f)

    FIREBASE_PROJECT_ID = firebase_config.get(
        "project_id"
    )

else:

    print(
        "⚠️ Firebase key not found locally."
    )


FIRESTORE_BASE_URL = (
    "https://firestore.googleapis.com/v1/projects/"
    f"{FIREBASE_PROJECT_ID}/databases/(default)/documents"
)


# ============================================================
# FIREBASE AUTHENTICATION
# ============================================================

firebase_credentials = None


def get_firestore_token():

    global firebase_credentials

    if not os.path.exists(FIREBASE_KEY_PATH):

        raise Exception(
            "Firebase service-account key not found."
        )

    if firebase_credentials is None:

        firebase_credentials = (
            service_account.Credentials.from_service_account_file(

                FIREBASE_KEY_PATH,

                scopes=[
                    "https://www.googleapis.com/auth/datastore"
                ]
            )
        )

    if (
        firebase_credentials.expired
        or firebase_credentials.token is None
    ):

        firebase_credentials.refresh(
            Request()
        )

    return firebase_credentials.token


# ============================================================
# FIRESTORE REST WRITE
# ============================================================

def firestore_add(data):

    token = get_firestore_token()

    url = (
        f"{FIRESTORE_BASE_URL}"
        "/sentiments"
    )

    payload = {
        "fields": {}
    }

    for key, value in data.items():

        if isinstance(value, str):

            payload["fields"][key] = {
                "stringValue": value
            }

        elif isinstance(value, bool):

            payload["fields"][key] = {
                "booleanValue": value
            }

        elif isinstance(value, int):

            payload["fields"][key] = {
                "integerValue": str(value)
            }

        elif isinstance(value, float):

            payload["fields"][key] = {
                "doubleValue": value
            }

        elif isinstance(value, datetime):

            payload["fields"][key] = {
                "timestampValue":
                    value.astimezone(
                        timezone.utc
                    ).isoformat()
                    .replace(
                        "+00:00",
                        "Z"
                    )
            }

    response = requests.post(

        url,

        headers={
            "Authorization":
                f"Bearer {token}",

            "Content-Type":
                "application/json"
        },

        json=payload,

        timeout=30
    )

    if not response.ok:

        raise Exception(
            f"Firestore write failed: "
            f"{response.status_code} "
            f"{response.text}"
        )

    return response.json()


# ============================================================
# MODEL CONFIGURATION
# ============================================================

with open(
    CONFIG_PATH,
    "r",
    encoding="utf-8"
) as f:

    MODEL_CONFIG = json.load(f)


VOCAB_SIZE = MODEL_CONFIG["vocab_size"]
EMBEDDING_DIM = MODEL_CONFIG["embedding_dim"]
HIDDEN_DIM = MODEL_CONFIG["hidden_dim"]
NUM_LAYERS = MODEL_CONFIG["num_layers"]
NUM_CLASSES = MODEL_CONFIG["num_classes"]
DROPOUT = MODEL_CONFIG["dropout"]
MAX_LENGTH = MODEL_CONFIG["max_length"]

PAD_TOKEN = MODEL_CONFIG["pad_token"]
UNK_TOKEN = MODEL_CONFIG["unk_token"]

LABEL_MAPPING = {
    int(k): v
    for k, v in MODEL_CONFIG[
        "label_mapping"
    ].items()
}

MOODIFY_MAPPING = {
    int(k): v
    for k, v in MODEL_CONFIG[
        "moodify_mapping"
    ].items()
}


# ============================================================
# VOCABULARY
# ============================================================

with open(
    VOCAB_PATH,
    "r",
    encoding="utf-8"
) as f:

    VOCAB = json.load(f)


PAD_INDEX = VOCAB.get(
    PAD_TOKEN,
    0
)

UNK_INDEX = VOCAB.get(
    UNK_TOKEN,
    1
)


# ============================================================
# MODEL
# ============================================================

class MoodifyBiLSTM5Class(nn.Module):

    def __init__(
        self,
        vocab_size,
        embedding_dim,
        hidden_dim,
        num_layers,
        num_classes,
        dropout
    ):

        super().__init__()

        self.embedding = nn.Embedding(
            vocab_size,
            embedding_dim,
            padding_idx=PAD_INDEX
        )

        self.lstm = nn.LSTM(

            input_size=embedding_dim,

            hidden_size=hidden_dim,

            num_layers=num_layers,

            batch_first=True,

            bidirectional=True,

            dropout=(
                dropout
                if num_layers > 1
                else 0
            )
        )

        self.dropout = nn.Dropout(
            dropout
        )

        self.fc = nn.Linear(
            hidden_dim * 2,
            num_classes
        )

    def forward(self, x):

        embedded = self.embedding(x)

        output, (hidden, cell) = (
            self.lstm(embedded)
        )

        # Last forward and backward states
        forward_hidden = hidden[-2]

        backward_hidden = hidden[-1]

        hidden_combined = torch.cat(
            (
                forward_hidden,
                backward_hidden
            ),
            dim=1
        )

        hidden_combined = self.dropout(
            hidden_combined
        )

        logits = self.fc(
            hidden_combined
        )

        return logits


# ============================================================
# MODEL LOADING
# ============================================================

model = None

torch.set_num_threads(1)


def load_model():

    global model

    if model is not None:
        return

    print(
        "🔥 Loading Moodify Custom BiLSTM..."
    )

    model = MoodifyBiLSTM5Class(

        vocab_size=VOCAB_SIZE,

        embedding_dim=EMBEDDING_DIM,

        hidden_dim=HIDDEN_DIM,

        num_layers=NUM_LAYERS,

        num_classes=NUM_CLASSES,

        dropout=DROPOUT
    )

    state_dict = torch.load(

        MODEL_PATH,

        map_location="cpu",

        weights_only=True
    )

    model.load_state_dict(
        state_dict
    )

    model.eval()

    print(
        "✅ Moodify Custom BiLSTM loaded"
    )


# ============================================================
# TEXT TOKENIZATION
# ============================================================

def tokenize(text):

    text = text.lower()

    text = re.sub(
        r"[^a-z0-9\s']",
        " ",
        text
    )

    tokens = text.split()

    token_ids = [

        VOCAB.get(
            token,
            UNK_INDEX
        )

        for token in tokens
    ]

    token_ids = token_ids[
        :MAX_LENGTH
    ]

    if len(token_ids) < MAX_LENGTH:

        token_ids += [

            PAD_INDEX
        ] * (
            MAX_LENGTH
            - len(token_ids)
        )

    return token_ids


# ============================================================
# SENTIMENT PREDICTION
# ============================================================

def predict_sentiment(text):

    load_model()

    token_ids = tokenize(
        text
    )

    input_tensor = torch.tensor(
        [token_ids],
        dtype=torch.long
    )

    with torch.no_grad():

        logits = model(
            input_tensor
        )

        probabilities = torch.softmax(
            logits,
            dim=1
        )

    predicted_class = int(
        torch.argmax(
            probabilities,
            dim=1
        ).item()
    )

    confidence = float(
        probabilities[
            0,
            predicted_class
        ].item()
    )

    five_class_sentiment = LABEL_MAPPING[
        predicted_class
    ]

    moodify_sentiment = MOODIFY_MAPPING[
        predicted_class
    ]

    return {

        "sentiment":
            moodify_sentiment,

        "confidence":
            round(
                confidence,
                4
            ),

        "five_class":
            five_class_sentiment,

        "class_id":
            predicted_class
    }


# ============================================================
# HEALTH
# ============================================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    try:

        load_model()

        return jsonify({

            "status":
                "healthy",

            "model":
                "Moodify Custom BiLSTM",

            "model_loaded":
                model is not None
        })

    except Exception as e:

        return jsonify({

            "status":
                "unhealthy",

            "error":
                str(e)

        }), 500


# ============================================================
# ROOT
# ============================================================

@app.route("/")
def home():

    return (
        "🔥 Moodify Backend "
        "(Custom BiLSTM + Firebase REST) Running!"
    )


# ============================================================
# TEXT PREDICTION
# ============================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        text = data.get(
            "text",
            ""
        ).strip()

        if not text:

            return jsonify({

                "error":
                    "No text provided"

            }), 400

        result = predict_sentiment(
            text
        )

        firestore_add({

            "text":
                text,

            "sentiment":
                result["sentiment"],

            "confidence":
                result["confidence"],

            "timestamp":
                datetime.now(
                    timezone.utc
                ),

            "source":
                "text"
        })

        return jsonify({

            "sentiment":
                result["sentiment"],

            "confidence":
                result["confidence"]

        })

    except Exception as e:

        print(
            f"❌ Prediction error: {e}"
        )

        return jsonify({

            "error":
                "Failed to analyze sentiment",

            "details":
                str(e)

        }), 500


# ============================================================
# CSV PREDICTION
# ============================================================

@app.route(
    "/predict/csv",
    methods=["POST"]
)
def predict_csv():

    try:

        file = request.files.get(
            "file"
        )

        if not file:

            return jsonify({

                "error":
                    "No file uploaded"

            }), 400

        content = file.read().decode(
            "utf-8",
            errors="ignore"
        )

        reader = csv.DictReader(
            io.StringIO(content)
        )

        if not reader.fieldnames:

            return jsonify({

                "error":
                    "CSV has no headers"

            }), 400

        # Preserve original header names
        # while matching case-insensitively.
        header_map = {

            h.lower().strip():
                h

            for h in reader.fieldnames
        }

        text_col_lower = next(

            (
                column

                for column in [
                    "review",
                    "text",
                    "content",
                    "comment"
                ]

                if column in header_map
            ),

            None
        )

        if not text_col_lower:

            return jsonify({

                "error":
                    "No review/text column found"

            }), 400

        text_col = header_map[
            text_col_lower
        ]

        results = {

            "positive":
                0,

            "neutral":
                0,

            "negative":
                0,

            "total":
                0
        }

        for row in reader:

            text = (
                row.get(
                    text_col,
                    ""
                ) or ""
            ).strip()

            if not text:
                continue

            prediction = (
                predict_sentiment(
                    text
                )
            )

            firestore_add({

                "text":
                    text,

                "sentiment":
                    prediction[
                        "sentiment"
                    ],

                "confidence":
                    prediction[
                        "confidence"
                    ],

                "timestamp":
                    datetime.now(
                        timezone.utc
                    ),

                "source":
                    "csv"
            })

            sentiment = prediction[
                "sentiment"
            ].lower()

            results[
                sentiment
            ] += 1

            results[
                "total"
            ] += 1

        return jsonify(
            results
        )

    except Exception as e:

        print(
            f"❌ CSV error: {e}"
        )

        return jsonify({

            "error":
                "Failed to analyze CSV",

            "details":
                str(e)

        }), 500


# ============================================================
# HISTORY
# ============================================================

@app.route(
    "/history",
    methods=["GET"]
)
def history():

    try:

        token = get_firestore_token()

        url = (
            f"{FIRESTORE_BASE_URL}"
            "/sentiments"
            "?pageSize=300"
        )

        response = requests.get(

            url,

            headers={
                "Authorization":
                    f"Bearer {token}"
            },

            timeout=30
        )

        if not response.ok:

            raise Exception(
                f"Firestore history request "
                f"failed: {response.status_code} "
                f"{response.text}"
            )

        response_data = (
            response.json()
        )

        documents = response_data.get(
            "documents",
            []
        )

        data = []

        for document in documents:

            fields = document.get(
                "fields",
                {}
            )

            text = fields.get(
                "text",
                {}
            ).get(
                "stringValue"
            )

            sentiment = fields.get(
                "sentiment",
                {}
            ).get(
                "stringValue"
            )

            confidence_field = (
                fields.get(
                    "confidence",
                    {}
                )
            )

            if "doubleValue" in (
                confidence_field
            ):

                confidence = float(
                    confidence_field[
                        "doubleValue"
                    ]
                )

            elif "integerValue" in (
                confidence_field
            ):

                confidence = float(
                    confidence_field[
                        "integerValue"
                    ]
                )

            else:

                confidence = None

            timestamp = fields.get(
                "timestamp",
                {}
            ).get(
                "timestampValue"
            )

            data.append({

                "text":
                    text,

                "sentiment":
                    sentiment,

                "confidence":
                    confidence,

                "timestamp":
                    timestamp
            })

        # Newest first
        data.sort(

            key=lambda item:
                item["timestamp"]
                or "",

            reverse=True
        )

        data = data[:200]

        return jsonify(
            data
        )

    except Exception as e:

        print(
            f"❌ History error: {e}"
        )

        return jsonify({

            "error":
                "Failed to fetch history",

            "details":
                str(e)

        }), 500


# ============================================================
# STATS
# ============================================================

@app.route(
    "/stats",
    methods=["GET"]
)
def stats():

    try:

        token = get_firestore_token()

        url = (
            f"{FIRESTORE_BASE_URL}"
            "/sentiments"
            "?pageSize=300"
        )

        response = requests.get(

            url,

            headers={
                "Authorization":
                    f"Bearer {token}"
            },

            timeout=30
        )

        if not response.ok:

            raise Exception(
                f"Firestore stats request "
                f"failed: {response.status_code} "
                f"{response.text}"
            )

        response_data = (
            response.json()
        )

        documents = response_data.get(
            "documents",
            []
        )

        statistics = {

            "positive":
                0,

            "neutral":
                0,

            "negative":
                0,

            "total":
                0
        }

        for document in documents:

            fields = document.get(
                "fields",
                {}
            )

            sentiment = fields.get(
                "sentiment",
                {}
            ).get(
                "stringValue",
                ""
            ).lower()

            if sentiment in [
                "positive",
                "neutral",
                "negative"
            ]:

                statistics[
                    sentiment
                ] += 1

            statistics[
                "total"
            ] += 1

        return jsonify(
            statistics
        )

    except Exception as e:

        print(
            f"❌ Stats error: {e}"
        )

        return jsonify({

            "error":
                "Failed to fetch statistics",

            "details":
                str(e)

        }), 500


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(

        host="0.0.0.0",

        port=port
    )