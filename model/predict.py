import sys
import os
import pandas as pd
import numpy as np
import joblib
import json

# === Configuration Paths ===
MODEL_DIR = "/home/ec2-user/model"
PREDICTIONS_FOLDER = "/home/ec2-user/predictions"
DEFAULT_MODEL_NAME = "daiverp_rf_model_V1.pkl"

# Ensure predictions folder exists
# Ref: https://realpython.com/working-with-files-in-python/#creating-directories
os.makedirs(PREDICTIONS_FOLDER, exist_ok=True)

# === Load a Saved Random Forest Model ===
# Ref: https://joblib.readthedocs.io/en/latest/generated/joblib.load.html
def load_model(model_name):
    model_path = os.path.join(MODEL_DIR, model_name)
    try:
        model = joblib.load(model_path)
        print(f"✅ Model loaded successfully from: {model_path}")
        return model
    except Exception as e:
        print(f"❌ ERROR: Unable to load model from {model_path}: {str(e)}")
        sys.exit(1)

# === Required One-Hot Feature Columns for Model ===
REQUIRED_FEATURES = [
    "Historical_Attack_Data",
    "Criticality_Weight",
    "Normalized_CVSS",
    "Exploit_Status_Yes",
    "Patch_Availability_Not Available",
    "Network_Access_Level_Public",
    "Patch_Level_Up-to-date"
]

# === Preprocessing Function ===
def preprocess_data(combined_df):
    try:
        # Drop unused legacy columns
        if 'Base_Risk' in combined_df.columns:
            combined_df = combined_df.drop(columns=['Base_Risk'])

        # Normalize CVSS score to 0-1
        if 'CVSS_Score' in combined_df.columns:
            combined_df['Normalized_CVSS'] = combined_df['CVSS_Score'] / 10
            combined_df = combined_df.drop(columns=['CVSS_Score'])
        else:
            raise KeyError("❌ ERROR: CVSS_Score column is missing!")

        # Normalize historical attack data (0-1 range)
        # Ref: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.max.html
        if 'Historical_Attack_Data' in combined_df.columns:
            max_val = combined_df['Historical_Attack_Data'].max()
            if max_val != 0:
                combined_df['Historical_Attack_Data'] = combined_df['Historical_Attack_Data'] / max_val

        # Convert text-based severity to weight
        criticality_weights = {'High': 1.0, 'Medium': 0.7, 'Low': 0.4}
        if 'Criticality_Level' in combined_df.columns:
            combined_df['Criticality_Weight'] = combined_df['Criticality_Level'].map(criticality_weights)

        # One-hot encode select categorical fields
        # Ref: https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.get_dummies.html
        categorical_columns = [
            'Exploit_Status',
            'Patch_Availability',
            'Network_Access_Level',
            'Patch_Level'
        ]
        existing = [col for col in categorical_columns if col in combined_df.columns]
        if existing:
            combined_df = pd.get_dummies(combined_df, columns=existing, drop_first=True)

        # Drop extra fields not used for model input
        drop_columns = [
            'CVE_ID', 'Product', 'Description', 'Severity', 'System_ID',
            'Component_Name', 'Software_Version', 'Configuration_Details',
            'Owner', 'Timestamp_x', 'Timestamp_y', 'Criticality_Level'
        ]
        combined_df = combined_df.drop(columns=drop_columns, errors='ignore')

        # Check for any non-numeric columns remaining
        non_numeric = combined_df.select_dtypes(include=['object']).columns
        if len(non_numeric) > 0:
            raise ValueError(f"❌ ERROR: Non-numeric columns detected: {non_numeric}")

        return combined_df

    except Exception as e:
        print(f"❌ ERROR in preprocessing: {str(e)}")
        sys.exit(1)

# === Match System Log to CVE Data and Run Predictions ===
def match_and_predict(system_file, cve_file, model, output_file="predictions.csv"):
    try:
        cve_df = pd.read_csv(cve_file)
        system_df = pd.read_csv(system_file)
        print("✅ System & CVE Logs Loaded Successfully")

        # Match known software products based on version info
        known_products = [
            "Microsoft Windows", "Apache Struts", "Adobe Flash Player", "Oracle Database",
            "Cisco IOS", "OpenSSL", "Linux Kernel", "WordPress",
            "Cisco ASA", "Nginx", "MySQL"
        ]

        # Ref: https://stackoverflow.com/a/675029/13997253
        def extract_product(software_version):
            for product in known_products:
                if isinstance(software_version, str) and product.lower() in software_version.lower():
                    return product
            return None

        system_df['Product'] = system_df['Software_Version'].apply(extract_product)
        print(f"🧠 Extracted product counts:\n{system_df['Product'].value_counts(dropna=False)}")

        # Remove unmatched records
        system_df = system_df.dropna(subset=['Product'])
        matching_products = set(cve_df['Product']) & set(system_df['Product'])
        print(f"🔍 Matching products found: {matching_products}")

        system_df = system_df[system_df['Product'].isin(matching_products)]
        cve_df = cve_df[cve_df['Product'].isin(matching_products)]

        # Downsample to avoid memory overload
        cve_df = cve_df.sample(n=min(500, len(cve_df)), random_state=42)
        system_df = system_df.sample(n=min(500, len(system_df)), random_state=42)

        # Merge system data with relevant CVEs
        merged_df = pd.merge(cve_df, system_df, on="Product", how="inner")
        print(f"📊 Merged dataset size: {len(merged_df)}")

        if merged_df.empty:
            raise ValueError("❌ ERROR: No matching products found between System Log and CVE Log!")

        # Preprocess for model input
        processed_df = preprocess_data(merged_df)

        # Ensure all required model input columns exist
        missing_features = [col for col in model.feature_names_in_ if col not in processed_df.columns]
        if missing_features:
            raise ValueError(f"❌ ERROR: Missing required features: {missing_features}")

        model_input = processed_df[model.feature_names_in_].astype(np.float64)

        # Run predictions in batches
        predictions = []
        batch_size = 500
        for i in range(0, len(model_input), batch_size):
            batch = model_input[i: i + batch_size]
            batch_predictions = model.predict(batch)  # Ref: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html
            predictions.extend(batch_predictions)

        # Format output as percentages
        merged_df['DAIVERP_Risk_Score'] = predictions
        merged_df['DAIVERP_Risk_Score'] = (
            (merged_df['DAIVERP_Risk_Score'] * 100)
            .round(2)
            .astype(str) + "%"
        )

        output_path = output_file if output_file else os.path.join(PREDICTIONS_FOLDER, "predictions.csv")
        merged_df[['CVE_ID', 'System_ID', 'Product', 'DAIVERP_Risk_Score']].to_csv(output_path, index=False)
        print(f"✅ Predictions written to: {output_path}")

        return merged_df[['CVE_ID', 'System_ID', 'Product', 'DAIVERP_Risk_Score']]

    except Exception as e:
        print(f"❌ ERROR in matching & prediction: {str(e)}")
        sys.exit(1)

# === Entry Point Wrapper ===
def predict_exploitability(system_file, cve_file, model_name=DEFAULT_MODEL_NAME, output_file=None):
    model = load_model(model_name)
    try:
        prediction_results = match_and_predict(system_file, cve_file, model, output_file)
        json_output = json.dumps(prediction_results.to_dict(orient="records"), indent=4)
        print("\n✅ Final JSON Output:")
        print(json_output)
        return json_output
    except Exception as e:
        error_message = json.dumps({"error": str(e)})
        print("❌ ERROR:", error_message)
        return error_message

# === CLI Execution Support ===
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python predict.py <system_log.csv> <cve_log.csv> [model_name] [output_file]"}))
    else:
        system_file = sys.argv[1]
        cve_file = sys.argv[2]
        selected_model = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_MODEL_NAME
        output_file = sys.argv[4] if len(sys.argv) > 4 else None
        print(predict_exploitability(system_file, cve_file, selected_model, output_file))

