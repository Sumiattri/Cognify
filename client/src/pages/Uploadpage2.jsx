import {
  Upload,
  FileText,
  Brain,
  ArrowRight,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  MessageSquare,
  BookOpen,
} from "lucide-react";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "@/components/ProfileDropdown";

function UploadPage2({ onNext }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", files[0]);
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
        localStorage.setItem("chatHistory", JSON.stringify(""));
        navigate("/chat", {
          // replace: true,
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

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-[28px]  text-black">Cognify</span>
            </div>
            <div className="flex items-center space-x-8">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12 mt-5">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Upload your documents {/* <br /> */}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                to get started
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Drop your PDFs, research papers, or documents here. Cognify will
              analyze them and prepare an intelligent chat experience.
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8 ">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-400 bg-blue-50/50 scale-105"
                  : files.length > 0
                  ? "border-green-300 bg-green-50/30"
                  : "border-gray-300 bg-white/60 backdrop-blur-sm hover:border-blue-300 hover:bg-blue-50/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleChange}
                className="hidden"
              />

              {files.length === 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        dragActive ? "bg-blue-100 scale-110" : "bg-gray-100"
                      }`}
                    >
                      <Upload
                        className={`w-10 h-10 transition-colors ${
                          dragActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {dragActive
                        ? "Drop your files here"
                        : "Drag & drop your PDFs"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Or click to browse and select files from your computer
                    </p>

                    <button
                      onClick={onButtonClick}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg hover:scale-105 inline-flex items-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Choose Files</span>
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Supports PDF files up to 50MB each
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {files.length} file{files.length > 1 ? "s" : ""} ready to
                    analyze
                  </h3>
                  <p className="text-gray-600">
                    Your documents are ready for AI analysis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Files
              </h3>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors group"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {files.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[200px]"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Start Analysis</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Chat</h3>
              <p className="text-gray-600 text-sm">
                Ask questions and get instant answers from your documents
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI extracts key insights and connections
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Generate Summaries
              </h3>
              <p className="text-gray-600 text-sm">
                Create comprehensive summaries and study guides
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage2;
