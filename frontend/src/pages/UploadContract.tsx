import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { uploadContract } from "../store/slices/contractsSlice";

const UploadContract = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.contracts);

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    vendor: "",
    description: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setValidationError("");

      // Auto-fill title from filename if not already set
      if (!formData.title) {
        const fileName = uploadedFile.name.replace(/\.[^/.]+$/, "");
        setFormData({ ...formData, title: fileName });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        setValidationError("File is too large. Maximum size is 50MB.");
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setValidationError("Invalid file type. Only PDF and DOCX files are allowed.");
      } else {
        setValidationError(rejection.errors[0].message);
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setValidationError("Please select a file to upload");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    if (formData.vendor) data.append("vendor", formData.vendor);
    if (formData.description) data.append("description", formData.description);

    // Simulate progress for better UX
    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    const result = await dispatch(uploadContract(data));

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (uploadContract.fulfilled.match(result)) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } else {
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black">
          UPLOAD <span className="text-yellow-600">CONTRACT</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700 font-medium">
          Upload a PDF or DOCX contract for AI-powered analysis
        </p>
      </div>

      {/* Error Display */}
      {(error || validationError) && (
        <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg font-medium">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error || validationError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="bg-white rounded-xl border-4 border-black p-6 shadow-xl">
          <h3 className="text-xl font-black text-black mb-4">
            CONTRACT DOCUMENT
          </h3>

          {!file ? (
            <div
              {...getRootProps()}
              className={`border-4 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-black hover:border-yellow-400 hover:bg-yellow-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto h-20 w-20 text-gray-600 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              {isDragActive ? (
                <p className="text-xl text-black font-black">
                  DROP FILE HERE...
                </p>
              ) : (
                <>
                  <p className="text-xl text-black font-black mb-2">
                    DRAG & DROP YOUR CONTRACT
                  </p>
                  <p className="text-sm text-gray-600 font-medium mb-4">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-500 font-bold">
                    SUPPORTS: PDF, DOCX (MAX 50MB)
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border-2 border-black rounded-lg p-6 bg-yellow-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-lg bg-black flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-bold text-black">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-4 text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-black font-bold">UPLOADING...</span>
                    <span className="text-sm font-black text-yellow-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 border-2 border-black">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contract Details */}
        <div className="bg-white rounded-xl border-4 border-black p-6 shadow-xl">
          <h3 className="text-xl font-black text-black mb-4">
            CONTRACT DETAILS
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-bold text-black mb-2"
              >
                TITLE <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                placeholder="e.g., Master Service Agreement"
              />
            </div>

            <div>
              <label
                htmlFor="vendor"
                className="block text-sm font-bold text-black mb-2"
              >
                VENDOR / PARTNER NAME
              </label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                placeholder="e.g., Acme Corporation"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-black mb-2"
              >
                DESCRIPTION
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                placeholder="Brief description of the contract..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border-2 border-black rounded-lg font-bold text-black bg-white hover:bg-gray-100 transition transform hover:scale-105"
          >
            CANCEL
          </button>

          <button
            type="submit"
            disabled={!file || loading}
            className="inline-flex items-center px-8 py-3 border-2 border-black rounded-lg shadow-md font-black text-yellow-400 bg-black hover:bg-gray-900 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                UPLOADING...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Contract
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              What happens after upload?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Your contract will be securely stored in the cloud</li>
                <li>Text extraction will begin automatically</li>
                <li>AI will analyze parties, dates, amounts, and key clauses</li>
                <li>Risk analysis will identify potential issues</li>
                <li>You can review and edit extracted information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadContract;
