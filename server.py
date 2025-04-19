import sys
import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename  # Protects against directory traversal attacks
from flask_cors import CORS  # Enable Cross-Origin Resource Sharing
import subprocess
from datetime import datetime, timedelta
from collections import deque, Counter  # Efficient fixed-size history tracker

# Add the model directory to Python's module search path
# Reference: https://stackoverflow.com/questions/4383571/importing-files-from-different-folder
sys.path.insert(0, "/home/ec2-user/model")

# === Flask App Setup ===
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # Max file upload: 500MB
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes

# === Directory Configs ===
UPLOAD_FOLDER = "/home/ec2-user/uploads"
PREDICTIONS_FOLDER = "/home/ec2-user/predictions"
MODEL_FOLDER = "/home/ec2-user/model"

# Create necessary folders if they don’t exist
# Ref: https://realpython.com/working-with-files-in-python/#creating-directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREDICTIONS_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"csv"}  # Only accept CSV uploads

# === In-Memory History Store ===
# Using deque ensures max 10 recent jobs are stored efficiently
# Reference: https://docs.python.org/3/library/collections.html#collections.deque
history = deque(maxlen=10)

# === In-Memory Queues and Active User Tracking ===
prediction_queue = []
active_users = {}  # key = IP, value = last seen timestamp

# === Utility: Validate allowed file extensions ===
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# === Route: Root Health Check ===
@app.route("/")
def home():
    return "Server is running!"

# === Route: Upload a system log and trigger prediction ===
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        print(f"📂 Uploaded File Path: {filepath}")

        selected_model = request.form.get("model", "V1")
        print(f"🔍 Selected model from user: {selected_model}")

        # Simulate job queue
        job_id = f"job_{datetime.now().isoformat()}"
        prediction_queue.append(job_id)

        # Track active user IP
        user_ip = request.remote_addr
        active_users[user_ip] = datetime.now()

        # Run processing
        output_filepath, output_filename = process_system_log(filepath, selected_model)

        # Remove job from queue
        if job_id in prediction_queue:
            prediction_queue.remove(job_id)

        if output_filepath:
            output_df = pd.read_csv(output_filepath)
            json_data = output_df.to_dict(orient="records")

            # Track prediction metadata in memory
            history.appendleft({
                "timestamp": datetime.now().isoformat(),
                "filename": output_filename,
                "model": selected_model
            })

            return jsonify({
                "message": "Processing complete",
                "download_url": f"/download/{output_filename}",
                "predictions": json_data
            })
        else:
            return jsonify({"error": "Processing failed"}), 500

    return jsonify({"error": "Invalid file format"}), 400

# === Helper: Process system log and trigger predict.py script ===
def process_system_log(filepath, user_model_choice):
    try:
        print(f"📂 Checking System Log File: {filepath}")
        if not os.path.exists(filepath):
            print("❌ ERROR: System log file not found!")
            return None, None

        system_log = pd.read_csv(filepath)
        print(f"✅ System Log Loaded: {filepath}, Rows: {len(system_log)}")

        cve_log_path = os.path.join(MODEL_FOLDER, "cve_log.csv")
        print(f"📂 Checking CVE Log File: {cve_log_path}")
        if not os.path.exists(cve_log_path):
            print("❌ ERROR: CVE log file not found!")
            return None, None

        model_filename = (
            "daiverp_rf_model_V2.pkl" if user_model_choice == "V2"
            else "daiverp_rf_model_V1.pkl"
        )

        # Create timestamped filename to avoid overwriting
        # Reference: https://stackoverflow.com/questions/10607688/how-to-create-a-file-name-with-the-current-date-time-in-python
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        output_filename = f"predictions_{timestamp}.csv"
        prediction_output = os.path.join(PREDICTIONS_FOLDER, output_filename)

        # Run the prediction script with required args
        # Reference: https://stackoverflow.com/questions/89228/how-to-call-external-command-in-python
        cmd = f"python3 {MODEL_FOLDER}/predict.py {filepath} {cve_log_path} {model_filename} {prediction_output}"
        print(f"🚀 Running Prediction Script: {cmd}")

        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(f"🔍 Prediction Script Output:\n{result.stdout}")

        if result.returncode != 0:
            print(f"❌ ERROR: Prediction script failed!\n{result.stderr}")
            return None, None

        if not os.path.exists(prediction_output):
            print("❌ ERROR: Prediction output file not created!")
            return None, None

        print(f"✅ Predictions Saved: {prediction_output}")
        return prediction_output, output_filename

    except Exception as e:
        print(f"❌ ERROR Processing File: {str(e)}")
        return None, None

# === Route: Download predictions by filename ===
@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    file_path = os.path.join(PREDICTIONS_FOLDER, filename)
    print(f"📂 Checking file at path: {file_path}")

    # Reference: https://flask.palletsprojects.com/en/2.2.x/api/#flask.send_file
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True, mimetype="text/csv")
    else:
        print("❌ ERROR: File not found!")
        return jsonify({"error": "File not found"}), 404

# === Route: Get product list from CVE log ===
@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        cve_log_path = os.path.join(MODEL_FOLDER, "cve_log.csv")
        if not os.path.exists(cve_log_path):
            return jsonify({"error": "CVE log file not found"}), 500

        cve_log = pd.read_csv(cve_log_path)
        unique_products = cve_log["Product"].dropna().unique().tolist()
        return jsonify(unique_products)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === Route: Get recent prediction history ===
@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify(list(history)), 200

# === Route: Admin metrics ===
@app.route("/api/admin/metrics", methods=["GET"])
def get_admin_metrics():
    now = datetime.now()
    cutoff = now - timedelta(days=1)

    # Filter predictions in last 24h
    daily_predictions = sum(
        1 for record in history
        if "timestamp" in record and datetime.fromisoformat(record["timestamp"]) > cutoff
    )

    # Filter active users within last 15 minutes
    active_cutoff = now - timedelta(minutes=15)
    recent_users = [ip for ip, ts in active_users.items() if ts > active_cutoff]

    model_deployed = os.getenv("MODEL_DEPLOYED", "2025-03-30")

    return jsonify({
        "activeUsers": len(recent_users),
        "queueLength": len(prediction_queue),
        "dailyPredictions": daily_predictions,
        "modelDeployed": model_deployed
    })

# === Route: Predictions chart data (with daily, weekly, monthly, all) ===
@app.route("/api/admin/weekly-predictions", methods=["GET"])
def get_weekly_predictions():
    """
    Adjust the predictions based on ?range=all|monthly|weekly|daily
    'all' => no cutoff, group by day of week
    'weekly' => last 7 days, group by day of week
    'daily' => last 24 hours, group by hour
    'monthly' => last 30 days, group by day (e.g. 'Apr 09')
    """
    range_param = request.args.get("range", "weekly").lower().strip()
    now_time = datetime.now()

    # Decide time cutoff and labeling
    if range_param == "daily":
        # last 24 hours, label each hour
        cutoff = now_time - timedelta(days=1)
        label_order = []
        for i in range(24):
            hour_label = (now_time - timedelta(hours=(23 - i))).strftime("%H:00")
            label_order.append(hour_label)

        def get_label(dt):
            return dt.strftime("%H:00")

    elif range_param == "monthly":
        # last 30 days, label by 'Apr 09'
        cutoff = now_time - timedelta(days=30)
        label_order = []
        for i in reversed(range(30)):
            label_str = (now_time - timedelta(days=i)).strftime("%b %d")
            label_order.append(label_str)

        def get_label(dt):
            return dt.strftime("%b %d")

    elif range_param == "all":
        # no cutoff, group by day of week
        cutoff = None
        label_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        def get_label(dt):
            return dt.strftime("%a")

    else:
        # weekly by default
        cutoff = now_time - timedelta(days=7)
        label_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        def get_label(dt):
            return dt.strftime("%a")

    counter_v1 = Counter()
    counter_v2 = Counter()

    for record in history:
        if "timestamp" in record and "model" in record:
            dt = datetime.fromisoformat(record["timestamp"])
            if cutoff and dt < cutoff:
                continue

            label = get_label(dt)
            if label not in label_order:
                continue

            if record["model"] == "V2":
                counter_v2[label] += 1
            else:
                counter_v1[label] += 1

    data_v1 = [counter_v1.get(lbl, 0) for lbl in label_order]
    data_v2 = [counter_v2.get(lbl, 0) for lbl in label_order]

    return jsonify({
        "labels": label_order,
        "v1": data_v1,
        "v2": data_v2
    })



# === Route: Track active users who are visiting (not just uploading) ===
@app.route("/api/ping", methods=["GET"])
def track_active_user():
    user_ip = request.remote_addr
    active_users[user_ip] = datetime.now()
    return jsonify({"message": "pong", "timestamp": datetime.now().isoformat()})

# === Route: Model usage pie chart ===
@app.route("/api/admin/model-usage", methods=["GET"])
def get_model_usage():
    """
    Returns how many times V1 vs V2 have been used across all predictions in history.
    """
    v1_count = 0
    v2_count = 0
    for record in history:
        if "model" in record:
            if record["model"] == "V2":
                v2_count += 1
            else:
                v1_count += 1
    return jsonify({"v1Count": v1_count, "v2Count": v2_count})

# === Route: Daily totals bar chart (last 14 days) ===
@app.route("/api/admin/daily-totals", methods=["GET"])
def get_daily_totals():
    """
    Returns how many predictions happened on each of the last 14 days.
    The response includes 'labels' (day strings) and 'data' (counts).
    """
    now = datetime.utcnow()
    cutoff = now - timedelta(days=14)
    daily_counter = Counter()

    for record in history:
        if "timestamp" in record:
            dt = datetime.fromisoformat(record["timestamp"])
            if dt >= cutoff:
                day_label = dt.strftime("%b %d")  # e.g. 'Apr 12'
                daily_counter[day_label] += 1

    # Build labels for the last 14 days in chronological order
    labels = []
    for i in range(14):
        label_str = (now - timedelta(days=(13 - i))).strftime("%b %d")
        labels.append(label_str)

    data = [daily_counter.get(day, 0) for day in labels]

    return jsonify({
        "labels": labels,
        "data": data
    })


# === HTTPS Launch (with self-signed certs during development) ===
# Reference: https://flask.palletsprojects.com/en/2.2.x/cli/#development-server
if __name__ == "__main__":
    context = ('/home/ec2-user/cert.pem', '/home/ec2-user/key.pem')
    app.run(host="0.0.0.0", port=8080, ssl_context=context, debug=True)

