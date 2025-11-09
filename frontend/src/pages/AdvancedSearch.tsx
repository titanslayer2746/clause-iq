import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState({
    query: "",
    status: "",
    riskLevel: "",
    tags: "",
    vendor: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    clauseType: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params: any = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.get("/search/advanced", { params });
      setResults(response.data.data.contracts || []);
    } catch (error: any) {
      alert(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      query: "",
      status: "",
      riskLevel: "",
      tags: "",
      vendor: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      clauseType: "",
    });
    setResults([]);
    setSearched(false);
  };

  const getRiskBadge = (score?: number) => {
    if (!score) return <span className="text-gray-500">-</span>;

    let colorClass = "text-green-500";
    let label = "Low";

    if (score >= 70) {
      colorClass = "text-red-500";
      label = "High";
    } else if (score >= 40) {
      colorClass = "text-yellow-400";
      label = "Medium";
    }

    return (
      <span className={`font-black ${colorClass}`}>
        {score} ({label})
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black">
          ADVANCED <span className="text-yellow-400">SEARCH</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 font-bold uppercase">
          Search contracts with complex filters and criteria
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border-4 border-black shadow-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Keyword Search
            </label>
            <input
              type="text"
              value={searchParams.query}
              onChange={(e) =>
                setSearchParams({ ...searchParams, query: e.target.value })
              }
              placeholder="Search in title and description..."
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Status
            </label>
            <select
              value={searchParams.status}
              onChange={(e) =>
                setSearchParams({ ...searchParams, status: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Risk Level
            </label>
            <select
              value={searchParams.riskLevel}
              onChange={(e) =>
                setSearchParams({ ...searchParams, riskLevel: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="low">Low (0-39)</option>
              <option value="medium">Medium (40-69)</option>
              <option value="high">High (70+)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Vendor
            </label>
            <input
              type="text"
              value={searchParams.vendor}
              onChange={(e) =>
                setSearchParams({ ...searchParams, vendor: e.target.value })
              }
              placeholder="Vendor name..."
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={searchParams.tags}
              onChange={(e) =>
                setSearchParams({ ...searchParams, tags: e.target.value })
              }
              placeholder="urgent, legal, review"
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Clause Type
            </label>
            <input
              type="text"
              value={searchParams.clauseType}
              onChange={(e) =>
                setSearchParams({ ...searchParams, clauseType: e.target.value })
              }
              placeholder="e.g., Termination, Liability"
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, startDate: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              End Date
            </label>
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, endDate: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Min Amount
            </label>
            <input
              type="number"
              value={searchParams.minAmount}
              onChange={(e) =>
                setSearchParams({ ...searchParams, minAmount: e.target.value })
              }
              placeholder="0"
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
              Max Amount
            </label>
            <input
              type="number"
              value={searchParams.maxAmount}
              onChange={(e) =>
                setSearchParams({ ...searchParams, maxAmount: e.target.value })
              }
              placeholder="1000000"
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md text-sm focus:border-yellow-400 focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border-2 border-black rounded-md text-sm font-bold text-black hover:bg-gray-100 uppercase"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black border-2 border-black text-yellow-400 rounded-md text-sm font-black hover:bg-gray-900 disabled:opacity-50 uppercase transform hover:scale-105 transition-transform"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-12 text-center">
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
          <p className="mt-4 text-black font-bold uppercase">Searching...</p>
        </div>
      ) : searched ? (
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-black text-black uppercase">
              Search Results ({results.length})
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-gray-600 font-bold uppercase">
                No contracts found matching your criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-black text-black uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-black">
                          {contract.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {contract.vendor || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-400 text-black uppercase">
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getRiskBadge(contract.riskScore)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contract.tags?.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {contract.tags?.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{contract.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="text-yellow-600 hover:text-yellow-700 font-bold uppercase"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="mt-4 text-gray-600 font-bold uppercase">
            Set your search criteria above and click Search
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

