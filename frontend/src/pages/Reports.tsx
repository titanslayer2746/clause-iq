import { useState } from "react";
import api from "../api/client";

const Reports = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string, format: string) => {
    setLoading(`${type}-${format}`);
    try {
      let endpoint = "";

      if (format === "csv") {
        endpoint = type === "contracts" ? "/reports/export/contracts" : "/reports/export/tasks";
      } else if (format === "pdf") {
        endpoint = `/reports/pdf/${type}`;
      }

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}-${format === "pdf" ? "report" : "export"}-${Date.now()}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to export ${type}`);
    } finally {
      setLoading(null);
    }
  };

  const reportTypes = [
    {
      id: "status",
      title: "Status Report",
      description: "Summary of contract statuses",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      formats: ["pdf"],
    },
    {
      id: "risk",
      title: "Risk Analysis Report",
      description: "High-risk contracts and analysis",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      formats: ["pdf"],
    },
    {
      id: "compliance",
      title: "Compliance Report",
      description: "Playbook compliance summary",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      formats: ["pdf"],
    },
    {
      id: "contracts",
      title: "Contracts Export",
      description: "All contract data",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      formats: ["csv"],
    },
    {
      id: "tasks",
      title: "Tasks Export",
      description: "All task data",
      icon: (
        <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      formats: ["csv"],
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-black mb-2">
            REPORTS & <span className="text-yellow-600">EXPORT</span>
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            Generate reports and export data for analysis
          </p>
        </div>
        
        {/* Quick Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("contracts", "csv")}
            disabled={loading === "contracts-csv"}
            className="inline-flex items-center px-6 py-3 border-2 border-black rounded-lg font-black text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition transform hover:scale-105 disabled:transform-none shadow-md"
          >
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {loading === "contracts-csv" ? "EXPORTING..." : "EXPORT ALL CONTRACTS"}
          </button>
          <button
            onClick={() => handleExport("tasks", "csv")}
            disabled={loading === "tasks-csv"}
            className="inline-flex items-center px-6 py-3 border-2 border-black rounded-lg font-black text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition transform hover:scale-105 disabled:transform-none shadow-md"
          >
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {loading === "tasks-csv" ? "EXPORTING..." : "EXPORT ALL TASKS"}
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border-4 border-black p-6 hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400 rounded-bl-full opacity-10"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-black rounded-lg flex items-center justify-center mr-4">
                  {report.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-black">
                    {report.title.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">{report.description}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {report.formats.includes("pdf") && (
                  <button
                    onClick={() => handleExport(report.id, "pdf")}
                    disabled={loading === `${report.id}-pdf`}
                    className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-black rounded-lg text-sm font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition transform hover:scale-105 disabled:transform-none shadow-md"
                  >
                    {loading === `${report.id}-pdf` ? (
                      <svg
                        className="animate-spin h-5 w-5"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        PDF
                      </>
                    )}
                  </button>
                )}
                {report.formats.includes("csv") && (
                  <button
                    onClick={() => handleExport(report.id, "csv")}
                    disabled={loading === `${report.id}-csv`}
                    className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-black rounded-lg text-sm font-black text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition transform hover:scale-105 disabled:transform-none shadow-md"
                  >
                    {loading === `${report.id}-csv` ? (
                      <svg
                        className="animate-spin h-5 w-5"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        CSV
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;

