import sys
import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename  # Protects against directory traversal attacks
from flask_cors import CORS  # Enable Cross-Origin Resource Sharing
import subprocess
from datetime import datetime
from collections import deque  # Efficient fixed-size history tracker

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

        # Run processing
        output_filepath, output_filename = process_system_log(filepath, selected_model)

        if output_filepath:
            output_df = pd.read_csv(output_filepath)
            json_data = output_df.to_dict(orient="records")

            # Track prediction metadata in memory
            history.appendleft({
                "timestamp": datetime.utcnow().isoformat(),
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
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
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

# === HTTPS Launch (with self-signed certs during development) ===
# Reference: https://flask.palletsprojects.com/en/2.2.x/cli/#development-server
if __name__ == "__main__":
    context = ('/home/ec2-user/cert.pem', '/home/ec2-user/key.pem')
    app.run(host="0.0.0.0", port=8080, ssl_context=context, debug=True)

