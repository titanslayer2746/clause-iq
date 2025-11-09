import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchContractById,
  clearCurrentContract,
} from "../store/slices/contractsSlice";
import {
  getComplianceResult,
  runComplianceCheck,
} from "../store/slices/playbookSlice";
import ChatInterface from "../components/ChatInterface";
import Comments from "../components/Comments";
import ActivityTimeline from "../components/ActivityTimeline";
import api from "../api/client";

const ContractDetail = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentContract, loading, error } = useAppSelector(
    (state) => state.contracts
  );
  const { currentCompliance } = useAppSelector((state) => state.playbook);

  const [extractedData, setExtractedData] = useState<any>(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [aiExtractionLoading, setAiExtractionLoading] = useState(false);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: any }>({});
  const [showChat, setShowChat] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    if (contractId) {
      dispatch(fetchContractById(contractId));
    }

    return () => {
      dispatch(clearCurrentContract());
    };
  }, [contractId, dispatch]);

  useEffect(() => {
    if (currentContract?.extractedDataId) {
      fetchExtractionData();
      fetchComplianceData();
    }
  }, [currentContract]);

  const fetchComplianceData = async () => {
    if (contractId) {
      try {
        await dispatch(getComplianceResult(contractId));
      } catch (error) {
        console.log("No compliance result yet");
      }
    }
  };

  const handleRunCompliance = async () => {
    if (!contractId) return;
    setComplianceLoading(true);
    try {
      await dispatch(runComplianceCheck(contractId));
    } finally {
      setComplianceLoading(false);
    }
  };

  const fetchExtractionData = async () => {
    try {
      const response = await api.get(
        `/extraction/contracts/${contractId}/extraction`
      );
      setExtractedData(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch extraction data:", error);
    }
  };

  const triggerAIAnalysis = async () => {
    setAiExtractionLoading(true);
    try {
      await api.post(`/extraction/contracts/${contractId}/ai-analysis`);
      // Poll for AI analysis status
      pollAIAnalysisStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to start AI analysis");
      setAiExtractionLoading(false);
    }
  };

  const pollAIAnalysisStatus = async () => {
    const maxAttempts = 60;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await api.get(
          `/extraction/contracts/${contractId}/extraction`
        );
        const data = response.data.data;

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          setAiExtractionLoading(false);
          fetchExtractionData();
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setAiExtractionLoading(false);
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setAiExtractionLoading(false);
        }
      }
    }, 3000);
  };

  const enableEdit = (fieldName: string, currentValue: any) => {
    setEditMode({ ...editMode, [fieldName]: true });
    setEditValues({ ...editValues, [fieldName]: currentValue });
  };

  const cancelEdit = (fieldName: string) => {
    const newEditMode = { ...editMode };
    delete newEditMode[fieldName];
    setEditMode(newEditMode);

    const newEditValues = { ...editValues };
    delete newEditValues[fieldName];
    setEditValues(newEditValues);
  };

  const saveEdit = async (fieldName: string) => {
    try {
      await api.patch(`/contracts/${contractId}`, {
        [fieldName]: editValues[fieldName],
      });
      dispatch(fetchContractById(contractId!));
      cancelEdit(fieldName);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update contract");
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    let colorClass = "bg-green-100 text-green-800";
    let label = "High";

    if (confidence < 0.5) {
      colorClass = "bg-red-100 text-red-800";
      label = "Low";
    } else if (confidence < 0.8) {
      colorClass = "bg-yellow-100 text-yellow-800";
      label = "Medium";
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}
      >
        {Math.round(confidence * 100)}% {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 p-6">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-yellow-600"
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
          <p className="mt-4 text-gray-700 font-bold">LOADING CONTRACT...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-2 border-red-500 rounded-xl p-6">
          <div className="flex">
            <svg
              className="h-6 w-6 text-red-600"
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
            <div className="ml-3">
              <h3 className="text-lg font-black text-red-800">ERROR</h3>
              <p className="mt-1 text-sm text-red-700 font-medium">{error}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-3 text-sm font-bold text-black hover:text-yellow-600 underline"
              >
                ← BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentContract) {
    return null;
  }

  const fileAsset = currentContract.fileAssetId;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-black font-bold hover:text-yellow-600 flex items-center mb-4 underline"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            BACK TO DASHBOARD
          </Link>

          <div className="bg-yellow-400 rounded-xl border-4 border-black p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-black">
                  {currentContract.title}
                </h1>
                {currentContract.vendor && (
                  <p className="mt-2 text-lg text-gray-800 font-bold">
                    VENDOR: {currentContract.vendor}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this contract? This action cannot be undone."
                      )
                    ) {
                      try {
                        await api.delete(`/contracts/${contractId}`);
                        navigate("/dashboard");
                      } catch (error: any) {
                        alert(
                          error.response?.data?.message ||
                            "Failed to delete contract"
                        );
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-black border-2 border-black bg-red-600 text-white hover:bg-red-700 transition"
                >
                  DELETE
                </button>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-black border-2 border-black ${
                    currentContract.status === "Approved"
                      ? "bg-green-600 text-white"
                      : currentContract.status === "Pending"
                      ? "bg-white text-black"
                      : currentContract.status === "Reviewed"
                      ? "bg-black text-yellow-400"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {currentContract.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Info */}
            <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
              <h2 className="text-xl font-black text-black mb-4">
                CONTRACT INFORMATION
              </h2>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  {editMode.title ? (
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValues.title}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            title: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => saveEdit("title")}
                        className="text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => cancelEdit("title")}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <dd className="mt-1 text-sm text-gray-900 flex items-center justify-between">
                      <span>{currentContract.title}</span>
                      <button
                        onClick={() =>
                          enableEdit("title", currentContract.title)
                        }
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        Edit
                      </button>
                    </dd>
                  )}
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                  {editMode.vendor ? (
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValues.vendor}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            vendor: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => saveEdit("vendor")}
                        className="text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => cancelEdit("vendor")}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <dd className="mt-1 text-sm text-gray-900 flex items-center justify-between">
                      <span>{currentContract.vendor || "-"}</span>
                      <button
                        onClick={() =>
                          enableEdit("vendor", currentContract.vendor || "")
                        }
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        Edit
                      </button>
                    </dd>
                  )}
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  {editMode.status ? (
                    <div className="mt-1 flex items-center space-x-2">
                      <select
                        value={editValues.status}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            status: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => saveEdit("status")}
                        className="text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => cancelEdit("status")}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <dd className="mt-1 text-sm text-gray-900 flex items-center justify-between">
                      <span
                        className={`font-bold ${
                          currentContract.status === "Approved"
                            ? "text-green-600"
                            : currentContract.status === "Rejected"
                            ? "text-red-600"
                            : currentContract.status === "Reviewed"
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentContract.status}
                      </span>
                      <button
                        onClick={() =>
                          enableEdit("status", currentContract.status)
                        }
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        Edit
                      </button>
                    </dd>
                  )}
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Risk Score
                  </dt>
                  <dd className="mt-1 text-sm">
                    {currentContract.riskScore ? (
                      <span
                        className={`font-semibold ${
                          currentContract.riskScore >= 70
                            ? "text-red-600"
                            : currentContract.riskScore >= 40
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {currentContract.riskScore}/100
                      </span>
                    ) : (
                      <span className="text-gray-400">Not analyzed</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Upload Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(currentContract.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Uploaded By
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {currentContract.uploadedBy?.email || "Unknown"}
                  </dd>
                </div>
              </dl>

              {currentContract.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {currentContract.description}
                  </dd>
                </div>
              )}

              {/* View Document Button */}
              {fileAsset && (
                <div className="mt-6">
                  <a
                    href={fileAsset.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-black rounded-lg shadow-md font-black text-black bg-yellow-400 hover:bg-yellow-300 transition transform hover:scale-105"
                  >
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    VIEW DOCUMENT
                  </a>
                </div>
              )}
            </div>

            {/* Extracted Data */}
            {extractedData ? (
              <div className="space-y-6">
                {/* Parties */}
                {extractedData.extraction?.parties &&
                  extractedData.extraction.parties.length > 0 && (
                    <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
                      <h2 className="text-xl font-black text-black mb-4">
                        PARTIES
                      </h2>
                      <div className="space-y-3">
                        {extractedData.extraction.parties.map(
                          (party: any, index: number) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {party.value}
                                  </p>
                                  {party.sourceSpan?.text && (
                                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                      "{party.sourceSpan.text}"
                                    </p>
                                  )}
                                </div>
                                {party.confidence && (
                                  <div className="ml-4">
                                    {getConfidenceBadge(party.confidence)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Important Dates */}
                {(extractedData.extraction?.dates?.effective ||
                  extractedData.extraction?.dates?.termination ||
                  extractedData.extraction?.dates?.renewal) && (
                  <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
                    <h2 className="text-xl font-black text-black mb-4">
                      IMPORTANT DATES
                    </h2>
                    <div className="space-y-3">
                      {extractedData.extraction.dates.effective && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500">
                                Effective Date
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                {formatDate(
                                  extractedData.extraction.dates.effective.value
                                )}
                              </p>
                              {extractedData.extraction.dates.effective
                                .sourceSpan?.text && (
                                <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  "
                                  {
                                    extractedData.extraction.dates.effective
                                      .sourceSpan.text
                                  }
                                  "
                                </p>
                              )}
                            </div>
                            {extractedData.extraction.dates.effective
                              .confidence && (
                              <div className="ml-4">
                                {getConfidenceBadge(
                                  extractedData.extraction.dates.effective
                                    .confidence
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {extractedData.extraction.dates.termination && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500">
                                Termination Date
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                {formatDate(
                                  extractedData.extraction.dates.termination
                                    .value
                                )}
                              </p>
                              {extractedData.extraction.dates.termination
                                .sourceSpan?.text && (
                                <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  "
                                  {
                                    extractedData.extraction.dates.termination
                                      .sourceSpan.text
                                  }
                                  "
                                </p>
                              )}
                            </div>
                            {extractedData.extraction.dates.termination
                              .confidence && (
                              <div className="ml-4">
                                {getConfidenceBadge(
                                  extractedData.extraction.dates.termination
                                    .confidence
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {extractedData.extraction.dates.renewal && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500">
                                Renewal Date
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                {formatDate(
                                  extractedData.extraction.dates.renewal.value
                                )}
                              </p>
                              {extractedData.extraction.dates.renewal.sourceSpan
                                ?.text && (
                                <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  "
                                  {
                                    extractedData.extraction.dates.renewal
                                      .sourceSpan.text
                                  }
                                  "
                                </p>
                              )}
                            </div>
                            {extractedData.extraction.dates.renewal
                              .confidence && (
                              <div className="ml-4">
                                {getConfidenceBadge(
                                  extractedData.extraction.dates.renewal
                                    .confidence
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Terms */}
                {extractedData.extraction?.amounts &&
                  extractedData.extraction.amounts.length > 0 && (
                    <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
                      <h2 className="text-xl font-black text-black mb-4">
                        FINANCIAL TERMS
                      </h2>
                      <div className="space-y-3">
                        {extractedData.extraction.amounts.map(
                          (amount: any, index: number) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {amount.value}
                                  </p>
                                  {amount.sourceSpan?.text && (
                                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                      "{amount.sourceSpan.text}"
                                    </p>
                                  )}
                                </div>
                                {amount.confidence && (
                                  <div className="ml-4">
                                    {getConfidenceBadge(amount.confidence)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Key Clauses */}
                {extractedData.extraction?.clauses &&
                  extractedData.extraction.clauses.length > 0 && (
                    <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
                      <h2 className="text-xl font-black text-black mb-4">
                        Key Clauses
                      </h2>
                      <div className="space-y-4">
                        {extractedData.extraction.clauses.map(
                          (clause: any, index: number) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {clause.clauseType}
                                  </span>
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {clause.title}
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {clause.content}
                                  </p>
                                  {clause.sourceSpan?.text && (
                                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                      "{clause.sourceSpan.text}"
                                      {clause.sourceSpan.page && (
                                        <span className="ml-2 text-gray-400">
                                          (Page {clause.sourceSpan.page})
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                {clause.confidence && (
                                  <div className="ml-4">
                                    {getConfidenceBadge(clause.confidence)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
                <h2 className="text-xl font-black text-black mb-4">
                  Extracted Information
                </h2>
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">
                    No extracted data available yet
                  </p>
                </div>
              </div>
            )}

            {/* Raw Extracted Text - Accordion */}
            {extractedData && extractedData.rawText && (
              <div className="bg-white rounded-xl border-4 border-black shadow-xl overflow-hidden">
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="w-full px-6 py-4 bg-yellow-400 flex items-center justify-between hover:bg-yellow-300 transition"
                >
                  <h3 className="text-xl font-black text-black flex items-center">
                    <svg
                      className="h-6 w-6 mr-3"
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
                    RAW EXTRACTED TEXT
                  </h3>
                  <svg
                    className={`h-6 w-6 text-black transform transition-transform ${
                      showRawText ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showRawText && (
                  <div className="p-6 border-t-4 border-black">
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                        {extractedData.rawText}
                      </pre>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        <strong>Characters:</strong>{" "}
                        {extractedData.rawText.length.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extractedData.rawText);
                          alert("Text copied to clipboard!");
                        }}
                        className="px-3 py-1 bg-black text-yellow-400 rounded-md font-bold text-xs hover:bg-gray-900 transition"
                      >
                        COPY TEXT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section - Accordion */}
            <div className="bg-white rounded-xl border-4 border-black shadow-xl overflow-hidden">
              <button
                onClick={() => setShowComments(!showComments)}
                className="w-full px-6 py-4 bg-yellow-400 flex items-center justify-between hover:bg-yellow-300 transition"
              >
                <h3 className="text-xl font-black text-black flex items-center">
                  <svg
                    className="h-6 w-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  COMMENTS
                </h3>
                <svg
                  className={`h-6 w-6 text-black transform transition-transform ${
                    showComments ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showComments && (
                <div className="p-6 border-t-4 border-black">
                  <Comments contractId={contractId!} />
                </div>
              )}
            </div>

            {/* Activity Timeline - Accordion */}
            <div className="bg-white rounded-xl border-4 border-black shadow-xl overflow-hidden">
              <button
                onClick={() => setShowActivity(!showActivity)}
                className="w-full px-6 py-4 bg-yellow-400 flex items-center justify-between hover:bg-yellow-300 transition"
              >
                <h3 className="text-xl font-black text-black flex items-center">
                  <svg
                    className="h-6 w-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ACTIVITY TIMELINE
                </h3>
                <svg
                  className={`h-6 w-6 text-black transform transition-transform ${
                    showActivity ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showActivity && (
                <div className="p-6 border-t-4 border-black">
                  <ActivityTimeline contractId={contractId!} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* AI Analysis - Moved to top */}
            <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
              <h3 className="text-xl font-black text-black mb-4">
                AI Analysis
              </h3>
              <div className="space-y-3">
                {extractedData &&
                (!extractedData.parties ||
                  extractedData.parties.length === 0) ? (
                  <button
                    onClick={triggerAIAnalysis}
                    disabled={aiExtractionLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-black rounded-lg shadow-md font-black text-yellow-400 bg-black hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 disabled:transform-none"
                  >
                    {aiExtractionLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-400"
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
                        Running AI Analysis...
                      </>
                    ) : (
                      <>
                        <svg
                          className="-ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Run AI Analysis
                      </>
                    )}
                  </button>
                ) : extractedData?.parties &&
                  extractedData.parties.length > 0 ? (
                  <div className="text-center py-2">
                    <svg
                      className="inline-block h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-1 text-sm font-bold text-black">
                      AI Analysis Completed
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    <p className="text-sm font-bold">
                      Waiting for text extraction...
                    </p>
                  </div>
                )}

                {extractedData && extractedData.qualityFlag && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Text Quality:{" "}
                      <span
                        className={`font-medium ${
                          extractedData.qualityFlag === "high"
                            ? "text-green-600"
                            : extractedData.qualityFlag === "medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {extractedData.qualityFlag.toUpperCase()}
                      </span>
                    </p>
                    {extractedData.pageCount && (
                      <p className="text-xs text-gray-500 mt-1">
                        {extractedData.pageCount} pages extracted
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Section */}
            {extractedData && (
              <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Compliance Check
                  </h3>
                  {!currentCompliance && (
                    <button
                      onClick={handleRunCompliance}
                      disabled={complianceLoading}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {complianceLoading ? "Running..." : "Run Check"}
                    </button>
                  )}
                </div>

                {currentCompliance ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {currentCompliance.score}/100
                        </p>
                        <p
                          className={`text-sm font-medium mt-1 ${
                            currentCompliance.passed
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {currentCompliance.passed ? "PASSED" : "FAILED"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {currentCompliance.passedRules}/
                          {currentCompliance.totalRules} rules passed
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Last checked:{" "}
                          {new Date(
                            currentCompliance.analyzedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {currentCompliance.deviations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Issues Found:
                        </p>
                        {currentCompliance.deviations.map((deviation, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded border ${
                              deviation.severity === "critical"
                                ? "bg-red-50 border-red-200"
                                : deviation.severity === "high"
                                ? "bg-orange-50 border-orange-200"
                                : deviation.severity === "medium"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {deviation.ruleName}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {deviation.message}
                            </p>
                            {deviation.recommendation && (
                              <p className="text-xs text-gray-500 mt-2">
                                → {deviation.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleRunCompliance}
                      disabled={complianceLoading}
                      className="mt-4 w-full text-sm text-center font-bold text-black hover:text-yellow-600 disabled:opacity-50 underline"
                    >
                      RE-RUN CHECK
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      No compliance check run yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Bubble */}
      {extractedData && !showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-black border-4 border-yellow-400 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 group"
          title="Ask AI Assistant"
        >
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {/* Pulse animation */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping"></span>
        </button>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75"
            onClick={() => setShowChat(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 shadow-xl">
            <div className="h-full flex flex-col">
              <ChatInterface
                contractId={contractId!}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContractDetail;
