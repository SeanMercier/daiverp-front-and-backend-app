import numpy as np
import json

# === Main Inference Function ===
def predict_fn(input_data, model):
    """
    Prepares input and sends it to the model for prediction.

    This function ensures the input shape is (n_samples, n_features),
    which is required for scikit-learn models.

    Ref: https://scikit-learn.org/stable/glossary.html#term-feature-matrix
    """
    print("Inside predict_fn - Received input shape:", input_data.shape)

    # Reshape input to 2D array (if not already)
    input_data = np.array(input_data).reshape(-1, input_data.shape[-1])
    print("Inside predict_fn - Fixed input shape:", input_data.shape)

    return model.predict(input_data)

# === Format Output for Serving API ===
def output_fn(prediction, accept="application/json"):
    """
    Formats model output as a JSON-serializable dictionary.

    This follows conventions used in inference APIs (e.g. AWS SageMaker).
    Ref: https://docs.aws.amazon.com/sagemaker/latest/dg/your-algorithms-inference-code.html
    """
    output = {"predictions": prediction.tolist()}
    return type("Response", (object,), {"body": json.dumps(output), "status_code": 200})

# === Load Trained RandomForest Model ===
# Ref: https://joblib.readthedocs.io/en/latest/generated/joblib.load.html
import joblib
model = joblib.load("/home/ec2-user/model/daiverp_rf_model.pkl")

