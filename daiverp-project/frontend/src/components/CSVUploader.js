import React, { useState } from "react";
import "./CSVUploader.css";

function CSVUploader({ onUploadSuccess }) {
  // === State Hooks ===
  const [dragging, setDragging] = useState(false);           // Used for drag styling
  const [selectedFile, setSelectedFile] = useState(null);    // Holds the current selected file
  const [uploadStatus, setUploadStatus] = useState("");      // Status messages for the UI
  const [downloadUrl, setDownloadUrl] = useState("");        // Link to download predictions
  const [selectedModel, setSelectedModel] = useState("V1");  // User-selected model version

  // API endpoint — dynamically resolve hostname to support HTTPS with EC2 IP or domain
  const apiUrl = `https://${window.location.hostname}:8080/upload`;

  // Prevent default browser behavior on drag/drop
  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Highlight drop area when dragging
  const handleDragOver = (event) => {
    preventDefaults(event);
    setDragging(true);
  };

  // Remove drag highlight when leaving area
  const handleDragLeave = (event) => {
    preventDefaults(event);
    setDragging(false);
  };

  // Handle file drop via drag-and-drop
  const handleDrop = (event) => {
    preventDefaults(event);
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  };

  // Handle file selection via file picker
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) validateAndUpload(file);
  };

  // Change selected model version (V1 or V2)
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  // Validate file type before uploading
  const validateAndUpload = (file) => {
    if (!file.name.endsWith(".csv")) {
      setUploadStatus("Invalid file type. Please upload a .csv file.");
      return;
    }
    setSelectedFile(file);
    uploadFile(file);
  };

  // Upload file via FormData + Fetch API
  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", selectedModel); // Add selected model info

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setDownloadUrl(data.download_url);
      onUploadSuccess(data); // Pass response to parent (Dashboard.js)
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Upload failed. Please check the server and try again.");
    }
  };

  // === Component UI ===
  return (
    <div className="upload-container">
      {/* Dropdown to select model version */}
      <div className="model-selector">
        <label htmlFor="model-select">Choose Model Version:</label>
        <select id="model-select" value={selectedModel} onChange={handleModelChange}>
          <option value="V1">DAIVERP Model V1</option>
          <option value="V2">DAIVERP Model V2</option>
        </select>
      </div>

      {/* Drag-and-drop zone + file input */}
      <div
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragEnter={preventDefaults}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag & Drop or Click to Upload</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      {/* File metadata and UI status */}
      {selectedFile && <p className="file-info">File Selected: {selectedFile.name}</p>}
{uploadStatus && <p className="upload-status">{uploadStatus}</p>}

    </div>
  );
}

export default CSVUploader;

