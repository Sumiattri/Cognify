import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    try {
      const response = await fetch(
        "https://notebooklm-6hyr.onrender.com/upload/pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);

        navigate("/chat", {
          replace: true,
          state: {
            uploadedFilename: data.cloudinaryUrl,
            originalFileName: data.originalFileName,
          },
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "File upload failed.");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Network error or server unavailable.");
    } finally {
      setUploading(false);
    }
  };

  return (
    // ... (your existing UploadPage JSX for file input and button) ...
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center justify-center p-8 bg-white   rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 ">
          Upload PDF to start chatting
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200 w-full mb-6">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-16 h-16 text-purple-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="text-gray-700 text-lg">
              Click or drag and drop your file here
            </p>
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-2">
                Selected:{" "}
                <span className="font-semibold">{selectedFile.name}</span>
              </p>
            )}
          </label>
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload and Start Chatting"}
        </button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default UploadPage;
